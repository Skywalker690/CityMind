import { DEFAULT_DESTINATION, DEFAULT_LOCATION } from "@/lib/constants";
import { getServerConfig } from "@/lib/config";
import { createFallbackRoute } from "@/services/fallbackData";
import type { Coordinates, RouteSummary } from "@/types/map";
import type { PersonaId } from "@/types/persona";

interface OsrmStep {
  maneuver?: {
    modifier?: string;
    type?: string;
  };
  name?: string;
  distance?: number;
  duration?: number;
}

interface OsrmRouteResponse {
  code?: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: [number, number][];
    };
    legs?: Array<{
      steps?: OsrmStep[];
    }>;
  }>;
}

export async function generateRoute(input: {
  origin?: Coordinates;
  destination?: Coordinates;
  persona: PersonaId;
}): Promise<RouteSummary> {
  const origin = input.origin ?? DEFAULT_LOCATION;
  const destination = input.destination ?? DEFAULT_DESTINATION;
  const baseUrl = getServerConfig().osrmBaseUrl.replace(/\/$/, "");

  const url = new URL(
    `${baseUrl}/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`
  );
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("steps", "true");
  url.searchParams.set("overview", "full");

  try {
    const response = await fetch(url, {
      next: {
        revalidate: 60
      }
    });

    if (!response.ok) {
      return createFallbackRoute(origin, destination, input.persona);
    }

    const data = (await response.json()) as OsrmRouteResponse;
    const route = data.routes?.[0];

    if (data.code !== "Ok" || !route) {
      return createFallbackRoute(origin, destination, input.persona);
    }

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
        label: "Suggested destination",
        coordinates: destination,
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
        status: "unverified",
        verified: false,
        evidence: [
          "OSRM provided walkable route geometry and step timing, but not verified accessibility infrastructure."
        ],
        warnings:
          input.persona === "wheelchair" ||
          input.persona === "elderly" ||
          input.persona === "luggage"
            ? [
                "Confirm elevators, ramps, curb cuts, and temporary closures before committing to this route."
              ]
            : []
      },
      geometry: route.geometry.coordinates.map(([longitude, latitude]) => ({
        latitude,
        longitude
      })),
      geometryGeoJson: {
        type: "LineString",
        coordinates: route.geometry.coordinates
      },
      steps,
      warnings: [
        "Accessibility is not verified by OSRM; use CityMind's recommendation as decision support."
      ]
    };
  } catch {
    return createFallbackRoute(origin, destination, input.persona);
  }
}

function formatOsrmInstruction(step: OsrmStep) {
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
