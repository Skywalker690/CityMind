import { describe, expect, it } from "vitest";

import {
  normalizeReasoningResult,
  normalizeVisionScene
} from "@/lib/normalizers";
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

describe("response normalizers", () => {
  it("converts a nullable scene location into the optional client shape", () => {
    const normalized = normalizeVisionScene({
      ...createFallbackScene(origin),
      location: null
    });

    expect(normalized.location).toBeUndefined();
  });

  it("fills nullable reasoning fields from the active scene and route", () => {
    const scene = createFallbackScene(origin);
    const route = createFallbackRoute(origin, destination, "tourist");
    const reasoning = createFallbackReasoning({
      scene,
      persona: "tourist",
      userPrompt: "How do I reach the ferry?"
    });

    const normalized = normalizeReasoningResult(
      {
        ...reasoning,
        scene: null,
        route: null
      },
      scene,
      route
    );

    expect(normalized.scene).toEqual(scene);
    expect(normalized.route).toEqual(route);
  });
});
