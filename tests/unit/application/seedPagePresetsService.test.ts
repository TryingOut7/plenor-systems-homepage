import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { RequestContext } from '@/application/shared/requestContext';
import { seedPagePresetsForRequest } from '@/application/internal/seedPagePresetsService';

const ORIGINAL_ENV = { ...process.env };

function resetEnv(): void {
  process.env = { ...ORIGINAL_ENV };
}

function context(overrides: Partial<RequestContext> = {}): RequestContext {
  return {
    requestId: 'test-request-id',
    method: 'POST',
    path: '/api/internal/seed-page-presets',
    url: 'http://localhost:3000/api/internal/seed-page-presets',
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

function repo(result: unknown): { runPagePresetSeed(): Promise<unknown> } {
  return {
    async runPagePresetSeed() {
      return result;
    },
  };
}

describe('seedPagePresetsForRequest', () => {
  beforeEach(() => {
    resetEnv();
  });

  afterEach(() => {
    resetEnv();
  });

  it('accepts valid bearer secret', async () => {
    const env = process.env as Record<string, string | undefined>;
    env.NODE_ENV = 'development';
    process.env.PAYLOAD_SECRET = 'seed-secret';

    const result = await seedPagePresetsForRequest(
      context({ authorization: 'Bearer seed-secret' }),
      repo({ seeded: true }),
    );

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ seeded: true });
  });

  it('accepts valid internal api key without bearer secret', async () => {
    const env = process.env as Record<string, string | undefined>;
    env.NODE_ENV = 'development';
    delete process.env.PAYLOAD_SECRET;
    delete process.env.PAYLOAD_SEED_SECRET;
    process.env.BACKEND_API_KEYS = 'internal-test:internal:internal-default';

    const result = await seedPagePresetsForRequest(
      context({ apiKey: 'internal-test' }),
      repo({ seeded: true }),
    );

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ seeded: true });
  });

  it('remains available in production with valid auth', async () => {
    const env = process.env as Record<string, string | undefined>;
    env.NODE_ENV = 'production';
    process.env.PAYLOAD_SECRET = 'seed-secret';

    const result = await seedPagePresetsForRequest(
      context({ authorization: 'Bearer seed-secret' }),
      repo({ seeded: true }),
    );

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ seeded: true });
  });

  it('returns 401 when credentials are missing or invalid', async () => {
    const env = process.env as Record<string, string | undefined>;
    env.NODE_ENV = 'production';
    process.env.PAYLOAD_SECRET = 'seed-secret';

    const result = await seedPagePresetsForRequest(
      context({ authorization: 'Bearer wrong-token' }),
      repo({ seeded: true }),
    );

    expect(result.status).toBe(401);
    expect(result.body).toEqual({ error: 'Unauthorized' });
  });
});
