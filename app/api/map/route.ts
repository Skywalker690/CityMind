import { ZodError } from "zod";

import {
  apiError,
  apiSuccess,
  parseJsonRequest,
  RequestBodyError,
  requestBodyError,
  validationError
} from "@/lib/api";
import { mapRequestSchema } from "@/lib/validators";
import { generateRoute } from "@/services/mapService";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await parseJsonRequest(request, mapRequestSchema);
    const result = await generateRoute(payload);

    return apiSuccess({
      route: result.route ?? null,
      destination: result.destination ?? null,
      destinationResolution: result.destinationResolution,
      distance: result.route?.distanceMeters ?? null,
      duration: result.route?.durationSeconds ?? null,
      warnings: result.warnings
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error);
    }

    if (error instanceof RequestBodyError) {
      return requestBodyError(error);
    }

    return apiError("MAP_FAILED", "Unable to prepare the route right now.", 503);
  }
}
