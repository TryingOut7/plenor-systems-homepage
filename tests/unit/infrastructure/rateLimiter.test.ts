import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RequestContext } from '@/application/shared/requestContext';

const ORIGINAL_ENV = { ...process.env };

function context(overrides: Partial<RequestContext> = {}): RequestContext {
  return {
    requestId: 'req_test',
    method: 'GET',
    path: '/v1/search',
    url: 'http://localhost:3000/v1/search',
    origin: 'http://localhost:3000',
    host: 'localhost:3000',
    forwardedHost: null,
    forwardedProto: 'http',
    realIp: '127.0.0.1',
    forwardedFor: null,
    authorization: null,
    apiKey: null,
    idempotencyKey: null,
    ...overrides,
  };
}

describe('rate limiter fallback behavior', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('enforces window limits using local fallback when shared store is not configured', async () => {
    const env = process.env as Record<string, string | undefined>;
    delete env.SUPABASE_URL;
    delete env.SUPABASE_SERVICE_ROLE_KEY;

    const mod = await import('@/infrastructure/security/rateLimiter');
    const { checkRateLimit } = mod;

    for (let i = 0; i < 5; i += 1) {
      const result = await checkRateLimit(context());
      expect(result).toBeNull();
    }

    const limited = await checkRateLimit(context());
    expect(limited?.status).toBe(429);
    expect(limited?.headers?.['Retry-After']).toBeTruthy();
  });

  it('uses a higher limit for draft-mode enable to avoid breaking live preview', async () => {
    const env = process.env as Record<string, string | undefined>;
    delete env.SUPABASE_URL;
    delete env.SUPABASE_SERVICE_ROLE_KEY;

    const mod = await import('@/infrastructure/security/rateLimiter');
    const { checkRateLimit } = mod;

    for (let i = 0; i < 60; i += 1) {
      const result = await checkRateLimit(
        context({ path: '/api/draft-mode/enable', url: 'http://localhost:3000/api/draft-mode/enable' }),
      );
      expect(result).toBeNull();
    }

    const limited = await checkRateLimit(
      context({ path: '/api/draft-mode/enable', url: 'http://localhost:3000/api/draft-mode/enable' }),
    );
    expect(limited?.status).toBe(429);
    expect(limited?.headers?.['Retry-After']).toBeTruthy();
  });
});
