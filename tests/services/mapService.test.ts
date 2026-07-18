import { afterEach, describe, expect, it, vi } from "vitest";

import { routeSummarySchema } from "@/lib/validators";
import {
  generateRoute,
  resolveDestination,
  type RouteGenerationResult
} from "@/services/mapService";
import type { Destination } from "@/types/map";

const serverConfig = vi.hoisted(() => ({
  mapboxAccessToken: "",
  osrmBaseUrl: "https://osrm.example.test"
}));

vi.mock("@/lib/config", () => ({
  getServerConfig: () => ({
    openaiApiKey: undefined,
    openaiModel: "gpt-4.1-mini",
    mapboxAccessToken: serverConfig.mapboxAccessToken,
    osrmBaseUrl: serverConfig.osrmBaseUrl
  })
}));

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

afterEach(() => {
  vi.unstubAllGlobals();
  serverConfig.mapboxAccessToken = "";
});

function requireRoute(result: RouteGenerationResult) {
  if (!result.route) {
    throw new Error("Expected route generation to return a route.");
  }

  return result.route;
}

describe("map service", () => {
  it("normalizes provider geometry and steps into the shared route contract", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        code: "Ok",
        routes: [
          {
            distance: 480,
            duration: 420,
            geometry: {
              coordinates: [
                [76.3183, 9.9674],
                [76.2422, 9.9652]
              ]
            },
            legs: [
              {
                steps: [
                  {
                    maneuver: { type: "turn", modifier: "right" },
                    name: "Market Road",
                    distance: 120,
                    duration: 90
                  },
                  {
                    maneuver: { type: "depart" },
                    distance: 360,
                    duration: 330
                  }
                ]
              }
            ]
          }
        ]
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const result: RouteGenerationResult = await generateRoute({
      origin,
      destination: {
        label: destination.label,
        coordinates: destination.coordinates
      },
      persona: "tourist"
    });
    const route = requireRoute(result);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(result.destination).toEqual(destination);
    expect(result.destinationResolution).toEqual({
      status: "resolved",
      destination
    });
    expect(result.warnings).toEqual(route.warnings);
    expect(routeSummarySchema.parse(route)).toEqual(route);
    expect(route.geometry).toEqual([
      { latitude: 9.9674, longitude: 76.3183 },
      { latitude: 9.9652, longitude: 76.2422 }
    ]);
    expect(route.steps).toEqual([
      {
        instruction: "Turn right onto Market Road.",
        distanceMeters: 120,
        durationSeconds: 90
      },
      {
        instruction: "Depart on the route.",
        distanceMeters: 360,
        durationSeconds: 330
      }
    ]);
  });

  it("returns a usable fallback route when the provider is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    const result: RouteGenerationResult = await generateRoute({
      origin,
      destination: destination.coordinates,
      persona: "elderly"
    });
    const route = requireRoute(result);

    expect(routeSummarySchema.safeParse(route).success).toBe(true);
    expect(route.origin.coordinates).toEqual(origin);
    expect(route.destination.coordinates).toEqual(destination.coordinates);
    expect(route.source).toBe("fallback");
    expect(route.status).toBe("estimated");
    expect(route.accessibility.verified).toBe(false);
    expect(result.destinationResolution.status).toBe("resolved");
  });

  it("returns a missing destination result without calling a route provider", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result: RouteGenerationResult = await generateRoute({
      origin,
      persona: "tourist"
    });

    expect(result.route).toBeUndefined();
    expect(result.destination).toBeUndefined();
    expect(result.destinationResolution).toMatchObject({
      status: "missing",
      message: expect.stringContaining("destination")
    });
    expect(result.warnings).toEqual([
      result.destinationResolution.message
    ]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns an unavailable destination result when destination search is not configured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result: RouteGenerationResult = await generateRoute({
      origin,
      userPrompt: "How do I reach Fort Kochi ferry?",
      persona: "tourist"
    });

    expect(result.route).toBeUndefined();
    expect(result.destination).toBeUndefined();
    expect(result.destinationResolution).toMatchObject({
      status: "unavailable",
      query: "Fort Kochi ferry"
    });
    expect(result.warnings).toEqual([
      result.destinationResolution.message
    ]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("resolves a destination query through configured geocoding", async () => {
    serverConfig.mapboxAccessToken = "test-mapbox-token";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          {
            geometry: {
              coordinates: [76.2422, 9.9652]
            },
            properties: {
              full_address: "Fort Kochi ferry connection"
            }
          }
        ]
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const resolution = await resolveDestination({
      destinationQuery: "Fort Kochi ferry",
      origin
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(resolution).toEqual({
      status: "resolved",
      destination: {
        label: "Fort Kochi ferry connection",
        coordinates: destination.coordinates,
        source: "mapbox-geocoding",
        query: "Fort Kochi ferry"
      }
    });
  });
});
