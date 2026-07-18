import { NextResponse } from "next/server";
import { ZodError } from "zod";

import type { ApiFailure, ApiSuccess } from "@/types/api";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>(
    {
      success: true,
      data
    },
    { status }
  );
}

export function apiError(
  code: string,
  message: string,
  status = 500,
  details?: unknown[]
) {
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
  return apiError(
    "VALIDATION_ERROR",
    "The request could not be validated.",
    400,
    error.issues
  );
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}
