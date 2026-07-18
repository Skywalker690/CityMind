import { ZodError } from "zod";

import { apiError, apiSuccess, validationError } from "@/lib/api";
import { MAX_IMAGE_SIZE_BYTES } from "@/lib/constants";
import { coordinatesSchema } from "@/lib/validators";
import { createFallbackScene } from "@/services/fallbackData";
import { analyzeImage } from "@/services/visionService";
import type { Coordinates } from "@/types/map";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return apiError("IMAGE_REQUIRED", "Upload an image to analyze.", 400);
    }

    if (!image.type.startsWith("image/")) {
      return apiError("INVALID_IMAGE", "The uploaded file must be an image.", 400);
    }

    if (image.size > MAX_IMAGE_SIZE_BYTES) {
      return apiError(
        "IMAGE_TOO_LARGE",
        "Images must be 5 MB or smaller for the MVP.",
        400
      );
    }

    const location = parseLocation(formData.get("location"));
    const scene =
      image.type === "image/svg+xml"
        ? {
            ...createFallbackScene(location),
            warnings: [
              "SVG uploads are treated as vector demo assets and are not sent to live AI vision. Use a JPEG, PNG, or camera capture for live vision.",
            ]
          }
        : await analyzeImage({
            imageDataUrl: await fileToDataUrl(image),
            location
          });

    return apiSuccess({
      scene,
      visionSummary: {
        sceneType: scene.sceneType,
        summary: scene.summary,
        landmarks: scene.landmarks,
        accessibility: scene.accessibility
      },
      confidence: scene.confidence
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error);
    }

    return apiError(
      "VISION_FAILED",
      "Unable to analyze image. Please retry or upload another image.",
      503
    );
  }
}

function parseLocation(value: FormDataEntryValue | null): Coordinates | undefined {
  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  return coordinatesSchema.parse(JSON.parse(value));
}

async function fileToDataUrl(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}
