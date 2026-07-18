import { ZodError } from "zod";

import { apiError, apiSuccess, validationError } from "@/lib/api";
import { normalizeVisionScene } from "@/lib/normalizers";
import { reasonRequestSchema } from "@/lib/validators";
import { generateReasoning } from "@/services/reasoningService";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = reasonRequestSchema.parse(await request.json());
    const scene = normalizeVisionScene(payload.scene);
    const result = await generateReasoning({
      scene,
      persona: payload.persona,
      userPrompt: payload.userPrompt,
      location: payload.location
    });

    return apiSuccess(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error);
    }

    return apiError(
      "REASONING_FAILED",
      "Unable to generate a recommendation right now.",
      503
    );
  }
}
