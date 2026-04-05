import type { BackendErrorCode, BackendErrorResponse } from '@plenor/contracts/errors';

type RawErrorBody = Record<string, unknown> | string | null | undefined;

function defaultMessageByStatus(status: number): string {
  if (status === 400) return 'Validation failed.';
  if (status === 401) return 'Unauthorized.';
  if (status === 403) return 'Forbidden.';
  if (status === 404) return 'Not found.';
  if (status === 409) return 'Conflict.';
  if (status === 429) return 'Too many requests.';
  if (status === 503) return 'Dependency unavailable.';
  if (status >= 500) return 'Internal server error.';
  return 'Request failed.';
}

function defaultCodeByStatus(status: number): BackendErrorCode {
  if (status === 400) return 'VALIDATION_ERROR';
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  if (status === 429) return 'RATE_LIMITED';
  if (status === 503) return 'DEPENDENCY_UNAVAILABLE';
  if (status >= 500) return 'INTERNAL_ERROR';
  return 'INTERNAL_ERROR';
}

function readMessage(body: RawErrorBody, fallback: string): string {
  if (typeof body === 'string') return body;
  if (!body || typeof body !== 'object') return fallback;
  if (typeof body.message === 'string') return body.message;
  if (typeof body.error === 'string') return body.error;
  return fallback;
}

function readCode(body: RawErrorBody, status: number): BackendErrorCode {
  if (!body || typeof body !== 'object') {
    return defaultCodeByStatus(status);
  }

  const code = body.code;
  if (typeof code === 'string') {
    return code as BackendErrorCode;
  }
  return defaultCodeByStatus(status);
}

function readDetails(body: RawErrorBody): Record<string, unknown> | undefined {
  if (!body || typeof body !== 'object') return undefined;
  if (!body.details || typeof body.details !== 'object') return undefined;
  return body.details as Record<string, unknown>;
}

function readRetryAfterSeconds(headers: Record<string, string> | undefined): number | undefined {
  if (!headers) return undefined;
  const raw = headers['Retry-After'] ?? headers['retry-after'];
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function toBackendErrorResponse(input: {
  status: number;
  requestId?: string;
  body?: RawErrorBody;
  headers?: Record<string, string>;
}): BackendErrorResponse {
  const message = readMessage(
    input.body,
    defaultMessageByStatus(input.status),
  );

  return {
    success: false,
    status: input.status,
    code: readCode(input.body, input.status),
    message,
    error: message,
    requestId: input.requestId,
    retryAfterSeconds: readRetryAfterSeconds(input.headers),
    details: readDetails(input.body),
  };
}
