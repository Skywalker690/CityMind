import { describe, expect, it } from "vitest";

import { normalizeReasoningResult, normalizeVisionScene } from "@/lib/normalizers";
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

describe("response normalizers", () => {
  it("converts a nullable scene location into the optional client shape", () => {
    const normalized = normalizeVisionScene({
      ...createFallbackScene(origin),
      location: null
    });

    expect(normalized.location).toBeUndefined();
  });

  it("fills nullable reasoning fields from active scene and route enrichment", () => {
    const scene = createFallbackScene(origin);
    const route = createFallbackRoute({
      origin,
      destination,
      reason: "Live walking directions are unavailable."
    });
    const reasoning = createFallbackReasoning({
      scene,
      persona: "tourist",
      userPrompt: "How do I reach the ferry?"
    });

    const normalized = normalizeReasoningResult(
      {
        ...reasoning,
        scene: null,
        route: null,
        destination: undefined,
        destinationResolution: undefined
      },
      scene,
      {
        destination,
        destinationResolution,
        route
      }
    );

    expect(normalized.scene).toEqual(scene);
    expect(normalized.destination).toEqual(destination);
    expect(normalized.destinationResolution).toEqual(destinationResolution);
    expect(normalized.route).toEqual(route);
  });

  it("uses server-enriched route data when it must replace model route data", () => {
    const scene = createFallbackScene(origin);
    const modelRoute = createFallbackRoute({
      origin,
      destination,
      reason: "Model-provided route context."
    });
    const serverRoute = {
      ...modelRoute,
      distanceMeters: modelRoute.distanceMeters + 10,
      warnings: ["Server-generated route data."]
    };
    const reasoning = createFallbackReasoning(
      {
        scene,
        persona: "tourist",
        userPrompt: "How do I reach the ferry?"
      },
      {
        destination,
        destinationResolution,
        route: modelRoute
      }
    );

    const normalized = normalizeReasoningResult(reasoning, scene, {
      destination,
      destinationResolution,
      route: serverRoute,
      replaceRoute: true
    });

    expect(normalized.route).toEqual(serverRoute);
    expect(normalized.route).not.toEqual(modelRoute);
  });
});
