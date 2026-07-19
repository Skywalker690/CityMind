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

const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const COMMUNITY_FOOT_ROUTER_BASE_URL = "https://routing.openstreetmap.de/routed-foot";
const OSRM_FOOT_PROFILE = "driving";
const NOMINATIM_REQUEST_INTERVAL_MS = 1_000;
const NOMINATIM_USER_AGENT = "CityMind/1.0 (OpenStreetMap urban mobility demo)";

let nextNominatimRequestAt = 0;

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

const nominatimSearchResponseSchema = z.array(
  z
    .object({
      display_name: z.string().optional(),
      lat: z.string(),
      lon: z.string()
    })
    .passthrough()
);

type OsrmRoute = NonNullable<z.infer<typeof osrmRouteResponseSchema>["routes"]>[number];
type OsrmRouteStep = NonNullable<NonNullable<OsrmRoute["legs"]>[number]["steps"]>[number];

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

  try {
    await waitForNominatimRequestSlot();
    const url = new URL(NOMINATIM_SEARCH_URL);
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("addressdetails", "0");
    url.searchParams.set("viewbox", createNominatimViewbox(input.origin));

    const response = await fetchWithTimeout(
      url,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "User-Agent": NOMINATIM_USER_AGENT
        }
      },
      MAP_REQUEST_TIMEOUT_MS,
      "Destination search"
    );

    if (!response.ok) {
      return unavailableDestinationResolution(query);
    }

    const parsedResponse = nominatimSearchResponseSchema.safeParse(await response.json());
    const result = parsedResponse.success ? parsedResponse.data[0] : undefined;
    const coordinates = result ? toCoordinates(result.lat, result.lon) : undefined;

    if (!coordinates) {
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
        label: result?.display_name?.trim() || query,
        coordinates,
        source: "nominatim",
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
  const configuredBaseUrl = getServerConfig().osrmBaseUrl;
  const route = await requestOsrmWalkingRoute({
    ...input,
    baseUrl: configuredBaseUrl ?? COMMUNITY_FOOT_ROUTER_BASE_URL
  });

  if (route) {
    return route;
  }

  return createFallbackRoute({
    ...input,
    reason:
      "Live OpenStreetMap walking directions could not be confirmed. This is an estimated map guide, not a verified walking route."
  });
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
    const url = new URL(`${baseUrl}/route/v1/${OSRM_FOOT_PROFILE}/${coordinatePath}`);
    url.searchParams.set("geometries", "geojson");
    url.searchParams.set("steps", "true");
    url.searchParams.set("overview", "full");

    const response = await fetchWithTimeout(
      url,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "User-Agent": NOMINATIM_USER_AGENT
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
    distanceMeters: input.route.distance,
    durationSeconds: input.route.duration,
    accessible: false,
    travelMode: "walking",
    source: "osrm",
    status: "routed",
    accessibility: {
      status: "unknown",
      verified: false,
      evidence: [],
      warnings: [accessibilityWarning]
    },
    geometry,
    geometryGeoJson: {
      type: "LineString",
      coordinates: input.route.geometry.coordinates
    },
    steps:
      input.route.legs?.flatMap(
        (leg) =>
          leg.steps?.map((step) => ({
            instruction: formatOsrmInstruction(step),
            distanceMeters: step.distance ?? 0,
            durationSeconds: step.duration ?? 0
          })) ?? []
      ) ?? [],
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
      "OpenStreetMap destination search is temporarily unavailable, so CityMind cannot confirm a route right now."
  };
}

function createNominatimViewbox(origin: Coordinates) {
  const delta = 0.5;
  return [
    origin.longitude - delta,
    origin.latitude + delta,
    origin.longitude + delta,
    origin.latitude - delta
  ].join(",");
}

function toCoordinates(latitudeValue: string, longitudeValue: string): Coordinates | undefined {
  const latitude = Number(latitudeValue);
  const longitude = Number(longitudeValue);

  return areValidCoordinates(latitude, longitude) ? { latitude, longitude } : undefined;
}

async function waitForNominatimRequestSlot() {
  const now = Date.now();
  const scheduledAt = Math.max(now, nextNominatimRequestAt);
  nextNominatimRequestAt = scheduledAt + NOMINATIM_REQUEST_INTERVAL_MS;

  if (scheduledAt > now) {
    await new Promise<void>((resolve) => setTimeout(resolve, scheduledAt - now));
  }
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
