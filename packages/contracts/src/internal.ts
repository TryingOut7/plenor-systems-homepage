import type { BackendErrorResponse } from './errors';

export interface InternalSeedErrorResponse {
  error: string;
  success?: BackendErrorResponse['success'];
  code?: BackendErrorResponse['code'];
  message?: BackendErrorResponse['message'];
  status?: BackendErrorResponse['status'];
  requestId?: BackendErrorResponse['requestId'];
  retryAfterSeconds?: BackendErrorResponse['retryAfterSeconds'];
  details?: BackendErrorResponse['details'];
}
