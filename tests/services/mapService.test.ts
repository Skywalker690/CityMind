import { afterEach, describe, expect, it, vi } from "vitest";

import { routeSummarySchema } from "@/lib/validators";
import {
  generateRoute,
  resolveDestination,
  type RouteGenerationResult
} from "@/services/mapService";
import type { Destination } from "@/types/map";

const serverConfig = vi.hoisted(() => ({
  osrmBaseUrl: undefined as string | undefined
}));

vi.mock("@/lib/config", () => ({
  getServerConfig: () => ({
    openaiApiKey: undefined,
    openaiModel: "gpt-4.1-mini",
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
  serverConfig.osrmBaseUrl = undefined;
});

function requireRoute(result: RouteGenerationResult) {
  if (!result.route) {
    throw new Error("Expected route generation to return a route.");
  }

  return result.route;
}

describe("map service", () => {
  it("uses the free OpenStreetMap foot router and normalizes its route contract", async () => {
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
                    maneuver: {
                      instruction: "Turn right onto Market Road"
                    },
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

    const result = await generateRoute({
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
    expect(route.source).toBe("osrm");
    expect(routeSummarySchema.parse(route)).toEqual(route);
    expect(route.geometry).toEqual([
      { latitude: 9.9674, longitude: 76.3183 },
      { latitude: 9.9652, longitude: 76.2422 }
    ]);
    expect(route.steps).toEqual([
      {
        instruction: "Turn right onto Market Road",
        distanceMeters: 120,
        durationSeconds: 90
      },
      {
        instruction: "Depart on the route.",
        distanceMeters: 360,
        durationSeconds: 330
      }
    ]);

    const requestUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestUrl.origin).toBe("https://routing.openstreetmap.de");
    expect(requestUrl.pathname).toBe(
      "/routed-foot/route/v1/driving/76.3183,9.9674;76.2422,9.9652"
    );
    expect(requestUrl.searchParams.get("geometries")).toBe("geojson");
    expect(requestUrl.searchParams.get("steps")).toBe("true");
  });

  it("uses a configured OSRM-compatible foot router when present", async () => {
    serverConfig.osrmBaseUrl = "https://routing.example.test/foot";
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
            legs: []
          }
        ]
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateRoute({
      origin,
      destination: destination.coordinates,
      persona: "tourist"
    });

    expect(requireRoute(result).source).toBe("osrm");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      "https://routing.example.test/foot/route/v1/driving/"
    );
  });

  it("returns an honest estimated route when the live foot router is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    const result = await generateRoute({
      origin,
      destination: destination.coordinates,
      persona: "elderly"
    });
    const route = requireRoute(result);

    expect(routeSummarySchema.safeParse(route).success).toBe(true);
    expect(route.source).toBe("fallback");
    expect(route.status).toBe("estimated");
    expect(route.accessibility.verified).toBe(false);
  });

  it("returns a missing destination result without calling a provider", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateRoute({
      origin,
      persona: "tourist"
    });

    expect(result.route).toBeUndefined();
    expect(result.destinationResolution).toMatchObject({ status: "missing" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("resolves a destination query through no-key Nominatim search", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          display_name: "Fort Kochi ferry connection, Kochi, Kerala, India",
          lat: "9.9652",
          lon: "76.2422"
        }
      ]
    });
    vi.stubGlobal("fetch", fetchMock);

    const resolution = await resolveDestination({
      destinationQuery: "Fort Kochi ferry",
      origin
    });

    expect(resolution).toEqual({
      status: "resolved",
      destination: {
        label: "Fort Kochi ferry connection, Kochi, Kerala, India",
        coordinates: destination.coordinates,
        source: "nominatim",
        query: "Fort Kochi ferry"
      }
    });

    const requestUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestUrl.origin).toBe("https://nominatim.openstreetmap.org");
    expect(requestUrl.searchParams.get("q")).toBe("Fort Kochi ferry");
    expect(requestUrl.searchParams.get("format")).toBe("jsonv2");
    expect(requestUrl.searchParams.get("limit")).toBe("1");
  });

  it("does not invent a destination when Nominatim returns no match", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => []
      })
    );

    const resolution = await resolveDestination({
      destinationQuery: "An invented place",
      origin
    });

    expect(resolution).toMatchObject({
      status: "not-found",
      query: "An invented place"
    });
  });
});
