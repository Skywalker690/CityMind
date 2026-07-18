import { ZodError } from "zod";

import {
  apiError,
  apiSuccess,
  parseMultipartRequest,
  RequestBodyError,
  requestBodyError,
  validationError
} from "@/lib/api";
import { MAX_IMAGE_SIZE_BYTES } from "@/lib/constants";
import { coordinatesSchema } from "@/lib/validators";
import { createFallbackScene } from "@/services/fallbackData";
import { analyzeImage } from "@/services/visionService";
import type { Coordinates } from "@/types/map";

export const runtime = "nodejs";

const MAX_LOCATION_FIELD_LENGTH = 256;
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml"
]);

export async function POST(request: Request) {
  try {
    const formData = await parseMultipartRequest(request);
    const image = getSingleFormValue(formData, "image");

    if (!(image instanceof File)) {
      return apiError("IMAGE_REQUIRED", "Upload an image to analyze.", 400);
    }

    if (!SUPPORTED_IMAGE_TYPES.has(image.type)) {
      return apiError("INVALID_IMAGE", "The uploaded file must be an image.", 400);
    }

    if (image.size === 0) {
      return apiError("INVALID_IMAGE", "The uploaded image is empty.", 400);
    }

    if (image.size > MAX_IMAGE_SIZE_BYTES) {
      return apiError("IMAGE_TOO_LARGE", "Images must be 5 MB or smaller for the MVP.", 400);
    }

    const location = parseLocation(getSingleFormValue(formData, "location"));
    const scene =
      image.type === "image/svg+xml"
        ? {
            ...createFallbackScene(location),
            warnings: [
              "SVG uploads are treated as vector demo assets and are not sent to live AI vision. Use a JPEG, PNG, or camera capture for live vision."
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

    if (error instanceof RequestBodyError) {
      return requestBodyError(error);
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
    if (value === null || (typeof value === "string" && value.trim().length === 0)) {
      return undefined;
    }

    throw new RequestBodyError("Location must be supplied as JSON coordinates.", ["location"]);
  }

  const locationValue = value.trim();

  if (locationValue.length > MAX_LOCATION_FIELD_LENGTH) {
    throw new RequestBodyError("Location data is too large.", ["location"]);
  }

  try {
    return coordinatesSchema.parse(JSON.parse(locationValue));
  } catch (error) {
    if (error instanceof ZodError) {
      throw error;
    }

    throw new RequestBodyError("Location must contain valid JSON coordinates.", ["location"]);
  }
}

function getSingleFormValue(
  formData: FormData,
  fieldName: "image" | "location"
): FormDataEntryValue | null {
  const values = formData.getAll(fieldName);

  if (values.length > 1) {
    throw new RequestBodyError(
      `${fieldName === "image" ? "Image" : "Location"} may only be provided once.`,
      [fieldName]
    );
  }

  return values[0] ?? null;
}

async function fileToDataUrl(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}
