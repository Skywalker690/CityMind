import { describe, expect, it } from "vitest";

import { routeSummarySchema } from "@/lib/validators";
import {
  createFallbackReasoning,
  createFallbackRoute,
  createFallbackScene
} from "@/services/fallbackData";
import type { Destination, DestinationResolution } from "@/types/map";

const origin = {
  latitude: 9.9674,
  longitude: 76.3183
};

const destination: Destination = {
  label: "Fort Kochi ferry connection",
  coordinates: {
    latitude: 9.9652,
    longitude: 76.2422
  },
  source: "explicit-coordinates"
};

const destinationResolution: DestinationResolution = {
  status: "resolved",
  destination
};

describe("deterministic fallback data", () => {
  it("keeps resolved endpoints while marking estimated guidance as unverified", () => {
    const route = createFallbackRoute({
      origin,
      destination,
      reason: "Live walking directions are temporarily unavailable."
    });

    expect(route.origin.coordinates).toEqual(origin);
    expect(route.destination).toEqual({
      label: destination.label,
      coordinates: destination.coordinates,
      type: "destination"
    });
    expect(route.source).toBe("fallback");
    expect(route.status).toBe("estimated");
    expect(route.accessible).toBe(false);
    expect(route.accessibility).toMatchObject({
      status: "unverified",
      verified: false,
      evidence: []
    });
    expect(route.geometryGeoJson.coordinates).toEqual([
      [origin.longitude, origin.latitude],
      [destination.coordinates.longitude, destination.coordinates.latitude]
    ]);
    expect(route.warnings).toContain("Live walking directions are temporarily unavailable.");
    expect(routeSummarySchema.safeParse(route).success).toBe(true);
  });

  it.each([
    ["Can I avoid stairs?", "accessibility"],
    ["What should I visit nearby?", "exploration"],
    ["How do I reach the ferry?", "navigation"],
    ["What is the smartest next step?", "urban recommendation"]
  ])("preserves a useful fallback intent for %s", (userPrompt, intent) => {
    const scene = createFallbackScene(origin);
    const route = createFallbackRoute({
      origin,
      destination,
      reason: "Live walking directions are temporarily unavailable."
    });
    const result = createFallbackReasoning(
      {
        scene,
        persona: "wheelchair",
        userPrompt
      },
      {
        destination,
        destinationResolution,
        route
      }
    );

    expect(result.intent).toBe(intent);
    expect(result.scene).toEqual(scene);
    expect(result.destination).toEqual(destination);
    expect(result.destinationResolution).toEqual(destinationResolution);
    expect(result.recommendations[0]?.id).toBe("accessible-route");
    expect(result.warnings).not.toHaveLength(0);
    expect(result.route).toEqual(route);
  });

  it("does not invent a route when destination resolution is unavailable", () => {
    const scene = createFallbackScene(origin);
    const unavailableResolution: DestinationResolution = {
      status: "unavailable",
      query: "Fort Kochi ferry",
      message: "Destination search is temporarily unavailable."
    };
    const result = createFallbackReasoning(
      {
        scene,
        persona: "tourist",
        userPrompt: "How do I reach Fort Kochi ferry?"
      },
      { destinationResolution: unavailableResolution }
    );

    expect(result.destination).toBeUndefined();
    expect(result.route).toBeUndefined();
    expect(result.destinationResolution).toEqual(unavailableResolution);
    expect(result.warnings).toContain(unavailableResolution.message);
  });
});
