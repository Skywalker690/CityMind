"use client";

import { useEffect, useRef, useState } from "react";
import { LocateFixed, MapPinned, Route as RouteIcon } from "lucide-react";
import type { Layer, Map as LeafletMap } from "leaflet";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { formatDistance, formatDuration } from "@/lib/utils";
import type { Coordinates, RouteSummary } from "@/types/map";

interface InteractiveMapProps {
  route?: RouteSummary | null;
  location: Coordinates;
}

export function InteractiveMap({ route, location }: InteractiveMapProps) {
  const initialLocationRef = useRef(location);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const routeLayersRef = useRef<Layer[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    let cancelled = false;

    async function createMap() {
      try {
        const L = (await import("leaflet")).default;
        const initialLocation = initialLocationRef.current;

        if (cancelled || !mapContainerRef.current) {
          return;
        }

        const map = L.map(mapContainerRef.current, {
          zoomControl: false
        }).setView([initialLocation.latitude, initialLocation.longitude], 14);

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.control
          .zoom({
            position: "bottomright"
          })
          .addTo(map);

        mapRef.current = map;
        setMapReady(true);
      } catch {
        setMapError(true);
      }
    }

    void createMap();

    return () => {
      cancelled = true;
      routeLayersRef.current.forEach((layer) => layer.remove());
      routeLayersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapReady || route) {
      return;
    }

    map.setView([location.latitude, location.longitude], 14);
  }, [location.latitude, location.longitude, mapReady, route]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapReady || !route) {
      return;
    }

    const currentMap = map;
    const currentRoute = route;

    async function updateRoute() {
      const L = (await import("leaflet")).default;
      const coordinates = currentRoute.geometry.map((point) => [
        point.latitude,
        point.longitude
      ] as [number, number]);

      routeLayersRef.current.forEach((layer) => layer.remove());

      const originMarker = L.marker(
        [
          currentRoute.origin.coordinates.latitude,
          currentRoute.origin.coordinates.longitude
        ],
        {
          icon: L.divIcon({
            className: "",
            html: '<span class="block size-4 rounded-full border-2 border-white bg-blue-600 shadow"></span>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
        }
      )
        .bindPopup(currentRoute.origin.label)
        .addTo(currentMap);

      const destinationMarker = L.marker(
        [
          currentRoute.destination.coordinates.latitude,
          currentRoute.destination.coordinates.longitude
        ],
        {
          icon: L.divIcon({
            className: "",
            html: '<span class="block size-4 rounded-full border-2 border-white bg-emerald-500 shadow"></span>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
        }
      )
        .bindPopup(currentRoute.destination.label)
        .addTo(currentMap);

      const routeLine = L.polyline(coordinates, {
        color: currentRoute.accessible ? "#10b981" : "#2563eb",
        weight: 5,
        opacity: 0.85
      }).addTo(currentMap);

      routeLayersRef.current = [originMarker, destinationMarker, routeLine];

      if (coordinates.length > 1) {
        currentMap.fitBounds(L.latLngBounds(coordinates), {
          padding: [48, 48],
          maxZoom: 15
        });
      }
    }

    void updateRoute();
  }, [mapReady, route]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPinned className="size-5 text-primary" aria-hidden />
              Interactive Map
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Free OpenStreetMap tiles with route visualization.
            </p>
          </div>
          {route ? (
            <Badge variant={route.accessible ? "success" : "secondary"}>
              {route.accessible ? "Accessible" : "Direct"}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          ref={mapContainerRef}
          className="h-[360px] overflow-hidden rounded-lg border bg-secondary md:h-[420px]"
          aria-label="CityMind route map"
        />
        {mapError ? <MapFallback route={route} /> : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <RouteMetric
            label="Distance"
            value={route ? formatDistance(route.distanceMeters) : "Pending"}
          />
          <RouteMetric
            label="Duration"
            value={route ? formatDuration(route.durationSeconds) : "Pending"}
          />
          <RouteMetric
            label="Mode"
            value={route?.accessible ? "Step-aware" : "Urban route"}
          />
        </div>
        {route?.steps.length ? (
          <div className="space-y-2">
            {route.steps.slice(0, 3).map((step, index) => (
              <div
                key={`${step.instruction}-${index}`}
                className="flex items-start gap-3 rounded-md border bg-background/70 p-3 text-sm"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <span className="leading-5">{step.instruction}</span>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function MapFallback({ route }: { route?: RouteSummary | null }) {
  return (
    <div className="city-grid relative h-[360px] overflow-hidden rounded-lg border bg-secondary/60 p-6 md:h-[420px]">
      <div className="absolute left-10 top-12 flex items-center gap-2 rounded-md bg-card px-3 py-2 text-sm shadow-soft">
        <LocateFixed className="size-4 text-primary" aria-hidden />
        Current scene
      </div>
      <div className="absolute bottom-12 right-8 flex items-center gap-2 rounded-md bg-card px-3 py-2 text-sm shadow-soft">
        <MapPinned className="size-4 text-emerald-500" aria-hidden />
        Suggested destination
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
          stroke={route?.accessible ? "#10b981" : "#2563eb"}
          strokeLinecap="round"
          strokeWidth="8"
        />
        <circle cx="64" cy="64" r="9" fill="#2563eb" />
        <circle cx="334" cy="218" r="9" fill="#10b981" />
      </svg>
      <div className="absolute bottom-6 left-6 rounded-md border bg-card p-3 text-sm shadow-soft">
        <div className="flex items-center gap-2 font-medium">
          <RouteIcon className="size-4 text-primary" aria-hidden />
          {route ? "Route prepared" : "Waiting for recommendation"}
        </div>
        <p className="mt-1 text-muted-foreground">
          Browser map rendering failed, so CityMind is showing the local route
          fallback.
        </p>
      </div>
    </div>
  );
}

function RouteMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background/70 p-3">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
