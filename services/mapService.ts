import { z } from "zod";

import { DEFAULT_LOCATION, MAP_REQUEST_TIMEOUT_MS } from "@/lib/constants";
import { getServerConfig } from "@/lib/config";
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

const MAPBOX_FORWARD_GEOCODING_URL =
  "https://api.mapbox.com/search/geocode/v6/forward";

const osrmRouteResponseSchema = z
  .object({
    code: z.string().optional(),
    routes: z
      .array(
        z
          .object({
            distance: z.number().nonnegative(),
            duration: z.number().nonnegative(),
            geometry: z.object({
              coordinates: z.array(z.tuple([z.number(), z.number()])).min(2)
            }),
            legs: z
              .array(
                z.object({
                  steps: z
                    .array(
                      z.object({
                        maneuver: z
                          .object({
                            modifier: z.string().optional(),
                            type: z.string().optional()
                          })
                          .optional(),
                        name: z.string().optional(),
                        distance: z.number().nonnegative().optional(),
                        duration: z.number().nonnegative().optional()
                      })
                    )
                    .optional()
                })
              )
              .optional()
          })
          .passthrough()
      )
      .optional()
  })
  .passthrough();

const mapboxGeocodingResponseSchema = z
  .object({
    features: z
      .array(
        z
          .object({
            geometry: z
              .object({
                coordinates: z.tuple([z.number(), z.number()])
              })
              .optional(),
            properties: z
              .object({
                full_address: z.string().optional(),
                name: z.string().optional(),
                name_preferred: z.string().optional(),
                place_formatted: z.string().optional()
              })
              .passthrough()
              .optional(),
            place_name: z.string().optional(),
            text: z.string().optional()
          })
          .passthrough()
      )
      .default([])
  })
  .passthrough();

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

export async function generateRoute(
  input: GenerateRouteInput
): Promise<RouteGenerationResult> {
  const origin = input.origin ?? DEFAULT_LOCATION;
  const destinationResolution = await resolveDestination({
    destination: input.destination,
    destinationQuery: input.destinationQuery,
    userPrompt: input.userPrompt,
    origin
  });

  if (
    destinationResolution.status !== "resolved" ||
    !destinationResolution.destination
  ) {
    return {
      destinationResolution,
      warnings: destinationResolution.message ? [destinationResolution.message] : []
    };
  }

  const route = await requestWalkingRoute(origin, destinationResolution.destination);

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
      message:
        "Add a destination to your question or select one on the map to prepare a route."
    };
  }

  const mapboxAccessToken = getServerConfig().mapboxAccessToken;

  if (!mapboxAccessToken) {
    return {
      status: "unavailable",
      query,
      message:
        "Destination search is unavailable, so CityMind cannot confirm a route for that place yet."
    };
  }

  try {
    const url = new URL(MAPBOX_FORWARD_GEOCODING_URL);
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "1");
    url.searchParams.set("proximity", `${input.origin.longitude},${input.origin.latitude}`);
    url.searchParams.set("access_token", mapboxAccessToken);

    const response = await fetchWithTimeout(
      url,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json"
        }
      },
      MAP_REQUEST_TIMEOUT_MS,
      "Destination search"
    );

    if (!response.ok) {
      return {
        status: "unavailable",
        query,
        message:
          "Destination search is temporarily unavailable, so CityMind cannot confirm a route right now."
      };
    }

    const parsedResponse = mapboxGeocodingResponseSchema.safeParse(
      await response.json()
    );
    const feature = parsedResponse.success ? parsedResponse.data.features[0] : undefined;
    const coordinates = feature?.geometry?.coordinates;

    if (!coordinates || !areValidCoordinates(coordinates[1], coordinates[0])) {
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
        label: getDestinationLabel(feature, query),
        coordinates: {
          latitude: coordinates[1],
          longitude: coordinates[0]
        },
        source: "mapbox-geocoding",
        query
      }
    };
  } catch {
    return {
      status: "unavailable",
      query,
      message:
        "Destination search is temporarily unavailable, so CityMind cannot confirm a route right now."
    };
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

async function requestWalkingRoute(
  origin: Coordinates,
  destination: Destination
): Promise<RouteSummary> {
  try {
    const baseUrl = getServerConfig().osrmBaseUrl.replace(/\/$/, "");
    const url = new URL(
      `${baseUrl}/route/v1/foot/${origin.longitude},${origin.latitude};${destination.coordinates.longitude},${destination.coordinates.latitude}`
    );
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
      return createFallbackRoute({
        origin,
        destination,
        reason:
          "Live walking directions are temporarily unavailable. This is an estimated map guide, not a verified walking route."
      });
    }

    const parsedResponse = osrmRouteResponseSchema.safeParse(await response.json());
    const route = parsedResponse.success ? parsedResponse.data.routes?.[0] : undefined;

    if (parsedResponse.data?.code !== "Ok" || !route) {
      return createFallbackRoute({
        origin,
        destination,
        reason:
          "Live walking directions could not be confirmed. This is an estimated map guide, not a verified walking route."
      });
    }

    const geometry = route.geometry.coordinates.map(([longitude, latitude]) => ({
      latitude,
      longitude
    }));
    const accessibilityWarning =
      "Walking directions do not verify step-free access, elevators, ramps, surface conditions, or temporary closures.";
    const warnings = [accessibilityWarning];
    const steps =
      route.legs?.flatMap(
        (leg) =>
          leg.steps?.map((step) => ({
            instruction: formatOsrmInstruction(step),
            distanceMeters: step.distance ?? 0,
            durationSeconds: step.duration ?? 0
          })) ?? []
      ) ?? [];

    return {
      origin: {
        label: "Current location",
        coordinates: origin,
        type: "origin"
      },
      destination: {
        label: destination.label,
        coordinates: destination.coordinates,
        type: "destination"
      },
      waypoints: [],
      distanceMeters: route.distance,
      durationSeconds: route.duration,
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
        coordinates: route.geometry.coordinates
      },
      steps,
      warnings
    };
  } catch {
    return createFallbackRoute({
      origin,
      destination,
      reason:
        "Live walking directions are temporarily unavailable. This is an estimated map guide, not a verified walking route."
    });
  }
}

function destinationFromCoordinates(
  destination?: Coordinates | DestinationInput
): Destination | undefined {
  const coordinates = isCoordinates(destination)
    ? destination
    : destination?.coordinates;

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

function isCoordinates(
  destination?: Coordinates | DestinationInput
): destination is Coordinates {
  return Boolean(
    destination && "latitude" in destination && "longitude" in destination
  );
}

function normalizeDestinationQuery(value?: string) {
  const query = value?.replace(/\s+/g, " ").trim();

  if (!query || query.length < 2 || query.length > 160) {
    return undefined;
  }

  return query.replace(
    /\s+(?:please|today|now|from\s+here|with\s+.+|for\s+.+|via\s+.+)$/i,
    ""
  );
}

function isGenericDestinationReference(query: string) {
  return ["there", "my destination", "the destination", "here", "it"].includes(
    query.toLowerCase()
  );
}

function areValidCoordinates(latitude: number, longitude: number) {
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

function getDestinationLabel(
  feature: z.infer<typeof mapboxGeocodingResponseSchema>["features"][number],
  fallbackQuery: string
) {
  return (
    feature.properties?.full_address ??
    feature.properties?.name_preferred ??
    feature.properties?.name ??
    feature.place_name ??
    feature.text ??
    fallbackQuery
  );
}

function formatOsrmInstruction(step: {
  maneuver?: {
    modifier?: string;
    type?: string;
  };
  name?: string;
}) {
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
