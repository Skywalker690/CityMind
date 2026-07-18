import type { Coordinates } from "@/types/map";

export type ConfidenceLevel = "low" | "medium" | "high";

export interface AccessibilityIndicator {
  label: string;
  available: boolean | null;
  confidence: ConfidenceLevel;
  evidence: string;
}

export interface SceneLandmark {
  name: string;
  type: "station" | "entrance" | "signage" | "building" | "road" | "service" | "unknown";
  confidence: ConfidenceLevel;
}

export interface VisionScene {
  sceneType: string;
  summary: string;
  landmarks: SceneLandmark[];
  infrastructure: string[];
  accessibility: AccessibilityIndicator[];
  navigationCues: string[];
  warnings: string[];
  confidence: number;
  location?: Coordinates;
}
