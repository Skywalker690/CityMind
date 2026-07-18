import { afterEach, describe, expect, it, vi } from "vitest";

import { routeSummarySchema } from "@/lib/validators";
import {
  generateRoute,
  resolveDestination,
  type RouteGenerationResult
} from "@/services/mapService";
import type { Coordinates, Destination } from "@/types/map";

const serverConfig = vi.hoisted(() => ({
  googleMapsApiKey: "",
  osrmBaseUrl: "https://osrm.example.test"
}));

vi.mock("@/lib/config", () => ({
  getServerConfig: () => ({
    openaiApiKey: undefined,
    openaiModel: "gpt-4.1-mini",
    googleMapsApiKey: serverConfig.googleMapsApiKey,
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
  serverConfig.googleMapsApiKey = "";
  serverConfig.osrmBaseUrl = "https://osrm.example.test";
});

function requireRoute(result: RouteGenerationResult) {
  if (!result.route) {
    throw new Error("Expected route generation to return a route.");
  }

  return result.route;
}

function encodePolyline(points: Coordinates[]) {
  let previousLatitude = 0;
  let previousLongitude = 0;

  return points
    .map((point) => {
      const latitude = Math.round(point.latitude * 100_000);
      const longitude = Math.round(point.longitude * 100_000);
      const encoded = `${encodePolylineValue(latitude - previousLatitude)}${encodePolylineValue(
        longitude - previousLongitude
      )}`;

      previousLatitude = latitude;
      previousLongitude = longitude;
      return encoded;
    })
    .join("");
}

function encodePolylineValue(value: number) {
  let encodedValue = value < 0 ? ~(value << 1) : value << 1;
  let encoded = "";

  while (encodedValue >= 0x20) {
    encoded += String.fromCharCode((0x20 | (encodedValue & 0x1f)) + 63);
    encodedValue >>= 5;
  }

  return `${encoded}${String.fromCharCode(encodedValue + 63)}`;
}

describe("map service", () => {
  it("uses Google Routes walking directions first and normalizes the shared route contract", async () => {
    serverConfig.googleMapsApiKey = "test-google-key";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        routes: [
          {
            distanceMeters: 480,
            duration: "420s",
            polyline: {
              encodedPolyline: encodePolyline([origin, destination.coordinates])
            },
            legs: [
              {
                steps: [
                  {
                    navigationInstruction: {
                      instructions: "Turn right onto Market Road"
                    },
                    distanceMeters: 120,
                    staticDuration: "90s"
                  },
                  {
                    navigationInstruction: {
                      instructions: "Continue to the ferry connection"
                    },
                    distanceMeters: 360,
                    staticDuration: "330s"
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
    expect(route.source).toBe("google");
    expect(result.warnings).toEqual(route.warnings);
    expect(routeSummarySchema.parse(route)).toEqual(route);
    expect(route.geometry).toEqual([origin, destination.coordinates]);
    expect(route.steps).toEqual([
      {
        instruction: "Turn right onto Market Road",
        distanceMeters: 120,
        durationSeconds: 90
      },
      {
        instruction: "Continue to the ferry connection",
        distanceMeters: 360,
        durationSeconds: 330
      }
    ]);

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "https://routes.googleapis.com/directions/v2:computeRoutes"
    );
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.method).toBe("POST");
    expect(request.headers).toMatchObject({
      "X-Goog-Api-Key": "test-google-key",
      "X-Goog-FieldMask": expect.stringContaining("routes.polyline.encodedPolyline")
    });
    expect(JSON.parse(String(request.body))).toEqual({
      origin: {
        location: {
          latLng: origin
        }
      },
      destination: {
        location: {
          latLng: destination.coordinates
        }
      },
      travelMode: "WALK",
      polylineQuality: "HIGH_QUALITY",
      polylineEncoding: "ENCODED_POLYLINE",
      languageCode: "en",
      units: "METRIC"
    });
  });

  it("uses the configured OSRM foot provider after Google Routes cannot return a route", async () => {
    serverConfig.googleMapsApiKey = "test-google-key";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({
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
    const route = requireRoute(result);

    expect(route.source).toBe("osrm");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "https://routes.googleapis.com/directions/v2:computeRoutes"
    );
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("/route/v1/foot/");
  });

  it("returns a usable fallback route when the live providers are unavailable", async () => {
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
    expect(route.origin.label).toBe("Current location");
    expect(route.source).toBe("fallback");
    expect(route.status).toBe("estimated");
    expect(route.accessibility.verified).toBe(false);
    expect(result.destinationResolution.status).toBe("resolved");
  });

  it("labels the default coordinate origin as a reference rather than current device location", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    const result = await generateRoute({
      destination: destination.coordinates,
      persona: "tourist"
    });
    const route = requireRoute(result);

    expect(route.origin.label).toBe("Reference location");
    expect(route.source).toBe("fallback");
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
    expect(result.warnings).toEqual([result.destinationResolution.message]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns an unavailable destination result when Google Places is not configured", async () => {
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
    expect(result.warnings).toEqual([result.destinationResolution.message]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("resolves a destination query through Google Places Text Search", async () => {
    serverConfig.googleMapsApiKey = "test-google-key";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        places: [
          {
            displayName: {
              text: "Fort Kochi ferry connection"
            },
            formattedAddress: "Fort Kochi, Kochi, Kerala, India",
            location: {
              latitude: 9.9652,
              longitude: 76.2422
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
        source: "google-places",
        query: "Fort Kochi ferry"
      }
    });
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "https://places.googleapis.com/v1/places:searchText"
    );
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.method).toBe("POST");
    expect(request.headers).toMatchObject({
      "X-Goog-Api-Key": "test-google-key",
      "X-Goog-FieldMask": expect.stringContaining("places.location")
    });
    expect(JSON.parse(String(request.body))).toEqual({
      textQuery: "Fort Kochi ferry",
      pageSize: 1,
      languageCode: "en",
      locationBias: {
        circle: {
          center: origin,
          radius: 50_000
        }
      }
    });
  });

  it("does not fabricate a destination when Google Places returns no match", async () => {
    serverConfig.googleMapsApiKey = "test-google-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ places: [] })
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
