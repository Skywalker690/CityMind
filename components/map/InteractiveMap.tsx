"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, LocateFixed, MapPinned, Navigation, ShieldAlert } from "lucide-react";
import type * as Leaflet from "leaflet";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistance, formatDuration } from "@/lib/utils";
import type { Coordinates, RouteSummary } from "@/types/map";

const MAP_STARTUP_TIMEOUT_MS = 12_000;
const OPENSTREETMAP_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OPENSTREETMAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

type MapState = "loading" | "ready" | "unavailable";
type LeafletModule = typeof import("leaflet");

interface InteractiveMapProps {
  route?: RouteSummary | null;
  location: Coordinates;
  hasDeviceLocation?: boolean;
}

export function InteractiveMap({
  route,
  location,
  hasDeviceLocation = false
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const routeLayersRef = useRef<Leaflet.Layer[]>([]);
  const [mapState, setMapState] = useState<MapState>("loading");
  const [mapMessage, setMapMessage] = useState("Preparing the OpenStreetMap route.");
  const hasRoute = Boolean(route);
  const locationLatitude = location.latitude;
  const locationLongitude = location.longitude;

  useEffect(() => {
    let disposed = false;
    let timedOut = false;
    let startupTimer: number | undefined;
    let activeMap: Leaflet.Map | null = null;

    clearRouteLayers(mapRef.current, routeLayersRef);
    mapRef.current = null;
    leafletRef.current = null;
    setMapState("loading");

    if (!hasRoute) {
      setMapState("unavailable");
      setMapMessage(
        "Add a destination and get guidance to draw a walking route. Text instructions remain available if the map cannot load."
      );
      return;
    }

    setMapMessage(
      hasDeviceLocation
        ? "Preparing the OpenStreetMap route near your shared location."
        : "Preparing the OpenStreetMap route from the labelled reference location."
    );

    const showFallback = (message: string) => {
      if (disposed) {
        return;
      }

      timedOut = true;
      if (startupTimer) {
        window.clearTimeout(startupTimer);
      }
      clearRouteLayers(activeMap, routeLayersRef);
      activeMap?.remove();
      activeMap = null;
      mapRef.current = null;
      leafletRef.current = null;
      setMapState("unavailable");
      setMapMessage(message);
    };

    async function createMap() {
      try {
        startupTimer = window.setTimeout(() => {
          showFallback(
            "OpenStreetMap did not finish loading. Route instructions and an OpenStreetMap walking link remain available below."
          );
        }, MAP_STARTUP_TIMEOUT_MS);

        const leaflet = await import("leaflet");

        if (!mapContainerRef.current) {
          await waitForNextFrame();
        }

        if (disposed || timedOut) {
          return;
        }

        if (!mapContainerRef.current) {
          showFallback(
            "CityMind could not mount the OpenStreetMap canvas. Route instructions and a walking link remain available below."
          );
          return;
        }

        activeMap = leaflet.map(mapContainerRef.current, {
          center: [locationLatitude, locationLongitude],
          zoom: 14,
          zoomControl: false,
          preferCanvas: true
        });
        leaflet
          .tileLayer(OPENSTREETMAP_TILE_URL, {
            attribution: OPENSTREETMAP_ATTRIBUTION,
            maxZoom: 19
          })
          .addTo(activeMap);
        leaflet.control.zoom({ position: "bottomright" }).addTo(activeMap);
        leaflet.control.scale({ imperial: false, position: "bottomleft" }).addTo(activeMap);

        if (startupTimer) {
          window.clearTimeout(startupTimer);
        }

        mapRef.current = activeMap;
        leafletRef.current = leaflet;
        setMapState("ready");
        setMapMessage(
          hasDeviceLocation
            ? "Interactive OpenStreetMap walking route is ready."
            : "Interactive OpenStreetMap route is ready. Routes without device location begin at a labelled reference location."
        );
      } catch {
        showFallback(
          "CityMind could not start OpenStreetMap. Route instructions and a walking link remain available below."
        );
      }
    }

    void createMap();

    return () => {
      disposed = true;
      if (startupTimer) {
        window.clearTimeout(startupTimer);
      }
      clearRouteLayers(activeMap, routeLayersRef);
      activeMap?.remove();
      mapRef.current = null;
      leafletRef.current = null;
    };
  }, [hasDeviceLocation, hasRoute, locationLatitude, locationLongitude]);

  useEffect(() => {
    const map = mapRef.current;
    const leaflet = leafletRef.current;

    if (!map || !leaflet || mapState !== "ready" || !route) {
      return;
    }

    clearRouteLayers(map, routeLayersRef);

    const routePath = getRoutePath(route);
    const routeColor = route.status === "routed" ? "#2563eb" : "#d97706";
    const originLabel =
      route.origin.label ?? (hasDeviceLocation ? "Current location" : "Reference map center");

    const originMarker = leaflet.circleMarker(toLeafletLatLng(route.origin.coordinates), {
      color: "#ffffff",
      fillColor: "#2563eb",
      fillOpacity: 1,
      radius: 9,
      weight: 3
    });
    originMarker.bindTooltip(originLabel, { direction: "top", offset: [0, -8] });

    const destinationMarker = leaflet.circleMarker(toLeafletLatLng(route.destination.coordinates), {
      color: "#ffffff",
      fillColor: "#10b981",
      fillOpacity: 1,
      radius: 9,
      weight: 3
    });
    destinationMarker.bindTooltip(route.destination.label, { direction: "top", offset: [0, -8] });

    const routeLine = leaflet.polyline(routePath, {
      color: routeColor,
      opacity: route.status === "routed" ? 0.92 : 0.78,
      weight: 6,
      lineCap: "round",
      lineJoin: "round"
    });

    routeLayersRef.current = [routeLine, originMarker, destinationMarker];
    routeLayersRef.current.forEach((layer) => layer.addTo(map));
    fitRouteBounds(map, routePath);
  }, [hasDeviceLocation, mapState, route]);

  const recenterMap = () => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    if (route) {
      fitRouteBounds(map, getRoutePath(route));
      return;
    }

    map.setView([location.latitude, location.longitude], 14);
  };

  const routeStatus = route
    ? route.status === "routed"
      ? "Live OpenStreetMap route"
      : "Estimated route"
    : "Waiting for route";
  const accessibilityLabel = route?.accessibility.verified
    ? "Accessibility verified"
    : "Accessibility needs verification";
  const recenterLabel =
    route?.origin.label ?? (hasDeviceLocation ? "your current location" : "the reference location");

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPinned className="size-5 text-primary" aria-hidden />
              Route map
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Free OpenStreetMap walking-route context with readable instructions.
            </p>
          </div>
          <Badge variant={route?.status === "routed" ? "success" : "warning"}>{routeStatus}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mapState === "unavailable" ? (
          <MapFallback route={route} message={mapMessage} />
        ) : (
          <div className="relative">
            <div
              ref={mapContainerRef}
              className="h-[340px] overflow-hidden rounded-[22px] border bg-secondary md:h-[400px]"
              role="region"
              aria-label="Interactive OpenStreetMap walking route map"
              aria-busy={mapState === "loading"}
            />
            {mapState === "loading" ? (
              <div
                className="absolute inset-0 flex items-center justify-center rounded-[22px] border bg-background/75 p-6 text-center text-sm font-medium backdrop-blur-sm"
                role="status"
                aria-live="polite"
              >
                Preparing the route map...
              </div>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="absolute left-3 top-3"
              onClick={recenterMap}
              disabled={mapState !== "ready"}
              aria-label={`Recenter map on ${recenterLabel}`}
            >
              <LocateFixed aria-hidden />
              Recenter
            </Button>
          </div>
        )}

        <p className="text-xs leading-5 text-muted-foreground" role="status" aria-live="polite">
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
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
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

        {route?.steps.length ? <RouteInstructions steps={route.steps} /> : null}
      </CardContent>
    </Card>
  );
}

function clearRouteLayers(map: Leaflet.Map | null, layersRef: React.MutableRefObject<Leaflet.Layer[]>) {
  if (map) {
    layersRef.current.forEach((layer) => map.removeLayer(layer));
  }

  layersRef.current = [];
}

function getRoutePath(route: RouteSummary): Leaflet.LatLngTuple[] {
  const geometry = route.geometry.map(toLeafletLatLng);

  if (geometry.length > 1) {
    return geometry;
  }

  return [toLeafletLatLng(route.origin.coordinates), toLeafletLatLng(route.destination.coordinates)];
}

function fitRouteBounds(map: Leaflet.Map, routePath: Leaflet.LatLngTuple[]) {
  if (routePath.length > 1) {
    map.fitBounds(routePath, { padding: [48, 48], maxZoom: 15 });
    return;
  }

  const fallbackPoint = routePath[0];

  if (fallbackPoint) {
    map.setView(fallbackPoint, 15);
  }
}

function toLeafletLatLng(coordinates: Coordinates): Leaflet.LatLngTuple {
  return [coordinates.latitude, coordinates.longitude];
}

function getOpenStreetMapDirectionsUrl(route: RouteSummary) {
  const query = new URLSearchParams({
    engine: "fossgis_osrm_foot",
    route: `${formatCoordinates(route.origin.coordinates)};${formatCoordinates(route.destination.coordinates)}`
  });

  return `https://www.openstreetmap.org/directions?${query.toString()}`;
}

function formatCoordinates({ latitude, longitude }: Coordinates) {
  return `${latitude},${longitude}`;
}

function waitForNextFrame() {
  return new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
}

function MapFallback({ route, message }: { route?: RouteSummary | null; message: string }) {
  return (
    <div className="city-grid relative h-[340px] overflow-hidden rounded-[22px] border bg-secondary/60 p-6 md:h-[400px]">
      <div className="skeuo-surface absolute left-6 top-8 flex items-center gap-2 rounded-2xl px-3 py-2 text-sm">
        <LocateFixed className="size-4 text-primary" aria-hidden />
        {route?.origin.label ?? "Reference map center"}
      </div>
      <div className="skeuo-surface absolute bottom-14 right-6 flex max-w-[55%] items-center gap-2 rounded-2xl px-3 py-2 text-sm">
        <MapPinned className="size-4 shrink-0 text-emerald-500" aria-hidden />
        <span className="truncate">{route?.destination.label ?? "Suggested destination"}</span>
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
      <div className="skeuo-surface absolute bottom-5 left-5 max-w-xs rounded-2xl p-3 text-sm">
        <div className="flex items-center gap-2 font-medium">
          <Navigation className="size-4 text-primary" aria-hidden />
          {route ? "Route summary available" : "Waiting for guidance"}
        </div>
        <p className="mt-1 text-muted-foreground">{message}</p>
        {route ? (
          <Button asChild size="sm" className="mt-3 w-full">
            <a
              href={getOpenStreetMapDirectionsUrl(route)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open a walking route from ${route.origin.label} to ${route.destination.label} in OpenStreetMap`}
            >
              <ExternalLink aria-hidden />
              Open walking route
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function RouteInstructions({ steps }: { steps: RouteSummary["steps"] }) {
  const primarySteps = steps.slice(0, 4);
  const remainingSteps = steps.slice(4);

  return (
    <div className="space-y-3">
      <ol className="space-y-2" aria-label="Route instructions">
        {primarySteps.map((step, index) => (
          <RouteInstruction key={`${step.instruction}-${index}`} step={step} index={index} />
        ))}
      </ol>
      {remainingSteps.length ? (
        <details className="rounded-2xl border bg-background/60 p-3 text-sm">
          <summary className="cursor-pointer font-medium">
            Show all {steps.length} route steps
          </summary>
          <ol start={5} className="mt-3 space-y-2" aria-label="Remaining route instructions">
            {remainingSteps.map((step, index) => (
              <RouteInstruction
                key={`${step.instruction}-${index + 4}`}
                step={step}
                index={index + 4}
              />
            ))}
          </ol>
        </details>
      ) : null}
    </div>
  );
}

function RouteInstruction({ step, index }: { step: RouteSummary["steps"][number]; index: number }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl border bg-background/70 p-3 text-sm">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {index + 1}
      </span>
      <span className="leading-5">{step.instruction}</span>
    </li>
  );
}

function RouteMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="skeuo-inset rounded-2xl p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold capitalize">{value}</p>
    </div>
  );
}
