import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy, proxyInternals } from '@/proxy';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = {
    ...ORIGINAL_ENV,
    NODE_ENV: 'production',
  };
  proxyInternals.redirectCacheByBaseUrl.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  proxyInternals.redirectCacheByBaseUrl.clear();
  vi.restoreAllMocks();
});

describe('redirect proxy', () => {
  it('collapses multi-hop redirects into a single response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        docs: [
          { fromPath: '/old-blog/*', toPath: '/blog/*', isPermanent: true },
          { fromPath: '/blog/*', toPath: '/articles/*', isPermanent: false },
        ],
      }),
    } as Response);

    const response = await proxy(new NextRequest('http://localhost:3000/old-blog/my-post'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/articles/my-post');
  });

  it('bails out instead of issuing a looping redirect', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        docs: [
          { fromPath: '/old', toPath: '/new', isPermanent: true },
          { fromPath: '/new', toPath: '/old', isPermanent: true },
        ],
      }),
    } as Response);

    const response = await proxy(new NextRequest('http://localhost:3000/old'));

    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('content-security-policy')).toContain("script-src 'self'");
  });

  it('adds frontend security headers when continuing the request', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ docs: [] }),
    } as Response);

    const response = await proxy(new NextRequest('http://localhost:3000/about'));

    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('content-security-policy')).toContain("script-src 'self'");
  });
});
