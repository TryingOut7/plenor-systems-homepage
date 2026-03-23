import Fastify, { type FastifyInstance } from 'fastify';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { toRequestContext } from './adapters/requestContext';
import { sendServiceResult } from './adapters/serviceResultReply';
import { createRateLimitHook } from './middleware/rateLimit';
import type { RequestContext } from '../../../src/application/shared/requestContext';
import type { ServiceResult } from '../../../src/application/shared/serviceResult';

function pickExport<T>(mod: Record<string, unknown>, name: string): T {
  const named = mod[name];
  const fallback =
    mod.default && typeof mod.default === 'object'
      ? (mod.default as Record<string, unknown>)[name]
      : undefined;
  const value = named ?? fallback;

  if (typeof value !== 'function') {
    throw new Error(`Missing export "${name}" on module.`);
  }

  return value as T;
}

export function buildBackendServer(): FastifyInstance {
  const rateLimitMax = Number(process.env.BACKEND_RATE_LIMIT_MAX || '120');
  const rateLimitWindowMs = Number(process.env.BACKEND_RATE_LIMIT_WINDOW_MS || '60000');

  const app = Fastify({
    logger: true,
    trustProxy: true,
    requestIdHeader: 'x-request-id',
  });

  app.addHook(
    'onRequest',
    createRateLimitHook({
      maxRequests: rateLimitMax,
      windowMs: rateLimitWindowMs,
      skipPaths: ['/health'],
    }),
  );

  app.addHook('onSend', async (request, reply, payload) => {
    reply.header('x-request-id', request.id);
    return payload;
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, 'Unhandled backend error');
    reply.status(500).send({ error: 'Internal server error' });
  });

  app.get('/health', async (request) => ({
    ok: true,
    service: 'plenor-backend',
    requestId: request.id,
    timestamp: new Date().toISOString(),
  }));

  app.get('/v1/search', async (request, reply) => {
    const mod = (await import(
      '../../../src/application/search/searchService'
    )) as Record<string, unknown>;
    const searchSiteContent = pickExport<
      (context: RequestContext) => Promise<ServiceResult<unknown>>
    >(mod, 'searchSiteContent');

    const result = await searchSiteContent(toRequestContext(request));
    return sendServiceResult(reply, result);
  });

  app.post('/v1/forms/guide', async (request, reply) => {
    const mod = (await import(
      '../../../src/application/forms/guideSubmissionService'
    )) as Record<string, unknown>;
    const submitGuideForm = pickExport<
      (
        context: RequestContext,
        body: unknown,
      ) => Promise<ServiceResult<unknown>>
    >(mod, 'submitGuideForm');

    const result = await submitGuideForm(toRequestContext(request), request.body);
    return sendServiceResult(reply, result);
  });

  app.post('/v1/forms/inquiry', async (request, reply) => {
    const mod = (await import(
      '../../../src/application/forms/inquirySubmissionService'
    )) as Record<string, unknown>;
    const submitInquiryForm = pickExport<
      (
        context: RequestContext,
        body: unknown,
      ) => Promise<ServiceResult<unknown>>
    >(mod, 'submitInquiryForm');

    const result = await submitInquiryForm(toRequestContext(request), request.body);
    return sendServiceResult(reply, result);
  });

  app.post('/v1/internal/seed-site-pages', async (request, reply) => {
    const mod = (await import(
      '../../../src/application/internal/seedSitePagesService'
    )) as Record<string, unknown>;
    const seedSitePagesForRequest = pickExport<
      (context: RequestContext) => Promise<ServiceResult<unknown>>
    >(mod, 'seedSitePagesForRequest');

    const result = await seedSitePagesForRequest(toRequestContext(request));
    return sendServiceResult(reply, result);
  });

  return app;
}

export async function startBackendServer(): Promise<void> {
  const app = buildBackendServer();
  const port = Number(process.env.BACKEND_PORT || process.env.PORT || '18000');
  const host = process.env.BACKEND_HOST || '127.0.0.1';
  await app.listen({ port, host });
  app.log.info({ host, port }, 'Backend server listening');
}

const isMain =
  process.argv[1] != null &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isMain) {
  startBackendServer().catch((error) => {
    console.error('Failed to start backend server:', error);
    process.exit(1);
  });
}
