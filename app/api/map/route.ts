import { ZodError } from "zod";

import { apiError, apiSuccess, validationError } from "@/lib/api";
import { mapRequestSchema } from "@/lib/validators";
import { generateRoute } from "@/services/mapService";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = mapRequestSchema.parse(await request.json());
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

    return apiError("MAP_FAILED", "Unable to prepare the route right now.", 503);
  }
}
