import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildBackendServer } from '../../apps/backend/src/server';

const ORIGINAL_ENV = { ...process.env };

function resetEnv() {
  process.env = { ...ORIGINAL_ENV };
}

describe('backend route integration', () => {
  let app: FastifyInstance;

  beforeEach(() => {
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
  });

  afterEach(async () => {
    await app.close();
    resetEnv();
  });

  it('responds on /health with request id header', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers['x-request-id']).toBeTruthy();
    expect(res.json()).toMatchObject({
      ok: true,
      service: 'plenor-backend',
    });
  });

  it('returns search validation error for empty query', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/search',
    });

    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.message).toContain('At least one search parameter is required');
    expect(body.error).toContain('At least one search parameter is required');
  });

  it('validates guide form payload', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/forms/guide',
      headers: {
        origin: 'http://localhost:3000',
      },
      payload: {},
    });

    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.message).toBe('Name is required (max 200 characters).');
  });

  it('validates inquiry form payload', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/forms/inquiry',
      headers: {
        origin: 'http://localhost:3000',
      },
      payload: {},
    });

    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.message).toBe('Name is required (max 200 characters).');
  });

  it('enforces auth for internal seed endpoint', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/internal/seed-site-pages',
      headers: {
        origin: 'http://localhost:3000',
        authorization: 'Bearer wrong-token',
      },
      payload: {},
    });

    expect(res.statusCode).toBe(401);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.code).toBe('UNAUTHORIZED');
    expect(body.message).toBe('Missing or invalid API key.');
  });

  it('supports idempotent replay for form submission POST', async () => {
    const headers = {
      origin: 'http://localhost:3000',
      'idempotency-key': 'guide-idempotency-1',
    };

    const first = await app.inject({
      method: 'POST',
      url: '/v1/forms/guide',
      headers,
      payload: {
        name: 'Alice',
        email: 'alice@example.com',
      },
    });

    const second = await app.inject({
      method: 'POST',
      url: '/v1/forms/guide',
      headers,
      payload: {
        name: 'Alice',
        email: 'alice@example.com',
      },
    });

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(second.headers['x-idempotent-replay']).toBe('true');
    expect(second.json()).toEqual(first.json());
  });

  it('exposes readiness and metrics endpoints with role-based auth', async () => {
    const ready = await app.inject({
      method: 'GET',
      url: '/health/ready',
    });

    expect(ready.statusCode).toBe(200);
    expect(ready.json().dependencies).toBeTruthy();

    const unauthorizedMetrics = await app.inject({
      method: 'GET',
      url: '/metrics',
    });
    expect(unauthorizedMetrics.statusCode).toBe(401);
    expect(unauthorizedMetrics.json().code).toBe('UNAUTHORIZED');

    const metrics = await app.inject({
      method: 'GET',
      url: '/metrics',
      headers: {
        'x-api-key': 'internal-test',
      },
    });
    expect(metrics.statusCode).toBe(200);
    expect(metrics.json().requests).toBeTruthy();
  });

  it('fails readiness in production when persistence is unavailable', async () => {
    const env = process.env as Record<string, string | undefined>;
    env.NODE_ENV = 'production';
    env.CMS_SKIP_PAYLOAD = 'true';
    env.NEXT_PUBLIC_SERVER_URL = 'https://example.com';
    delete env.SUPABASE_URL;
    delete env.SUPABASE_SERVICE_ROLE_KEY;

    const prodApp = buildBackendServer();
    try {
      const ready = await prodApp.inject({
        method: 'GET',
        url: '/health/ready',
      });

      expect(ready.statusCode).toBe(503);
      expect(ready.json().ok).toBe(false);
      expect(
        ready.json().dependencies.persistence.idempotencyAndOutboxPersistentStoreReady,
      ).toBe(false);
      expect(
        ready.json().dependencies.persistence.requiredPersistenceTablesReady,
      ).toBe(false);
    } finally {
      await prodApp.close();
    }
  });

  it('fails fast in production when CORS allowlist is not configured', () => {
    const env = process.env as Record<string, string | undefined>;
    env.NODE_ENV = 'production';
    env.CMS_SKIP_PAYLOAD = 'true';
    delete env.BACKEND_CORS_ORIGINS;
    delete env.NEXT_PUBLIC_SERVER_URL;

    expect(() => buildBackendServer()).toThrow(
      'BACKEND_CORS_ORIGINS (or NEXT_PUBLIC_SERVER_URL) must be set in production',
    );
  });

  it('serves new content and admin APIs', async () => {
    const content = await app.inject({
      method: 'GET',
      url: '/v1/content/pages/home',
    });
    expect([200, 404]).toContain(content.statusCode);

    const nav = await app.inject({
      method: 'GET',
      url: '/v1/content/navigation',
    });
    expect(nav.statusCode).toBe(200);

    const adminUnauthorized = await app.inject({
      method: 'GET',
      url: '/v1/admin/submissions',
    });
    expect(adminUnauthorized.statusCode).toBe(401);

    const adminAuthorized = await app.inject({
      method: 'GET',
      url: '/v1/admin/submissions',
      headers: {
        'x-api-key': 'admin-test',
      },
    });
    expect(adminAuthorized.statusCode).toBe(200);
  });

  it('serves integration status with internal/admin role key', async () => {
    const denied = await app.inject({
      method: 'GET',
      url: '/v1/integrations/status',
    });
    expect(denied.statusCode).toBe(401);

    const allowed = await app.inject({
      method: 'GET',
      url: '/v1/integrations/status',
      headers: {
        'x-api-key': 'internal-test',
      },
    });
    expect(allowed.statusCode).toBe(200);
    expect(allowed.json().providers).toBeTruthy();
  });
});
