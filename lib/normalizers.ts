import type {
  Coordinates,
  Destination,
  DestinationResolution,
  RouteSummary
} from "@/types/map";
import type { ReasoningResult } from "@/types/recommendation";
import type { VisionScene } from "@/types/vision";

type NullableVisionScene = Omit<VisionScene, "location"> & {
  location?: Coordinates | null;
};

type NullableReasoningResult = Omit<ReasoningResult, "scene" | "route"> & {
  scene?: NullableVisionScene | null;
  route?: RouteSummary | null;
};

interface ReasoningEnrichment {
  destination?: Destination;
  destinationResolution?: DestinationResolution;
  route?: RouteSummary;
  /** Use only server-generated route data instead of a model-provided route. */
  replaceRoute?: boolean;
}

export function normalizeVisionScene(scene: NullableVisionScene): VisionScene {
  return {
    ...scene,
    location: scene.location ?? undefined
  };
}

export function normalizeReasoningResult(
  result: NullableReasoningResult,
  fallbackScene?: VisionScene,
  enrichment?: ReasoningEnrichment
): ReasoningResult {
  const destination = enrichment?.destination ?? result.destination;
  const destinationResolution =
    enrichment?.destinationResolution ?? result.destinationResolution;

  return {
    ...result,
    scene: result.scene ? normalizeVisionScene(result.scene) : fallbackScene,
    destination: destination ?? undefined,
    destinationResolution: destinationResolution ?? undefined,
    route: enrichment?.replaceRoute
      ? enrichment.route
      : result.route ?? enrichment?.route
  };
}
