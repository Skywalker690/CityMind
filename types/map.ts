export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DestinationInput {
  /** A user-facing label or search phrase for the destination. */
  label?: string;
  /** Coordinates supplied by the client take precedence over a search phrase. */
  coordinates?: Coordinates;
}

export type DestinationSource = "explicit-coordinates" | "google-places";

export interface Destination {
  label: string;
  coordinates: Coordinates;
  source: DestinationSource;
  query?: string;
}

export type DestinationResolutionStatus =
  | "resolved"
  | "missing"
  | "unavailable"
  | "not-found";

export interface DestinationResolution {
  status: DestinationResolutionStatus;
  destination?: Destination;
  query?: string;
  message?: string;
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

export interface RouteLineString {
  type: "LineString";
  /** GeoJSON order: [longitude, latitude]. */
  coordinates: [number, number][];
}

/** The provider that supplied the route geometry and instructions. */
export type RouteSource = "google" | "osrm" | "fallback";

export type RouteStatus = "routed" | "estimated";

export interface RouteAccessibility {
  /**
   * Accessibility is only verified when it comes from an explicit trusted
   * accessibility data source. Persona preferences are not route evidence.
   */
  status: "unknown" | "unverified" | "verified";
  verified: boolean;
  evidence: string[];
  warnings: string[];
}

export interface RouteSummary {
  origin: RoutePoint;
  destination: RoutePoint;
  waypoints: RoutePoint[];
  distanceMeters: number;
  durationSeconds: number;
  /**
   * Compatibility flag for existing clients. It is true only when
   * accessibility has been explicitly verified.
   */
  accessible: boolean;
  travelMode: "walking";
  source: RouteSource;
  status: RouteStatus;
  accessibility: RouteAccessibility;
  geometry: Coordinates[];
  geometryGeoJson: RouteLineString;
  steps: RouteStep[];
  warnings: string[];
}
