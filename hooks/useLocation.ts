"use client";

import { useCallback, useEffect, useState } from "react";

import type { Coordinates } from "@/types/map";

export function useLocation() {
  const [location, setLocation] = useState<Coordinates | undefined>();
  const [permissionState, setPermissionState] = useState<
    "idle" | "loading" | "granted" | "denied" | "unavailable"
  >("idle");

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setPermissionState("unavailable");
      return;
    }

    setPermissionState("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setPermissionState("granted");
      },
      () => {
        setPermissionState("denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000
      }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    location,
    permissionState,
    requestLocation
  };
}
