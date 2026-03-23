import { describe, expect, it } from 'vitest';
import { toBackendErrorResponse } from '../../../apps/backend/src/adapters/errorEnvelope';

describe('backend error envelope mapping', () => {
  it('maps legacy message body to standardized envelope', () => {
    const mapped = toBackendErrorResponse({
      status: 400,
      requestId: 'req-1',
      body: {
        message: 'Validation failed',
      },
    });

    expect(mapped).toEqual({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      error: 'Validation failed',
      status: 400,
      requestId: 'req-1',
      retryAfterSeconds: undefined,
      details: undefined,
    });
  });

  it('maps rate-limit headers with retryAfterSeconds', () => {
    const mapped = toBackendErrorResponse({
      status: 429,
      requestId: 'req-2',
      body: {
        code: 'RATE_LIMITED',
        message: 'Too many requests.',
      },
      headers: {
        'Retry-After': '42',
      },
    });

    expect(mapped.code).toBe('RATE_LIMITED');
    expect(mapped.retryAfterSeconds).toBe(42);
    expect(mapped.status).toBe(429);
  });
});
