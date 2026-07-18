import { describe, expect, it } from "vitest";

import { routeSummarySchema } from "@/lib/validators";
import {
  createFallbackReasoning,
  createFallbackRoute,
  createFallbackScene
} from "@/services/fallbackData";

const origin = {
  latitude: 9.9674,
  longitude: 76.3183
};

const destination = {
  latitude: 9.9652,
  longitude: 76.2422
};

describe("deterministic fallback data", () => {
  it("keeps route endpoints and adapts fallback routing for accessibility priorities", () => {
    const touristRoute = createFallbackRoute(origin, destination, "tourist");
    const wheelchairRoute = createFallbackRoute(origin, destination, "wheelchair");

    expect(touristRoute.origin.coordinates).toEqual(origin);
    expect(touristRoute.destination.coordinates).toEqual(destination);
    expect(touristRoute.accessible).toBe(false);
    expect(wheelchairRoute.accessible).toBe(true);
    expect(wheelchairRoute.distanceMeters).toBeGreaterThan(touristRoute.distanceMeters);
    expect(wheelchairRoute.waypoints[0]?.label).toContain("Step-free");
    expect(routeSummarySchema.safeParse(wheelchairRoute).success).toBe(true);
  });

  it.each([
    ["Can I avoid stairs?", "accessibility"],
    ["What should I visit nearby?", "exploration"],
    ["How do I reach the ferry?", "navigation"],
    ["What is the smartest next step?", "urban recommendation"]
  ])("preserves a useful fallback intent for %s", (userPrompt, intent) => {
    const scene = createFallbackScene(origin);
    const result = createFallbackReasoning({
      scene,
      persona: "wheelchair",
      userPrompt
    });

    expect(result.intent).toBe(intent);
    expect(result.scene).toEqual(scene);
    expect(result.recommendations[0]?.id).toBe("accessible-route");
    expect(result.warnings).not.toHaveLength(0);
    expect(result.route?.origin.coordinates).toEqual(origin);
  });
});
