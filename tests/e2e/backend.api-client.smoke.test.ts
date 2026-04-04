import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createBackendApiClient } from '@plenor/api-client';
import { buildBackendServer } from '../../apps/backend/src/server';

const ORIGINAL_ENV = { ...process.env };

function resetEnv() {
  process.env = { ...ORIGINAL_ENV };
}

function hasErrorEnvelope(
  value: unknown,
): value is { code: string; message: string } {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as { code?: unknown }).code === 'string' &&
    typeof (value as { message?: unknown }).message === 'string'
  );
}

describe('backend smoke e2e (typed api client)', () => {
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
    env.ALLOW_IN_MEMORY_RATE_LIMIT_FALLBACK = 'true';
    env.BACKEND_API_KEYS = 'internal-test:internal:internal-test,admin-test:admin:admin-test';

    app = buildBackendServer();
    baseUrl = await app.listen({ host: '127.0.0.1', port: 0 });
  });

  afterAll(async () => {
    await app.close();
    resetEnv();
  });

  it('calls /health via generated typed client', async () => {
    const client = createBackendApiClient(baseUrl);
    const result = await client.GET('/health');

    expect(result.response.status).toBe(200);
    expect(result.data?.ok).toBe(true);
    expect(result.response.headers.get('x-request-id')).toBeTruthy();
  });

  it('calls validation/error routes through typed client', async () => {
    const client = createBackendApiClient(baseUrl);

    const search = await client.GET('/v1/search');
    expect(search.response.status).toBe(400);
    expect(hasErrorEnvelope(search.error)).toBe(true);

    const guide = await client.POST('/v1/forms/guide', {
      headers: { origin: 'http://localhost:3000' },
      body: {},
    });
    expect(guide.response.status).toBe(400);
    expect(hasErrorEnvelope(guide.error)).toBe(true);

    const seed = await client.POST('/v1/internal/seed-site-pages', {
      headers: {
        origin: 'http://localhost:3000',
        authorization: 'Bearer bad',
      },
    });
    expect(seed.response.status).toBe(401);
    expect(seed.error?.code).toBe('UNAUTHORIZED');
  });

  it('calls new content and secured admin/integration routes through typed client', async () => {
    const client = createBackendApiClient(baseUrl);

    const navigation = await client.GET('/v1/content/navigation');
    expect(navigation.response.status).toBe(200);
    expect(Array.isArray(navigation.data?.navigationLinks)).toBe(true);

    const adminDenied = await client.GET('/v1/admin/submissions');
    expect(adminDenied.response.status).toBe(401);

    const adminAllowed = await client.GET('/v1/admin/submissions', {
      headers: { 'x-api-key': 'admin-test' },
    });
    expect(adminAllowed.response.status).toBe(200);

    const integrationsDenied = await client.GET('/v1/integrations/status');
    expect(integrationsDenied.response.status).toBe(401);

    const integrationsAllowed = await client.GET('/v1/integrations/status', {
      headers: { 'x-api-key': 'internal-test' },
    });
    expect(integrationsAllowed.response.status).toBe(200);
  });
});
