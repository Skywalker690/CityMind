import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import type { ApiFailure, ApiSuccess } from "@/types/api";

const JSON_CONTENT_TYPE = "application/json";
const MULTIPART_CONTENT_TYPE = "multipart/form-data";

export class RequestBodyError extends Error {
  constructor(
    message: string,
    readonly path: Array<string | number> = []
  ) {
    super(message);
    this.name = "RequestBodyError";
  }
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>(
    {
      success: true,
      data
    },
    { status }
  );
}

export function apiError(code: string, message: string, status = 500, details?: unknown[]) {
  return NextResponse.json<ApiFailure>(
    {
      success: false,
      error: {
        code,
        message,
        details
      }
    },
    { status }
  );
}

export function validationError(error: ZodError) {
  return apiError("VALIDATION_ERROR", "The request could not be validated.", 400, error.issues);
}

/**
 * Returns the same public validation envelope for malformed body encodings as
 * for Zod validation failures. Details are intentionally safe to expose.
 */
export function requestBodyError(error: RequestBodyError) {
  return apiError("VALIDATION_ERROR", "The request could not be validated.", 400, [
    {
      code: "custom",
      path: error.path,
      message: error.message
    }
  ]);
}

/**
 * Parses an explicitly JSON request before passing its unknown payload through
 * a Zod schema. JSON syntax and content-type errors are client errors, not
 * provider failures.
 */
export async function parseJsonRequest<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema
): Promise<z.infer<TSchema>> {
  requireContentType(request, JSON_CONTENT_TYPE);

  try {
    return schema.parse(await request.json());
  } catch (error) {
    if (error instanceof ZodError) {
      throw error;
    }

    throw new RequestBodyError("The request body must contain valid JSON.");
  }
}

/**
 * Parses a multipart upload only when the request declares the expected
 * encoding. This keeps malformed form payloads on the validation path.
 */
export async function parseMultipartRequest(request: Request): Promise<FormData> {
  requireContentType(request, MULTIPART_CONTENT_TYPE);

  try {
    return await request.formData();
  } catch {
    throw new RequestBodyError("The multipart form data could not be parsed.");
  }
}

function requireContentType(request: Request, expected: string) {
  const mediaType =
    request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() ?? "";

  if (mediaType !== expected) {
    throw new RequestBodyError(`Expected a ${expected} request body.`);
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}
