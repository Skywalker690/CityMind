import { ZodError } from "zod";

import {
  apiError,
  apiSuccess,
  parseJsonRequest,
  RequestBodyError,
  requestBodyError,
  validationError
} from "@/lib/api";
import { normalizeReasoningResult, normalizeVisionScene } from "@/lib/normalizers";
import { chatRequestSchema } from "@/lib/validators";
import { continueConversation } from "@/services/chatService";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await parseJsonRequest(request, chatRequestSchema);
    const result = await continueConversation({
      conversation: payload.conversation,
      latestMessage: payload.latestMessage,
      persona: payload.persona,
      scene: payload.scene ? normalizeVisionScene(payload.scene) : undefined,
      recommendation: payload.recommendation
        ? normalizeReasoningResult(payload.recommendation)
        : undefined
    });

    return apiSuccess(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error);
    }

    if (error instanceof RequestBodyError) {
      return requestBodyError(error);
    }

    return apiError("CHAT_FAILED", "Unable to continue the conversation right now.", 503);
  }
}
