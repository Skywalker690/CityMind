import { z } from "zod";

import { getServerConfig } from "@/lib/config";
import { DEFAULT_LOCATION, MAP_REQUEST_TIMEOUT_MS } from "@/lib/constants";
import { fetchWithTimeout } from "@/lib/network";
import { createFallbackRoute } from "@/services/fallbackData";
import type {
  Coordinates,
  Destination,
  DestinationInput,
  DestinationResolution,
  RouteSummary
} from "@/types/map";
import type { PersonaId } from "@/types/persona";

const GOOGLE_PLACES_TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const GOOGLE_WALKING_DIRECTIONS_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";
const GOOGLE_PLACES_FIELD_MASK =
  "places.displayName,places.formattedAddress,places.location";
const GOOGLE_ROUTES_FIELD_MASK = [
  "routes.distanceMeters",
  "routes.duration",
  "routes.polyline.encodedPolyline",
  "routes.legs.steps.distanceMeters",
  "routes.legs.steps.staticDuration",
  "routes.legs.steps.navigationInstruction.instructions"
].join(",");

const osrmRouteResponseSchema = z
  .object({
    code: z.string().optional(),
    routes: z
      .array(
        z
          .object({
            distance: z.number().finite().nonnegative(),
            duration: z.number().finite().nonnegative(),
            geometry: z.object({
              coordinates: z.array(z.tuple([z.number().finite(), z.number().finite()])).min(2)
            }),
            legs: z
              .array(
                z
                  .object({
                    steps: z
                      .array(
                        z
                          .object({
                            maneuver: z
                              .object({
                                instruction: z.string().optional(),
                                modifier: z.string().optional(),
                                type: z.string().optional()
                              })
                              .optional(),
                            name: z.string().optional(),
                            distance: z.number().finite().nonnegative().optional(),
                            duration: z.number().finite().nonnegative().optional()
                          })
                          .passthrough()
                      )
                      .optional()
                  })
                  .passthrough()
              )
              .optional()
          })
          .passthrough()
      )
      .optional()
  })
  .passthrough();

const googlePlacesTextSearchResponseSchema = z
  .object({
    places: z
      .array(
        z
          .object({
            displayName: z
              .object({
                text: z.string().optional()
              })
              .optional(),
            formattedAddress: z.string().optional(),
            location: z
              .object({
                latitude: z.number().finite(),
                longitude: z.number().finite()
              })
              .optional()
          })
          .passthrough()
      )
      .default([])
  })
  .passthrough();

const googleRoutesResponseSchema = z
  .object({
    routes: z
      .array(
        z
          .object({
            distanceMeters: z.number().finite().nonnegative(),
            duration: z.string(),
            polyline: z.object({
              encodedPolyline: z.string().min(1)
            }),
            legs: z
              .array(
                z
                  .object({
                    steps: z
                      .array(
                        z
                          .object({
                            distanceMeters: z.number().finite().nonnegative().optional(),
                            staticDuration: z.string().optional(),
                            navigationInstruction: z
                              .object({
                                instructions: z.string().optional()
                              })
                              .optional()
                          })
                          .passthrough()
                      )
                      .optional()
                  })
                  .passthrough()
              )
              .optional()
          })
          .passthrough()
      )
      .default([])
  })
  .passthrough();

type OsrmRoute = NonNullable<z.infer<typeof osrmRouteResponseSchema>["routes"]>[number];
type OsrmRouteStep = NonNullable<NonNullable<OsrmRoute["legs"]>[number]["steps"]>[number];
type GooglePlace = z.infer<typeof googlePlacesTextSearchResponseSchema>["places"][number];
type GoogleRoute = z.infer<typeof googleRoutesResponseSchema>["routes"][number];
type GoogleRouteStep = NonNullable<NonNullable<GoogleRoute["legs"]>[number]["steps"]>[number];

export interface GenerateRouteInput {
  origin?: Coordinates;
  destination?: Coordinates | DestinationInput;
  destinationQuery?: string;
  userPrompt?: string;
  persona: PersonaId;
}

export interface RouteGenerationResult {
  route?: RouteSummary;
  destination?: Destination;
  destinationResolution: DestinationResolution;
  warnings: string[];
}

export async function generateRoute(input: GenerateRouteInput): Promise<RouteGenerationResult> {
  const origin = input.origin ?? DEFAULT_LOCATION;
  const originLabel = input.origin ? "Current location" : "Reference location";
  const destinationResolution = await resolveDestination({
    destination: input.destination,
    destinationQuery: input.destinationQuery,
    userPrompt: input.userPrompt,
    origin
  });

  if (destinationResolution.status !== "resolved" || !destinationResolution.destination) {
    return {
      destinationResolution,
      warnings: destinationResolution.message ? [destinationResolution.message] : []
    };
  }

  const route = await requestWalkingRoute({
    origin,
    originLabel,
    destination: destinationResolution.destination
  });

  return {
    route,
    destination: destinationResolution.destination,
    destinationResolution,
    warnings: route.warnings
  };
}

export async function resolveDestination(input: {
  destination?: Coordinates | DestinationInput;
  destinationQuery?: string;
  userPrompt?: string;
  origin: Coordinates;
}): Promise<DestinationResolution> {
  const explicitDestination = destinationFromCoordinates(input.destination);

  if (explicitDestination) {
    return {
      status: "resolved",
      destination: explicitDestination
    };
  }

  const query =
    normalizeDestinationQuery(input.destinationQuery) ??
    destinationLabel(input.destination) ??
    extractDestinationQuery(input.userPrompt);

  if (!query) {
    return {
      status: "missing",
      message: "Add a destination to your question or select one on the map to prepare a route."
    };
  }

  const googleMapsApiKey = getServerConfig().googleMapsApiKey;

  if (!googleMapsApiKey) {
    return {
      status: "unavailable",
      query,
      message:
        "Destination search is unavailable, so CityMind cannot confirm a route for that place yet."
    };
  }

  try {
    const response = await fetchWithTimeout(
      GOOGLE_PLACES_TEXT_SEARCH_URL,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Goog-Api-Key": googleMapsApiKey,
          "X-Goog-FieldMask": GOOGLE_PLACES_FIELD_MASK
        },
        body: JSON.stringify({
          textQuery: query,
          pageSize: 1,
          languageCode: "en",
          locationBias: {
            circle: {
              center: toGoogleLatLng(input.origin),
              radius: 50_000
            }
          }
        })
      },
      MAP_REQUEST_TIMEOUT_MS,
      "Destination search"
    );

    if (!response.ok) {
      return unavailableDestinationResolution(query);
    }

    const parsedResponse = googlePlacesTextSearchResponseSchema.safeParse(await response.json());
    const place = parsedResponse.success ? parsedResponse.data.places[0] : undefined;
    const coordinates = place?.location;

    if (!coordinates || !areValidCoordinates(coordinates.latitude, coordinates.longitude)) {
      return {
        status: "not-found",
        query,
        message:
          "CityMind could not confidently find that destination. Try a more specific place name or select a location on the map."
      };
    }

    return {
      status: "resolved",
      destination: {
        label: getGooglePlaceLabel(place, query),
        coordinates,
        source: "google-places",
        query
      }
    };
  } catch {
    return unavailableDestinationResolution(query);
  }
}

export function extractDestinationQuery(userPrompt?: string) {
  if (!userPrompt) {
    return undefined;
  }

  const patterns = [
    /\b(?:get|go|head|walk|navigate|route|travel|commute)\s+(?:me\s+)?to\s+([^?.!,;]+)/i,
    /\b(?:travel(?:ling)?|commut(?:e|ing)|going|heading|walking|navigating)\b(?:\s+[\w'-]+){0,6}?\s+to\s+([^?.!,;]+)/i,
    /\b(?:reach|visit)\s+([^?.!,;]+)/i
  ];

  for (const pattern of patterns) {
    const match = userPrompt.match(pattern);
    const query = normalizeDestinationQuery(match?.[1]);

    if (query && !isGenericDestinationReference(query)) {
      return query;
    }
  }

  return undefined;
}

async function requestWalkingRoute(input: {
  origin: Coordinates;
  originLabel: string;
  destination: Destination;
}): Promise<RouteSummary> {
  const config = getServerConfig();

  if (config.googleMapsApiKey) {
    const googleRoute = await requestGoogleWalkingRoute({
      ...input,
      apiKey: config.googleMapsApiKey
    });

    if (googleRoute) {
      return googleRoute;
    }
  }

  if (config.osrmBaseUrl) {
    const osrmRoute = await requestOsrmWalkingRoute({
      ...input,
      baseUrl: config.osrmBaseUrl
    });

    if (osrmRoute) {
      return osrmRoute;
    }
  }

  return createFallbackRoute({
    ...input,
    reason:
      "Live walking directions could not be confirmed. This is an estimated map guide, not a verified walking route."
  });
}

async function requestGoogleWalkingRoute(input: {
  origin: Coordinates;
  originLabel: string;
  destination: Destination;
  apiKey: string;
}): Promise<RouteSummary | undefined> {
  try {
    const response = await fetchWithTimeout(
      GOOGLE_WALKING_DIRECTIONS_URL,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Goog-Api-Key": input.apiKey,
          "X-Goog-FieldMask": GOOGLE_ROUTES_FIELD_MASK
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: toGoogleLatLng(input.origin)
            }
          },
          destination: {
            location: {
              latLng: toGoogleLatLng(input.destination.coordinates)
            }
          },
          travelMode: "WALK",
          polylineQuality: "HIGH_QUALITY",
          polylineEncoding: "ENCODED_POLYLINE",
          languageCode: "en",
          units: "METRIC"
        })
      },
      MAP_REQUEST_TIMEOUT_MS,
      "Walking route request"
    );

    if (!response.ok) {
      return undefined;
    }

    const parsedResponse = googleRoutesResponseSchema.safeParse(await response.json());
    const route = parsedResponse.success ? parsedResponse.data.routes[0] : undefined;
    const geometry = route ? decodeGooglePolyline(route.polyline.encodedPolyline) : undefined;
    const durationSeconds = route ? parseGoogleDurationSeconds(route.duration) : undefined;

    if (!route || !geometry || durationSeconds === undefined) {
      return undefined;
    }

    return toGoogleRouteSummary({
      origin: input.origin,
      originLabel: input.originLabel,
      destination: input.destination,
      route,
      geometry,
      durationSeconds
    });
  } catch {
    return undefined;
  }
}

async function requestOsrmWalkingRoute(input: {
  origin: Coordinates;
  originLabel: string;
  destination: Destination;
  baseUrl: string;
}): Promise<RouteSummary | undefined> {
  try {
    const baseUrl = input.baseUrl.replace(/\/$/, "");
    const coordinatePath = createCoordinatePath(input.origin, input.destination.coordinates);
    const url = new URL(`${baseUrl}/route/v1/foot/${coordinatePath}`);
    url.searchParams.set("geometries", "geojson");
    url.searchParams.set("steps", "true");
    url.searchParams.set("overview", "full");

    const response = await fetchWithTimeout(
      url,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json"
        }
      },
      MAP_REQUEST_TIMEOUT_MS,
      "Walking route request"
    );

    if (!response.ok) {
      return undefined;
    }

    const parsedResponse = osrmRouteResponseSchema.safeParse(await response.json());
    const route = parsedResponse.success ? parsedResponse.data.routes?.[0] : undefined;

    if (
      !route ||
      (parsedResponse.success &&
        parsedResponse.data.code !== undefined &&
        parsedResponse.data.code !== "Ok") ||
      !hasValidGeometry(route.geometry.coordinates)
    ) {
      return undefined;
    }

    return toOsrmRouteSummary({
      origin: input.origin,
      originLabel: input.originLabel,
      destination: input.destination,
      route
    });
  } catch {
    return undefined;
  }
}

function toGoogleRouteSummary(input: {
  origin: Coordinates;
  originLabel: string;
  destination: Destination;
  route: GoogleRoute;
  geometry: Coordinates[];
  durationSeconds: number;
}): RouteSummary {
  return createRoutedSummary({
    origin: input.origin,
    originLabel: input.originLabel,
    destination: input.destination,
    source: "google",
    distanceMeters: input.route.distanceMeters,
    durationSeconds: input.durationSeconds,
    geometry: input.geometry,
    steps:
      input.route.legs?.flatMap(
        (leg) =>
          leg.steps?.map((step) => ({
            instruction: getGoogleStepInstruction(step),
            distanceMeters: step.distanceMeters ?? 0,
            durationSeconds: parseGoogleDurationSeconds(step.staticDuration) ?? 0
          })) ?? []
      ) ?? []
  });
}

function toOsrmRouteSummary(input: {
  origin: Coordinates;
  originLabel: string;
  destination: Destination;
  route: OsrmRoute;
}): RouteSummary {
  const geometry = input.route.geometry.coordinates.map(([longitude, latitude]) => ({
    latitude,
    longitude
  }));

  return createRoutedSummary({
    origin: input.origin,
    originLabel: input.originLabel,
    destination: input.destination,
    source: "osrm",
    distanceMeters: input.route.distance,
    durationSeconds: input.route.duration,
    geometry,
    steps:
      input.route.legs?.flatMap(
        (leg) =>
          leg.steps?.map((step) => ({
            instruction: formatOsrmInstruction(step),
            distanceMeters: step.distance ?? 0,
            durationSeconds: step.duration ?? 0
          })) ?? []
      ) ?? []
  });
}

function createRoutedSummary(input: {
  origin: Coordinates;
  originLabel: string;
  destination: Destination;
  source: "google" | "osrm";
  distanceMeters: number;
  durationSeconds: number;
  geometry: Coordinates[];
  steps: RouteSummary["steps"];
}): RouteSummary {
  const accessibilityWarning =
    "Walking directions do not verify step-free access, elevators, ramps, surface conditions, or temporary closures.";

  return {
    origin: {
      label: input.originLabel,
      coordinates: input.origin,
      type: "origin"
    },
    destination: {
      label: input.destination.label,
      coordinates: input.destination.coordinates,
      type: "destination"
    },
    waypoints: [],
    distanceMeters: input.distanceMeters,
    durationSeconds: input.durationSeconds,
    accessible: false,
    travelMode: "walking",
    source: input.source,
    status: "routed",
    accessibility: {
      status: "unknown",
      verified: false,
      evidence: [],
      warnings: [accessibilityWarning]
    },
    geometry: input.geometry,
    geometryGeoJson: {
      type: "LineString",
      coordinates: input.geometry.map(({ longitude, latitude }) => [longitude, latitude])
    },
    steps: input.steps,
    warnings: [accessibilityWarning]
  };
}

function destinationFromCoordinates(
  destination?: Coordinates | DestinationInput
): Destination | undefined {
  const coordinates = isCoordinates(destination) ? destination : destination?.coordinates;

  if (!coordinates) {
    return undefined;
  }

  return {
    label:
      (!isCoordinates(destination) ? normalizeDestinationQuery(destination?.label) : undefined) ??
      "Selected destination",
    coordinates,
    source: "explicit-coordinates"
  };
}

function destinationLabel(destination?: Coordinates | DestinationInput) {
  if (isCoordinates(destination)) {
    return undefined;
  }

  return normalizeDestinationQuery(destination?.label);
}

function isCoordinates(destination?: Coordinates | DestinationInput): destination is Coordinates {
  return Boolean(destination && "latitude" in destination && "longitude" in destination);
}

function normalizeDestinationQuery(value?: string) {
  const query = value?.replace(/\s+/g, " ").trim();

  if (!query || query.length < 2 || query.length > 160) {
    return undefined;
  }

  return query.replace(/\s+(?:please|today|now|from\s+here|with\s+.+|for\s+.+|via\s+.+)$/i, "");
}

function isGenericDestinationReference(query: string) {
  return ["there", "my destination", "the destination", "here", "it"].includes(query.toLowerCase());
}

function unavailableDestinationResolution(query: string): DestinationResolution {
  return {
    status: "unavailable",
    query,
    message:
      "Destination search is temporarily unavailable, so CityMind cannot confirm a route right now."
  };
}

function toGoogleLatLng(coordinates: Coordinates) {
  return {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude
  };
}

function getGooglePlaceLabel(place: GooglePlace, fallbackQuery: string) {
  return place.displayName?.text?.trim() || place.formattedAddress?.trim() || fallbackQuery;
}

function parseGoogleDurationSeconds(value?: string) {
  if (!value) {
    return undefined;
  }

  const match = /^(\d+(?:\.\d+)?)s$/.exec(value);
  const seconds = match?.[1] ? Number(match[1]) : Number.NaN;

  return Number.isFinite(seconds) && seconds >= 0 ? Math.round(seconds) : undefined;
}

function decodeGooglePolyline(encoded: string): Coordinates[] | undefined {
  const points: Coordinates[] = [];
  let latitude = 0;
  let longitude = 0;
  let index = 0;

  while (index < encoded.length) {
    const latitudeDelta = decodePolylineDelta(encoded, index);

    if (!latitudeDelta) {
      return undefined;
    }

    const longitudeDelta = decodePolylineDelta(encoded, latitudeDelta.nextIndex);

    if (!longitudeDelta) {
      return undefined;
    }

    latitude += latitudeDelta.value;
    longitude += longitudeDelta.value;
    const point = {
      latitude: latitude / 100_000,
      longitude: longitude / 100_000
    };

    if (!areValidCoordinates(point.latitude, point.longitude)) {
      return undefined;
    }

    points.push(point);
    index = longitudeDelta.nextIndex;
  }

  return points.length >= 2 ? points : undefined;
}

function decodePolylineDelta(encoded: string, startIndex: number) {
  let index = startIndex;
  let result = 0;
  let shift = 0;

  while (index < encoded.length) {
    const byte = encoded.charCodeAt(index) - 63;
    index += 1;

    if (byte < 0 || byte > 63 || shift > 30) {
      return undefined;
    }

    result += (byte & 0x1f) * 2 ** shift;
    shift += 5;

    if (byte < 0x20) {
      return {
        value: result & 1 ? -(Math.floor(result / 2) + 1) : Math.floor(result / 2),
        nextIndex: index
      };
    }
  }

  return undefined;
}

function areValidCoordinates(latitude: number, longitude: number) {
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

function hasValidGeometry(coordinates: [number, number][]) {
  return coordinates.every(([longitude, latitude]) => areValidCoordinates(latitude, longitude));
}

function createCoordinatePath(origin: Coordinates, destination: Coordinates) {
  return [origin, destination]
    .map(({ longitude, latitude }) => `${longitude},${latitude}`)
    .join(";");
}

function getGoogleStepInstruction(step: GoogleRouteStep) {
  return step.navigationInstruction?.instructions?.trim() || "Continue on the walking route.";
}

function formatOsrmInstruction(step: OsrmRouteStep) {
  const providerInstruction = step.maneuver?.instruction?.trim();

  if (providerInstruction) {
    return providerInstruction;
  }

  const type = step.maneuver?.type?.replace(/_/g, " ") ?? "continue";
  const modifier = step.maneuver?.modifier?.replace(/_/g, " ");
  const roadName = step.name?.trim();
  const action = toSentenceCase([type, modifier].filter(Boolean).join(" "));

  if (roadName) {
    return `${action} onto ${roadName}.`;
  }

  return `${action} on the route.`;
}

function toSentenceCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
