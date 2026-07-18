import { ZodError } from "zod";

import { apiSuccess, validationError } from "@/lib/api";
import { getPersona } from "@/lib/personas";
import { personaRequestSchema } from "@/lib/validators";

export function POST(request: Request) {
  return request
    .json()
    .then((body) => {
      const payload = personaRequestSchema.parse(body);
      return apiSuccess({
        persona: getPersona(payload.persona)
      });
    })
    .catch((error: unknown) => {
      if (error instanceof ZodError) {
        return validationError(error);
      }

      return validationError(
        new ZodError([
          {
            code: "custom",
            path: ["persona"],
            message: "Unsupported persona."
          }
        ])
      );
    });
}
