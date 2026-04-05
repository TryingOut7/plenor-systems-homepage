import { describe, expect, it } from 'vitest';
import { enableDraftModeForRequest } from '@/application/draft-mode/enableDraftModeService';
import { searchSiteContent } from '@/application/search/searchService';
import type { SearchRepository } from '@/application/ports/searchRepository';
import type { RequestContext } from '@/application/shared/requestContext';

function context(overrides: Partial<RequestContext> = {}): RequestContext {
  return {
    requestId: 'test-request-id',
    method: 'GET',
    path: '/api/test',
    url: 'http://localhost:3000/api/test',
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

describe('application service guards', () => {
  it('returns 400 for invalid draft-mode slug', async () => {
    process.env.PAYLOAD_SECRET = 'secret';

    const result = await enableDraftModeForRequest(context(), {
      secret: 'secret',
      slug: 'invalid',
    });

    expect(result.status).toBe(400);
    expect(result.body).toEqual({ error: 'Invalid slug' });
  });

  it('returns 401 for wrong draft-mode secret', async () => {
    process.env.PAYLOAD_SECRET = 'secret';

    const result = await enableDraftModeForRequest(context(), {
      secret: 'wrong',
      slug: '/',
    });

    expect(result.status).toBe(401);
    expect(result.body).toEqual({ error: 'Invalid secret' });
  });

  it('uses PAYLOAD_PREVIEW_SECRET when configured', async () => {
    process.env.PAYLOAD_SECRET = 'fallback-secret';
    process.env.PAYLOAD_PREVIEW_SECRET = 'preview-secret';

    const accepted = await enableDraftModeForRequest(context(), {
      secret: 'preview-secret',
      slug: '/',
    });
    expect(accepted.status).toBe(200);
    expect(accepted.body).toEqual({ ok: true, slug: '/' });

    const rejectedFallback = await enableDraftModeForRequest(context(), {
      secret: 'fallback-secret',
      slug: '/',
    });
    expect(rejectedFallback.status).toBe(401);
    expect(rejectedFallback.body).toEqual({ error: 'Invalid secret' });

    delete process.env.PAYLOAD_PREVIEW_SECRET;
  });

  it('returns 400 for search without filters', async () => {
    const result = await searchSiteContent(
      context({
        path: '/v1/search',
        url: 'http://localhost:3000/v1/search',
      }),
      {
        async findPublishedDocuments() {
          return [];
        },
      } satisfies SearchRepository,
    );

    expect(result.status).toBe(400);
    expect(result.body).toEqual({
      error:
        'At least one search parameter is required (q, collection, tag, or featured).',
      requestId: 'test-request-id',
    });
  });
});
