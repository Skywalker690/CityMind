import { getPersona } from "@/lib/personas";
import type { Coordinates, Destination, DestinationResolution, RouteSummary } from "@/types/map";
import type { PersonaId } from "@/types/persona";
import type { ReasoningResult, Recommendation } from "@/types/recommendation";
import type { VisionScene } from "@/types/vision";

export function createFallbackScene(location?: Coordinates): VisionScene {
  return {
    sceneType: "Metro station approach",
    summary:
      "The scene appears to be an urban transit area with station access, pedestrian paths, signage, and nearby road movement. Accessibility features should be verified on-site before relying on them.",
    landmarks: [
      {
        name: "Metro station entrance",
        type: "station",
        confidence: "medium"
      },
      {
        name: "Pedestrian access path",
        type: "road",
        confidence: "medium"
      },
      {
        name: "Station signage",
        type: "signage",
        confidence: "low"
      }
    ],
    infrastructure: [
      "station entrance",
      "pedestrian walkway",
      "road crossing",
      "public transport access"
    ],
    accessibility: [
      {
        label: "Elevator access",
        available: null,
        confidence: "low",
        evidence: "The uploaded image could not confirm elevator availability."
      },
      {
        label: "Step-free path",
        available: null,
        confidence: "low",
        evidence: "Visible ground-level paths exist, but barriers are not fully visible."
      }
    ],
    navigationCues: [
      "Use visible station signs first.",
      "Prefer marked pedestrian paths over road edges.",
      "Verify elevators or ramps before committing to the route."
    ],
    warnings: ["This is a fallback scene interpretation because live AI vision is unavailable."],
    confidence: 0.58,
    location
  };
}

export function createFallbackRoute(input: {
  origin: Coordinates;
  destination: Destination;
  reason: string;
  /** Use a reference label when the device has not supplied its location. */
  originLabel?: string;
}): RouteSummary {
  const directDistance = calculateDistanceMeters(input.origin, input.destination.coordinates);
  const distanceMeters = Math.max(1, Math.round(directDistance * 1.25));
  const durationSeconds = Math.max(60, Math.round(distanceMeters / 1.15));
  const accessibilityWarning =
    "No accessibility data source verified elevators, ramps, curb cuts, surface conditions, or closures for this estimated guide.";

  return {
    origin: {
      label: input.originLabel ?? "Reference location",
      coordinates: input.origin,
      type: "origin"
    },
    destination: {
      label: input.destination.label,
      coordinates: input.destination.coordinates,
      type: "destination"
    },
    waypoints: [],
    distanceMeters,
    durationSeconds,
    accessible: false,
    travelMode: "walking",
    source: "fallback",
    status: "estimated",
    accessibility: {
      status: "unverified",
      verified: false,
      evidence: [],
      warnings: [accessibilityWarning]
    },
    geometry: [input.origin, input.destination.coordinates],
    geometryGeoJson: {
      type: "LineString",
      coordinates: [
        [input.origin.longitude, input.origin.latitude],
        [input.destination.coordinates.longitude, input.destination.coordinates.latitude]
      ]
    },
    steps: [
      {
        instruction: `Use local pedestrian signage or a live navigation app to verify the walk to ${input.destination.label}.`,
        distanceMeters,
        durationSeconds
      }
    ],
    warnings: [input.reason, accessibilityWarning]
  };
}

function recommendationForPersona(persona: PersonaId, destination?: Destination): Recommendation {
  const profile = getPersona(persona);
  const destinationContext = destination
    ? ` toward ${destination.label}`
    : " once you choose a destination";

  if (persona === "wheelchair") {
    return {
      id: "accessible-route",
      title: "Verify the Step-Free Option",
      category: "accessibility",
      recommendation:
        "Before continuing, identify an entrance that explicitly confirms step-free access.",
      reason:
        "The available scene and route data do not verify elevators, ramps, or curb cuts, so assuming accessibility would be unsafe.",
      benefits: [
        "Avoids a stair-dependent detour",
        "Keeps accessibility evidence central to the decision",
        "Reduces the chance of backtracking"
      ],
      estimatedEffort: "Verification needed before travel",
      confidence: 0.64,
      suggestedAction: `Check official signage or ask staff for a verified step-free path${destinationContext}.`
    };
  }

  if (persona === "elderly") {
    return {
      id: "comfort-route",
      title: "Prioritize a Low-Effort Path",
      category: "accessibility",
      recommendation:
        "Choose the simplest clearly signed path, then verify whether it avoids unnecessary level changes.",
      reason:
        "Reduced walking and fewer stairs may help an elderly companion, but those conditions are not confirmed by the available data.",
      benefits: [
        "Supports a more comfortable pace",
        "Avoids relying on unverified infrastructure",
        "Encourages early verification"
      ],
      estimatedEffort: "Low to moderate after verification",
      confidence: 0.66,
      suggestedAction: `Confirm the lowest-effort entrance or route${destinationContext}.`
    };
  }

  if (persona === "luggage") {
    return {
      id: "luggage-route",
      title: "Minimize Carrying Effort",
      category: "navigation",
      recommendation:
        "Favor the clearest, wider-looking pedestrian approach and verify any elevator or escalator before relying on it.",
      reason:
        "Luggage makes stairs and narrow paths costly, while the available data cannot confirm which access features are currently usable.",
      benefits: [
        "Reduces the likelihood of a difficult detour",
        "Keeps decisions based on visible signage",
        "Avoids treating unverified elevators as available"
      ],
      estimatedEffort: "Moderate, with on-site verification",
      confidence: 0.68,
      suggestedAction: `Follow signs for the clearest pedestrian route${destinationContext}.`
    };
  }

  if (persona === "daily-commuter") {
    return {
      id: "commuter-route",
      title: "Use the Clearest Confirmed Direction",
      category: "transport",
      recommendation:
        "Follow the most legible signed pedestrian path and confirm the destination before committing to a transfer or entrance.",
      reason:
        "With live routing or destination data unavailable, a short confirmation step prevents a fast choice from becoming a detour.",
      benefits: [
        "Keeps the next action practical",
        "Limits avoidable backtracking",
        "Uses available on-site information"
      ],
      estimatedEffort: "Fast confirmation required",
      confidence: 0.65,
      suggestedAction: `Confirm the next signed route${destinationContext}.`
    };
  }

  return {
    id: "tourist-route",
    title: `${profile.shortLabel} Guidance`,
    category: "exploration",
    recommendation:
      "Orient yourself using visible signs and confirm the destination before choosing an onward route.",
    reason:
      "For an unfamiliar area, verified local information is safer than assuming a particular exit, service, or accessible entrance.",
    benefits: [
      "Reduces uncertainty",
      "Encourages a clear next step",
      "Avoids invented local details"
    ],
    estimatedEffort: "Short orientation step",
    confidence: 0.64,
    suggestedAction: destination
      ? `Use signage or staff to confirm the route to ${destination.label}.`
      : "Choose a destination to prepare a route."
  };
}

export function createFallbackReasoning(
  input: {
    scene: VisionScene;
    persona: PersonaId;
    userPrompt: string;
    location?: Coordinates;
  },
  context: {
    destination?: Destination;
    destinationResolution?: DestinationResolution;
    route?: RouteSummary;
  } = {}
): ReasoningResult {
  const resolutionWarning = context.destinationResolution?.message;

  return {
    scene: input.scene,
    intent: inferFallbackIntent(input.userPrompt),
    reasoning:
      "CityMind combined the visible context, selected persona, and question. Fallback guidance avoids claiming live infrastructure, destination, or accessibility details that could not be verified.",
    recommendations: [recommendationForPersona(input.persona, context.destination)],
    destination: context.destination,
    destinationResolution: context.destinationResolution,
    route: context.route,
    nearbyPlaces: [],
    warnings: [
      "CityMind is using fallback reasoning because live AI or routing data is unavailable.",
      ...(resolutionWarning ? [resolutionWarning] : [])
    ],
    confidence: context.destination && context.route?.status === "routed" ? 0.68 : 0.58
  };
}

function calculateDistanceMeters(origin: Coordinates, destination: Coordinates) {
  const earthRadiusMeters = 6_371_000;
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) * Math.cos(destinationLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function inferFallbackIntent(prompt: string) {
  const normalized = prompt.toLowerCase();

  if (normalized.includes("wheelchair") || normalized.includes("stairs")) {
    return "accessibility";
  }

  if (normalized.includes("visit") || normalized.includes("nearby")) {
    return "exploration";
  }

  if (normalized.includes("route") || normalized.includes("reach")) {
    return "navigation";
  }

  return "urban recommendation";
}
