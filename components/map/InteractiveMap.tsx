"use client";

import { useEffect, useRef, useState } from "react";
import {
  LocateFixed,
  MapPinned,
  Navigation,
  Route as RouteIcon,
  ShieldAlert
} from "lucide-react";
import type { Map as MapboxMap, Marker } from "mapbox-gl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { formatDistance, formatDuration } from "@/lib/utils";
import type { Coordinates, RouteSummary } from "@/types/map";

const ROUTE_SOURCE_ID = "citymind-route";
const ROUTE_LAYER_ID = "citymind-route-line";

type MapState = "loading" | "ready" | "unavailable";
type MapboxModule = typeof import("mapbox-gl").default;

interface InteractiveMapProps {
  route?: RouteSummary | null;
  location: Coordinates;
}

export function InteractiveMap({ route, location }: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const mapboxRef = useRef<MapboxModule | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [mapState, setMapState] = useState<MapState>("loading");
  const [mapMessage, setMapMessage] = useState("Preparing the interactive map.");

  useEffect(() => {
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!accessToken) {
      setMapState("unavailable");
      setMapMessage(
        "Mapbox is not configured. CityMind is showing the route summary and an accessible text fallback."
      );
      return;
    }

    let disposed = false;
    let activeMap: MapboxMap | null = null;

    async function createMap() {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;

        if (!mapboxgl.supported()) {
          setMapState("unavailable");
          setMapMessage(
            "This browser cannot render Mapbox. CityMind is showing the route summary instead."
          );
          return;
        }

        if (disposed || !mapContainerRef.current) {
          return;
        }

        mapboxgl.accessToken = accessToken;
        mapboxRef.current = mapboxgl;
        activeMap = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/standard",
          center: [location.longitude, location.latitude],
          zoom: 14,
          attributionControl: true
        });
        activeMap.addControl(new mapboxgl.NavigationControl(), "bottom-right");

        activeMap.on("load", () => {
          if (disposed) {
            return;
          }

          mapRef.current = activeMap;
          setMapState("ready");
          setMapMessage("Interactive Mapbox route view is ready.");
        });

        activeMap.on("error", (event) => {
          const detail = event.error?.message?.toLowerCase() ?? "";

          if (detail.includes("token") || detail.includes("unauthorized")) {
            setMapState("unavailable");
            setMapMessage(
              "Mapbox could not authorize this map. CityMind is keeping the route instructions available below."
            );
          }
        });
      } catch {
        setMapState("unavailable");
        setMapMessage(
          "CityMind could not start the interactive map. Route instructions remain available below."
        );
      }
    }

    void createMap();

    return () => {
      disposed = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      activeMap?.remove();
      mapRef.current = null;
      mapboxRef.current = null;
    };
  }, [location.latitude, location.longitude]);

  useEffect(() => {
    const map = mapRef.current;
    const mapboxgl = mapboxRef.current;

    if (!map || !mapboxgl || mapState !== "ready") {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const origin = route?.origin.coordinates ?? location;
    markersRef.current.push(
      createMarker(mapboxgl, "Current location", "bg-blue-600", origin).addTo(map)
    );

    if (!route) {
      removeRouteLayer(map);
      map.easeTo({
        center: [location.longitude, location.latitude],
        zoom: 14,
        essential: true
      });
      return;
    }

    markersRef.current.push(
      createMarker(
        mapboxgl,
        route.destination.label,
        "bg-emerald-500",
        route.destination.coordinates
      ).addTo(map)
    );

    const routeData = {
      type: "Feature" as const,
      properties: {},
      geometry: route.geometryGeoJson
    };
    const source = map.getSource(ROUTE_SOURCE_ID) as
      | { setData: (data: typeof routeData) => void }
      | undefined;

    if (source) {
      source.setData(routeData);
    } else {
      map.addSource(ROUTE_SOURCE_ID, {
        type: "geojson",
        data: routeData
      });
      map.addLayer({
        id: ROUTE_LAYER_ID,
        type: "line",
        source: ROUTE_SOURCE_ID,
        layout: {
          "line-cap": "round",
          "line-join": "round"
        },
        paint: {
          "line-color": route.status === "routed" ? "#2563eb" : "#d97706",
          "line-width": 5,
          "line-opacity": 0.88
        }
      });
    }

    const bounds = new mapboxgl.LngLatBounds();
    route.geometryGeoJson.coordinates.forEach((coordinate) => bounds.extend(coordinate));
    map.fitBounds(bounds, {
      padding: 48,
      maxZoom: 15,
      duration: 550,
      essential: true
    });
  }, [
    location.latitude,
    location.longitude,
    mapState,
    route
  ]);

  const recenterMap = () => {
    const map = mapRef.current;
    const origin = route?.origin.coordinates ?? location;

    if (!map) {
      return;
    }

    map.flyTo({
      center: [origin.longitude, origin.latitude],
      zoom: route ? 15 : 14,
      essential: true
    });
  };

  const routeStatus = route
    ? route.status === "routed"
      ? "Live walking route"
      : "Estimated route"
    : "Waiting for route";
  const accessibilityLabel = route?.accessibility.verified
    ? "Accessibility verified"
    : "Accessibility needs verification";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPinned className="size-5 text-primary" aria-hidden />
              Interactive Map
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Mapbox visualization with walking-route context and a text alternative.
            </p>
          </div>
          <Badge variant={route?.status === "routed" ? "success" : "warning"}>
            {routeStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mapState === "unavailable" ? (
          <MapFallback route={route} message={mapMessage} />
        ) : (
          <div className="relative">
            <div
              ref={mapContainerRef}
              className="h-[360px] overflow-hidden rounded-lg border bg-secondary md:h-[420px]"
              role="application"
              aria-label="Interactive Mapbox route map"
              aria-busy={mapState === "loading"}
            />
            {mapState === "loading" ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg border bg-background/75 text-sm font-medium backdrop-blur-sm">
                Preparing the route map...
              </div>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="absolute left-3 top-3 shadow-soft"
              onClick={recenterMap}
              aria-label="Recenter map on your current location"
            >
              <LocateFixed aria-hidden />
              Recenter
            </Button>
          </div>
        )}

        <p className="text-xs leading-5 text-muted-foreground" role="status">
          {mapMessage}
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <RouteMetric
            label="Distance"
            value={route ? formatDistance(route.distanceMeters) : "Pending"}
          />
          <RouteMetric
            label="Duration"
            value={route ? formatDuration(route.durationSeconds) : "Pending"}
          />
          <RouteMetric label="Mode" value={route?.travelMode ?? "Walking"} />
        </div>

        {route ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
            <div className="flex items-center gap-2 font-medium">
              <ShieldAlert className="size-4" aria-hidden />
              {accessibilityLabel}
            </div>
            <p className="mt-1 leading-5">
              {route.accessibility.warnings[0] ??
                "Confirm step-free access, elevators, ramps, and temporary closures before travel."}
            </p>
          </div>
        ) : null}

        {route?.steps.length ? (
          <ol className="space-y-2" aria-label="Route instructions">
            {route.steps.slice(0, 4).map((step, index) => (
              <li
                key={`${step.instruction}-${index}`}
                className="flex items-start gap-3 rounded-md border bg-background/70 p-3 text-sm"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <span className="leading-5">{step.instruction}</span>
              </li>
            ))}
          </ol>
        ) : null}
      </CardContent>
    </Card>
  );
}

function createMarker(
  mapboxgl: MapboxModule,
  label: string,
  colorClass: string,
  coordinates: Coordinates
) {
  const element = document.createElement("span");
  element.className = `block size-4 rounded-full border-2 border-white ${colorClass} shadow`;
  element.setAttribute("role", "img");
  element.setAttribute("aria-label", label);

  return new mapboxgl.Marker({ element })
    .setLngLat([coordinates.longitude, coordinates.latitude])
    .setPopup(new mapboxgl.Popup({ offset: 20 }).setText(label));
}

function removeRouteLayer(map: MapboxMap) {
  if (map.getLayer(ROUTE_LAYER_ID)) {
    map.removeLayer(ROUTE_LAYER_ID);
  }

  if (map.getSource(ROUTE_SOURCE_ID)) {
    map.removeSource(ROUTE_SOURCE_ID);
  }
}

function MapFallback({
  route,
  message
}: {
  route?: RouteSummary | null;
  message: string;
}) {
  return (
    <div className="city-grid relative h-[360px] overflow-hidden rounded-lg border bg-secondary/60 p-6 md:h-[420px]">
      <div className="absolute left-10 top-12 flex items-center gap-2 rounded-md bg-card px-3 py-2 text-sm shadow-soft">
        <LocateFixed className="size-4 text-primary" aria-hidden />
        Current scene
      </div>
      <div className="absolute bottom-12 right-8 flex items-center gap-2 rounded-md bg-card px-3 py-2 text-sm shadow-soft">
        <MapPinned className="size-4 text-emerald-500" aria-hidden />
        {route?.destination.label ?? "Suggested destination"}
      </div>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 280"
        role="img"
        aria-label="Fallback route visualization"
      >
        <path
          d="M64 64 C126 118 156 104 196 148 S292 206 334 218"
          fill="none"
          stroke={route?.status === "routed" ? "#2563eb" : "#d97706"}
          strokeLinecap="round"
          strokeWidth="8"
        />
        <circle cx="64" cy="64" r="9" fill="#2563eb" />
        <circle cx="334" cy="218" r="9" fill="#10b981" />
      </svg>
      <div className="absolute bottom-6 left-6 max-w-xs rounded-md border bg-card p-3 text-sm shadow-soft">
        <div className="flex items-center gap-2 font-medium">
          <Navigation className="size-4 text-primary" aria-hidden />
          {route ? "Route summary available" : "Waiting for recommendation"}
        </div>
        <p className="mt-1 text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

function RouteMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background/70 p-3">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold capitalize">{value}</p>
    </div>
  );
}
