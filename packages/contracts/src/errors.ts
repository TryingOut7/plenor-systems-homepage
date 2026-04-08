export type BackendErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'ALREADY_EXISTS'
  | 'REGISTRATION_FULL'
  | 'REGISTRATION_NOT_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'TRANSITION_FORBIDDEN'
  | 'MISSING_IDEMPOTENCY_KEY'
  | 'RATE_LIMITED'
  | 'IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD'
  | 'BACKEND_UNAVAILABLE'
  | 'DEPENDENCY_UNAVAILABLE'
  | 'INTERNAL_ERROR';

export interface BackendErrorResponse {
  success: false;
  code: BackendErrorCode;
  message: string;
  status: number;
  requestId?: string;
  retryAfterSeconds?: number;
  details?: Record<string, unknown>;
  /**
   * Legacy alias for clients that previously read top-level `error`.
   */
  error?: string;
}
