import { afterEach, describe, expect, it, vi } from "vitest";

import { routeSummarySchema } from "@/lib/validators";
import { generateRoute } from "@/services/mapService";

const origin = {
  latitude: 9.9674,
  longitude: 76.3183
};

const destination = {
  latitude: 9.9652,
  longitude: 76.2422
};

afterEach(() => {
  vi.unstubAllGlobals();
});

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

    const route = await generateRoute({
      origin,
      destination,
      persona: "tourist"
    });

    expect(fetchMock).toHaveBeenCalledOnce();
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

    const route = await generateRoute({
      origin,
      destination,
      persona: "elderly"
    });

    expect(routeSummarySchema.safeParse(route).success).toBe(true);
    expect(route.origin.coordinates).toEqual(origin);
    expect(route.destination.coordinates).toEqual(destination);
  });
});
