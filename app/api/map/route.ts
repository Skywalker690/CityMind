import { ZodError } from "zod";

import { apiError, apiSuccess, validationError } from "@/lib/api";
import { mapRequestSchema } from "@/lib/validators";
import { generateRoute } from "@/services/mapService";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = mapRequestSchema.parse(await request.json());
    const destination =
      payload.destination && "latitude" in payload.destination
        ? payload.destination
        : payload.destination?.coordinates;
    const route = await generateRoute({
      origin: payload.origin,
      destination,
      persona: payload.persona
    });

    return apiSuccess({
      route,
      distance: route.distanceMeters,
      duration: route.durationSeconds
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error);
    }

    return apiError("MAP_FAILED", "Unable to prepare the route right now.", 503);
  }
}
