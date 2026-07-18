import { DEFAULT_DESTINATION, DEFAULT_LOCATION, DEMO_DESTINATION_LABEL } from "@/lib/constants";
import { getPersona } from "@/lib/personas";
import type { Coordinates, RouteSummary } from "@/types/map";
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

export function createFallbackRoute(
  origin: Coordinates = DEFAULT_LOCATION,
  destination: Coordinates = DEFAULT_DESTINATION,
  persona: PersonaId = "tourist"
): RouteSummary {
  const accessible = persona === "wheelchair" || persona === "elderly" || persona === "luggage";

  return {
    origin: {
      label: "Current scene",
      coordinates: origin,
      type: "origin"
    },
    destination: {
      label: DEMO_DESTINATION_LABEL,
      coordinates: destination,
      type: "destination"
    },
    waypoints: [
      {
        label: accessible ? "Step-free station access" : "Station concourse",
        coordinates: {
          latitude: (origin.latitude + destination.latitude) / 2,
          longitude: (origin.longitude + destination.longitude) / 2
        },
        type: "waypoint"
      }
    ],
    distanceMeters: accessible ? 780 : 620,
    durationSeconds: accessible ? 720 : 540,
    accessible,
    travelMode: "walking",
    source: "fallback",
    status: "estimated",
    accessibility: {
      status: accessible ? "unverified" : "unknown",
      verified: false,
      evidence: accessible
        ? [
            "Fallback route prioritizes a step-free waypoint for this persona.",
            "No live accessibility data source has verified ramps or elevators."
          ]
        : [],
      warnings: ["Confirm elevators, ramps, and temporary closures before relying on this route."]
    },
    geometry: [
      origin,
      {
        latitude: (origin.latitude * 2 + destination.latitude) / 3,
        longitude: (origin.longitude * 2 + destination.longitude) / 3
      },
      {
        latitude: (origin.latitude + destination.latitude * 2) / 3,
        longitude: (origin.longitude + destination.longitude * 2) / 3
      },
      destination
    ],
    geometryGeoJson: {
      type: "LineString",
      coordinates: [
        [origin.longitude, origin.latitude],
        [
          (origin.longitude * 2 + destination.longitude) / 3,
          (origin.latitude * 2 + destination.latitude) / 3
        ],
        [
          (origin.longitude + destination.longitude * 2) / 3,
          (origin.latitude + destination.latitude * 2) / 3
        ],
        [destination.longitude, destination.latitude]
      ]
    },
    steps: [
      {
        instruction: accessible
          ? "Start with the step-free station approach and avoid stair-only entries."
          : "Move toward the visible station entrance and follow transport signage.",
        distanceMeters: accessible ? 180 : 140,
        durationSeconds: accessible ? 180 : 120
      },
      {
        instruction: accessible
          ? "Use elevator or ramp access before continuing toward the ferry connection."
          : "Continue through the concourse toward the onward transport connection.",
        distanceMeters: accessible ? 420 : 350,
        durationSeconds: accessible ? 390 : 300
      },
      {
        instruction: "Confirm the final platform, exit, or ferry boarding point on arrival.",
        distanceMeters: accessible ? 180 : 130,
        durationSeconds: accessible ? 150 : 120
      }
    ],
    warnings: ["Route is estimated from fallback geometry because live routing is unavailable."]
  };
}

function recommendationForPersona(persona: PersonaId): Recommendation {
  const profile = getPersona(persona);

  if (persona === "wheelchair") {
    return {
      id: "accessible-route",
      title: "Best Accessible Path",
      category: "accessibility",
      recommendation:
        "Use the station access path that confirms elevator or ramp availability before entering.",
      reason:
        "The image suggests a transit environment, but elevator access is not visually confirmed, so the safest wheelchair guidance is to verify the step-free entrance first.",
      benefits: [
        "Avoids stair-dependent decisions",
        "Keeps the route barrier-free",
        "Reduces the chance of backtracking"
      ],
      estimatedEffort: "Moderate, with verification needed",
      confidence: 0.68,
      suggestedAction: "Ask station staff or signage to confirm the step-free entrance."
    };
  }

  if (persona === "elderly") {
    return {
      id: "comfort-route",
      title: "Most Comfortable Route",
      category: "accessibility",
      recommendation:
        "Choose the entrance with the shortest covered walk and elevator access, even if it adds a small detour.",
      reason:
        "For an elderly companion, reduced walking, shade, and fewer level changes matter more than the absolute shortest distance.",
      benefits: ["Reduces fatigue", "Avoids stairs where possible", "Keeps the route simpler"],
      estimatedEffort: "Low to moderate",
      confidence: 0.72,
      suggestedAction: "Confirm elevator signage before moving deeper into the station."
    };
  }

  if (persona === "luggage") {
    return {
      id: "luggage-route",
      title: "Easiest With Luggage",
      category: "navigation",
      recommendation:
        "Take the wider station approach and prioritize elevator or escalator access over the shortest stair route.",
      reason:
        "Luggage makes stairs and narrow paths costly, so a slightly longer path with smoother movement is the better decision.",
      benefits: ["Less carrying effort", "Fewer stairs", "Better movement through crowds"],
      estimatedEffort: "Lower carrying effort",
      confidence: 0.76,
      suggestedAction: "Follow signs for elevator, escalator, or accessible entry."
    };
  }

  if (persona === "daily-commuter") {
    return {
      id: "commuter-route",
      title: "Fastest Practical Move",
      category: "transport",
      recommendation:
        "Use the most direct signed entrance and avoid unnecessary exploration unless the station looks crowded.",
      reason:
        "A daily commuter benefits most from speed and low decision time when the scene is familiar transit infrastructure.",
      benefits: ["Faster station entry", "Fewer decisions", "Keeps the route direct"],
      estimatedEffort: "Fast, moderate walking",
      confidence: 0.74,
      suggestedAction: "Proceed through the nearest signed entrance."
    };
  }

  return {
    id: "tourist-route",
    title: `${profile.shortLabel} Guidance`,
    category: "exploration",
    recommendation:
      "Use the main station entrance first, then orient yourself using visible signage before choosing onward transport.",
    reason:
      "For an unfamiliar area, the best first move is to reach the most legible transit point, reduce uncertainty, and then continue with clearer local cues.",
    benefits: ["Reduces confusion", "Uses recognizable landmarks", "Keeps onward options open"],
    estimatedEffort: "Moderate walking",
    confidence: 0.7,
    suggestedAction: "Move toward the main entrance and ask a follow-up once signage is visible."
  };
}

export function createFallbackReasoning(input: {
  scene: VisionScene;
  persona: PersonaId;
  userPrompt: string;
  location?: Coordinates;
}): ReasoningResult {
  const route = createFallbackRoute(
    input.location ?? input.scene.location ?? DEFAULT_LOCATION,
    DEFAULT_DESTINATION,
    input.persona
  );

  return {
    scene: input.scene,
    intent: inferFallbackIntent(input.userPrompt),
    reasoning:
      "CityMind combined the visible transit context, the selected persona, and the user's question. Because live AI or map data is unavailable, the guidance avoids claiming unverified station details and focuses on the safest practical next action.",
    recommendations: [recommendationForPersona(input.persona)],
    route,
    nearbyPlaces: [
      {
        name: "Station information counter",
        type: "Transit support",
        reason: "Useful for confirming exits, elevators, and onward transport."
      },
      {
        name: "Main road pickup point",
        type: "Transport connection",
        reason: "A likely place to connect with buses, taxis, or rideshare."
      }
    ],
    warnings: [
      "Elevator and platform details must be verified because the fallback mode cannot confirm live infrastructure."
    ],
    confidence: 0.7
  };
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
