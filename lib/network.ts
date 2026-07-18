export class RequestTimeoutError extends Error {
  constructor(operation: string, timeoutMs: number) {
    super(`${operation} timed out after ${Math.ceil(timeoutMs / 1000)} seconds.`);
    this.name = "RequestTimeoutError";
  }
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number,
  operation: string
) {
  return withTimeout((signal) => fetch(input, { ...init, signal }), timeoutMs, operation);
}

export async function withTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  operationName: string
) {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    return await operation(controller.signal);
  } catch (error) {
    if (timedOut) {
      throw new RequestTimeoutError(operationName, timeoutMs);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
