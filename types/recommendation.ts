import type { RouteSummary } from "@/types/map";
import type { VisionScene } from "@/types/vision";

export type RecommendationCategory =
  | "navigation"
  | "accessibility"
  | "exploration"
  | "safety"
  | "transport"
  | "nearby-service";

export interface Recommendation {
  id: string;
  title: string;
  category: RecommendationCategory;
  recommendation: string;
  reason: string;
  benefits: string[];
  estimatedEffort: string;
  confidence: number;
  suggestedAction: string;
}

export interface NearbyPlace {
  name: string;
  type: string;
  reason: string;
}

export interface ReasoningResult {
  scene?: VisionScene;
  intent: string;
  reasoning: string;
  recommendations: Recommendation[];
  route?: RouteSummary;
  nearbyPlaces: NearbyPlace[];
  warnings: string[];
  confidence: number;
}
