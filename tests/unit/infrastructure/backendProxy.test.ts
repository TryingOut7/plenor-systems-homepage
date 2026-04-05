import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';

const ORIGINAL_ENV = { ...process.env };

function makeRequest() {
  return new NextRequest('http://localhost:3000/api/guide?x=1', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost:3000',
      'x-request-id': 'req-test-1',
    },
    body: JSON.stringify({ name: 'Alice' }),
  });
}

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.restoreAllMocks();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.restoreAllMocks();
});

describe('backend proxy fail-closed behavior', () => {
  it('returns null when backend split is not configured', async () => {
    delete process.env.BACKEND_INTERNAL_URL;
    const result = await proxyRequestToBackend(makeRequest(), '/v1/forms/guide');
    expect(result).toBeNull();
  });

  it('returns 503 with BACKEND_UNAVAILABLE for invalid backend URL config', async () => {
    process.env.BACKEND_INTERNAL_URL = '://invalid-url';
    const result = await proxyRequestToBackend(makeRequest(), '/v1/forms/guide');

    expect(result).not.toBeNull();
    expect(result?.status).toBe(503);

    const body = await result?.json();
    expect(body?.code).toBe('BACKEND_UNAVAILABLE');
    expect(body?.details).toMatchObject({
      reason: 'invalid_backend_internal_url',
    });
  });

  it('returns 503 and does not fall back when backend fetch fails', async () => {
    process.env.BACKEND_INTERNAL_URL = 'http://127.0.0.1:18000';
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('connect failed'));

    const result = await proxyRequestToBackend(makeRequest(), '/v1/forms/guide');

    expect(result).not.toBeNull();
    expect(result?.status).toBe(503);

    const body = await result?.json();
    expect(body?.code).toBe('BACKEND_UNAVAILABLE');
    expect(body?.details).toMatchObject({
      reason: 'proxy_request_failed',
    });
  });
});
