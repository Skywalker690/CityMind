import type { Coordinates, RouteSummary } from "@/types/map";
import type { ReasoningResult } from "@/types/recommendation";
import type { VisionScene } from "@/types/vision";

type NullableVisionScene = Omit<VisionScene, "location"> & {
  location?: Coordinates | null;
};

type NullableReasoningResult = Omit<ReasoningResult, "scene" | "route"> & {
  scene?: NullableVisionScene | null;
  route?: RouteSummary | null;
};

export function normalizeVisionScene(scene: NullableVisionScene): VisionScene {
  return {
    ...scene,
    location: scene.location ?? undefined
  };
}

export function normalizeReasoningResult(
  result: NullableReasoningResult,
  fallbackScene?: VisionScene,
  fallbackRoute?: RouteSummary
): ReasoningResult {
  return {
    ...result,
    scene: result.scene ? normalizeVisionScene(result.scene) : fallbackScene,
    route: result.route ?? fallbackRoute
  };
}
