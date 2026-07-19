"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, LocateFixed, MapPinned, Navigation, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistance, formatDuration } from "@/lib/utils";
import type { Coordinates, RouteSummary } from "@/types/map";

const MAP_STARTUP_TIMEOUT_MS = 12_000;

type MapState = "loading" | "ready" | "unavailable";

type GoogleMapsLibraries = {
  maps: google.maps.MapsLibrary;
  marker: google.maps.MarkerLibrary;
};

type MapMarker = {
  remove: () => void;
};

let googleMapsLibrariesPromise: Promise<GoogleMapsLibraries> | undefined;

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
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapsLibraryRef = useRef<GoogleMapsLibraries | null>(null);
  const markersRef = useRef<MapMarker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const [mapState, setMapState] = useState<MapState>("loading");
  const [mapMessage, setMapMessage] = useState("Preparing the route map.");

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
  const hasRoute = Boolean(route);
  const locationLatitude = location.latitude;
  const locationLongitude = location.longitude;

  useEffect(() => {
    let disposed = false;
    let timedOut = false;
    let startupTimer: number | undefined;
    let activeMap: google.maps.Map | null = null;

    clearMapVisuals(markersRef, polylineRef);
    mapRef.current = null;
    mapsLibraryRef.current = null;
    setMapState("loading");

    if (!hasRoute) {
      setMapState("unavailable");
      setMapMessage(
        "Add a destination and get guidance to draw a walking route. The route summary will remain available if the map cannot load."
      );
      return;
    }

    if (!apiKey) {
      setMapState("unavailable");
      setMapMessage(
        "Google Maps is not configured in this browser. CityMind is keeping the route summary and a secure Google Maps walking link available."
      );
      return;
    }

    const googleMapsApiKey = apiKey;

    setMapMessage(
      hasDeviceLocation
        ? "Preparing the interactive Google Maps route near your shared location."
        : "Preparing the interactive Google Maps route from the labelled reference location."
    );

    const showFallback = (message: string) => {
      if (disposed) {
        return;
      }

      timedOut = true;
      if (startupTimer) {
        window.clearTimeout(startupTimer);
      }
      clearMapVisuals(markersRef, polylineRef);
      mapRef.current = null;
      mapsLibraryRef.current = null;
      setMapState("unavailable");
      setMapMessage(message);
    };

    async function createMap() {
      try {
        startupTimer = window.setTimeout(() => {
          showFallback(
            "Google Maps did not finish loading. CityMind is keeping the route instructions and a walking link available."
          );
        }, MAP_STARTUP_TIMEOUT_MS);

        const libraries = await loadGoogleMapsLibraries(googleMapsApiKey);

        if (!mapContainerRef.current) {
          await waitForNextFrame();
        }

        if (disposed || timedOut) {
          return;
        }

        if (!mapContainerRef.current) {
          showFallback(
            "CityMind could not mount the Google Maps canvas. Route instructions and a walking link remain available below."
          );
          return;
        }

        const { Map } = libraries.maps;
        activeMap = new Map(mapContainerRef.current, {
          center: {
            lat: locationLatitude,
            lng: locationLongitude
          },
          zoom: 14,
          mapId: mapId || undefined,
          clickableIcons: true,
          fullscreenControl: true,
          keyboardShortcuts: true,
          mapTypeControl: true,
          rotateControl: true,
          scaleControl: true,
          streetViewControl: true,
          zoomControl: true,
          gestureHandling: "cooperative"
        });

        if (startupTimer) {
          window.clearTimeout(startupTimer);
        }

        mapRef.current = activeMap;
        mapsLibraryRef.current = libraries;
        setMapState("ready");
        setMapMessage(
          hasDeviceLocation
            ? "Interactive Google Maps walking route is ready."
            : "Interactive Google Maps route is ready. Routes without device location begin at a labelled reference location."
        );
      } catch {
        showFallback(
          "CityMind could not start Google Maps. Route instructions and a walking link remain available below."
        );
      }
    }

    void createMap();

    return () => {
      disposed = true;
      if (startupTimer) {
        window.clearTimeout(startupTimer);
      }
      clearMapVisuals(markersRef, polylineRef);
      if (activeMap) {
        google.maps.event.clearInstanceListeners(activeMap);
      }
      mapRef.current = null;
      mapsLibraryRef.current = null;
    };
  }, [apiKey, hasDeviceLocation, hasRoute, locationLatitude, locationLongitude, mapId]);

  useEffect(() => {
    const map = mapRef.current;
    const libraries = mapsLibraryRef.current;

    if (!map || !libraries || mapState !== "ready" || !route) {
      return;
    }

    clearMapVisuals(markersRef, polylineRef);

    const origin = route.origin.coordinates;
    const routePath = getRoutePath(route);
    const originLabel =
      route.origin.label ?? (hasDeviceLocation ? "Current location" : "Reference map center");

    markersRef.current = [
      createRouteMarker({
        map,
        markerLibrary: libraries.marker,
        useAdvancedMarkers: Boolean(mapId),
        label: originLabel,
        color: "#2563eb",
        coordinates: origin
      }),
      createRouteMarker({
        map,
        markerLibrary: libraries.marker,
        useAdvancedMarkers: Boolean(mapId),
        label: route.destination.label,
        color: "#10b981",
        coordinates: route.destination.coordinates
      })
    ];

    const routeColor = route.status === "routed" ? "#2563eb" : "#d97706";
    polylineRef.current = new libraries.maps.Polyline({
      map,
      path: routePath,
      clickable: false,
      geodesic: true,
      strokeColor: routeColor,
      strokeOpacity: route.status === "routed" ? 0.92 : 0.78,
      strokeWeight: 6,
      zIndex: 2
    });

    fitRouteBounds(map, routePath);
  }, [hasDeviceLocation, mapId, mapState, route]);

  const recenterMap = () => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    if (route) {
      fitRouteBounds(map, getRoutePath(route));
      return;
    }

    map.panTo(toLatLngLiteral(location));
    map.setZoom(14);
  };

  const routeStatus = route
    ? route.status === "routed"
      ? route.source === "osrm"
        ? "Live OSRM route"
        : "Live Google route"
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
              Interactive walking-route context with readable instructions and a Google Maps
              fallback.
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
              aria-label="Interactive Google Maps walking route map"
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

async function loadGoogleMapsLibraries(apiKey: string): Promise<GoogleMapsLibraries> {
  if (!googleMapsLibrariesPromise) {
    const loadingPromise = (async () => {
      const { Loader } = await import("@googlemaps/js-api-loader");
      const loader = new Loader({
        apiKey,
        version: "weekly",
        libraries: ["marker"]
      });
      const [maps, marker] = await Promise.all([
        loader.importLibrary("maps"),
        loader.importLibrary("marker")
      ]);

      return { maps, marker };
    })();

    googleMapsLibrariesPromise = loadingPromise;
    void loadingPromise.catch(() => {
      if (googleMapsLibrariesPromise === loadingPromise) {
        googleMapsLibrariesPromise = undefined;
      }
    });
  }

  return googleMapsLibrariesPromise;
}

function createRouteMarker({
  map,
  markerLibrary,
  useAdvancedMarkers,
  label,
  color,
  coordinates
}: {
  map: google.maps.Map;
  markerLibrary: google.maps.MarkerLibrary;
  useAdvancedMarkers: boolean;
  label: string;
  color: string;
  coordinates: Coordinates;
}): MapMarker {
  const position = toLatLngLiteral(coordinates);

  if (useAdvancedMarkers) {
    const pin = new markerLibrary.PinElement({
      background: color,
      borderColor: "#ffffff",
      glyphColor: "#ffffff",
      scale: 1.08
    });
    const marker = new markerLibrary.AdvancedMarkerElement({
      map,
      position,
      title: label,
      content: pin.element
    });

    return {
      remove: () => {
        marker.map = null;
      }
    };
  }

  const marker = new markerLibrary.Marker({
    map,
    position,
    title: label,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 1,
      scale: 8,
      strokeColor: "#ffffff",
      strokeOpacity: 1,
      strokeWeight: 2
    }
  });

  return {
    remove: () => {
      marker.setMap(null);
    }
  };
}

function clearMapVisuals(
  markersRef: React.MutableRefObject<MapMarker[]>,
  polylineRef: React.MutableRefObject<google.maps.Polyline | null>
) {
  markersRef.current.forEach((marker) => marker.remove());
  markersRef.current = [];
  polylineRef.current?.setMap(null);
  polylineRef.current = null;
}

function getRoutePath(route: RouteSummary): google.maps.LatLngLiteral[] {
  const geometry = route.geometry.map(toLatLngLiteral);

  if (geometry.length > 1) {
    return geometry;
  }

  return [
    toLatLngLiteral(route.origin.coordinates),
    toLatLngLiteral(route.destination.coordinates)
  ];
}

function fitRouteBounds(map: google.maps.Map, routePath: google.maps.LatLngLiteral[]) {
  const bounds = new google.maps.LatLngBounds();
  routePath.forEach((coordinate) => bounds.extend(coordinate));

  if (routePath.length > 1) {
    map.fitBounds(bounds, 48);
    return;
  }

  map.panTo(routePath[0]);
  map.setZoom(15);
}

function toLatLngLiteral(coordinates: Coordinates): google.maps.LatLngLiteral {
  return { lat: coordinates.latitude, lng: coordinates.longitude };
}

function getGoogleMapsDirectionsUrl(route: RouteSummary) {
  const query = new URLSearchParams({
    api: "1",
    origin: formatCoordinates(route.origin.coordinates),
    destination: formatCoordinates(route.destination.coordinates),
    travelmode: "walking"
  });

  return `https://www.google.com/maps/dir/?${query.toString()}`;
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
              href={getGoogleMapsDirectionsUrl(route)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open a walking route from ${route.origin.label} to ${route.destination.label} in Google Maps`}
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
