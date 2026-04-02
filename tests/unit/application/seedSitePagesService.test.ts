import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SeedRepository } from '@/application/ports/seedRepository';
import type { RequestContext } from '@/application/shared/requestContext';
import { seedSitePagesForRequest } from '@/application/internal/seedSitePagesService';

const ORIGINAL_ENV = { ...process.env };

function resetEnv(): void {
  process.env = { ...ORIGINAL_ENV };
}

function context(overrides: Partial<RequestContext> = {}): RequestContext {
  return {
    requestId: 'test-request-id',
    method: 'POST',
    path: '/api/internal/seed-site-pages',
    url: 'http://localhost:3000/api/internal/seed-site-pages',
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

function repo(result: unknown): SeedRepository {
  return {
    async runSitePageSeed() {
      return result;
    },
  };
}

describe('seedSitePagesForRequest', () => {
  beforeEach(() => {
    resetEnv();
    const env = process.env as Record<string, string | undefined>;
    env.NODE_ENV = 'development';
  });

  afterEach(() => {
    resetEnv();
  });

  it('accepts valid bearer secret', async () => {
    process.env.PAYLOAD_SECRET = 'seed-secret';

    const result = await seedSitePagesForRequest(
      context({ authorization: 'Bearer seed-secret' }),
      repo({ seeded: true }),
    );

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ seeded: true });
  });

  it('accepts valid internal api key without bearer secret', async () => {
    delete process.env.PAYLOAD_SECRET;
    delete process.env.PAYLOAD_SEED_SECRET;
    process.env.BACKEND_API_KEYS = 'internal-test:internal:internal-default';

    const result = await seedSitePagesForRequest(
      context({ apiKey: 'internal-test' }),
      repo({ seeded: true }),
    );

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ seeded: true });
  });

  it('rejects invalid api key when bearer token is absent', async () => {
    process.env.BACKEND_API_KEYS = 'internal-test:internal:internal-default';

    const result = await seedSitePagesForRequest(
      context({ apiKey: 'not-valid' }),
      repo({ seeded: true }),
    );

    expect(result.status).toBe(401);
    expect(result.body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 401 when bearer auth is provided but secret is missing', async () => {
    delete process.env.PAYLOAD_SECRET;
    delete process.env.PAYLOAD_SEED_SECRET;

    const result = await seedSitePagesForRequest(
      context({ authorization: 'Bearer token-only' }),
      repo({ seeded: true }),
    );

    expect(result.status).toBe(401);
    expect(result.body).toEqual({ error: 'Unauthorized' });
  });
});
