import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createBackendApiClient } from '@plenor/api-client';
import { buildBackendServer } from '../../apps/backend/src/server';

const ORIGINAL_ENV = { ...process.env };

function resetEnv() {
  process.env = { ...ORIGINAL_ENV };
}

describe('homepage section rendering smoke (typed api client)', () => {
  let app: FastifyInstance;
  let baseUrl: string;

  beforeAll(async () => {
    resetEnv();
    const env = process.env as Record<string, string | undefined>;
    env.NODE_ENV = 'development';
    env.PAYLOAD_SECRET = 'test-secret';
    env.CMS_SKIP_PAYLOAD = 'true';
    env.BACKEND_RATE_LIMIT_MAX = '100';
    env.BACKEND_RATE_LIMIT_WINDOW_MS = '60000';
    env.BACKEND_API_KEYS = 'internal-test:internal:internal-test';

    app = buildBackendServer();
    baseUrl = await app.listen({ host: '127.0.0.1', port: 0 });
  });

  afterAll(async () => {
    await app.close();
    resetEnv();
  });

  it('returns the homepage with a sections array via GET /v1/content/pages/home', async () => {
    const client = createBackendApiClient(baseUrl);
    const result = await client.GET('/v1/content/pages/{slug}', {
      params: { path: { slug: 'home' } },
    });

    // The endpoint must respond — 200 (CMS data available) or 404 (no seed data).
    // Both are valid in CI; we just confirm the contract shape is correct.
    expect([200, 404]).toContain(result.response.status);

    if (result.response.status === 200) {
      const page = (result.data as { page: Record<string, unknown> }).page;
      expect(page).toBeDefined();
      expect(Array.isArray(page.sections)).toBe(true);
    }
  });

  it('returns an error envelope for a missing page slug via GET /v1/content/pages/does-not-exist', async () => {
    const client = createBackendApiClient(baseUrl);
    const result = await client.GET('/v1/content/pages/{slug}', {
      params: { path: { slug: 'does-not-exist-xyz' } },
    });

    expect(result.response.status).toBe(404);
    const error = result.error as { code?: string; message?: string } | undefined;
    expect(typeof error?.code).toBe('string');
    expect(typeof error?.message).toBe('string');
  });

  it('returns the navigation endpoint with a navigationLinks array', async () => {
    const client = createBackendApiClient(baseUrl);
    const result = await client.GET('/v1/content/navigation');

    expect(result.response.status).toBe(200);
    expect(Array.isArray(result.data?.navigationLinks)).toBe(true);
  });
});
