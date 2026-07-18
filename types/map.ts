export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
}

export interface RoutePoint {
  label: string;
  coordinates: Coordinates;
  type: "origin" | "destination" | "waypoint";
}

export interface RouteSummary {
  origin: RoutePoint;
  destination: RoutePoint;
  waypoints: RoutePoint[];
  distanceMeters: number;
  durationSeconds: number;
  accessible: boolean;
  geometry: Coordinates[];
  steps: RouteStep[];
}
