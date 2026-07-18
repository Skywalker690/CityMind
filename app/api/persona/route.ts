import { ZodError } from "zod";

import {
  apiSuccess,
  parseJsonRequest,
  RequestBodyError,
  requestBodyError,
  validationError
} from "@/lib/api";
import { getPersona } from "@/lib/personas";
import { personaRequestSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = await parseJsonRequest(request, personaRequestSchema);

    return apiSuccess({
      persona: getPersona(payload.persona)
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error);
    }

    if (error instanceof RequestBodyError) {
      return requestBodyError(error);
    }

    return requestBodyError(new RequestBodyError("The request body could not be validated."));
  }
}
