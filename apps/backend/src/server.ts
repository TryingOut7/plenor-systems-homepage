import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { toBackendErrorResponse } from './adapters/errorEnvelope';
import { toRequestContext } from './adapters/requestContext';
import { sendServiceResult } from './adapters/serviceResultReply';
import { tryHandleIdempotentReplay, persistIdempotentResult } from './middleware/idempotency';
import { createRateLimitHook } from './middleware/rateLimit';
import { requireApiRole } from './middleware/requireRole';
import { getBackendMetricsSnapshot, recordBackendRequest } from './observability/metricsRegistry';
import type { RequestContext } from '../../../src/application/shared/requestContext';
import type { ServiceResult } from '../../../src/application/shared/serviceResult';
import { getIntegrationStatus } from '../../../src/application/integrations/integrationStatusService';
import { payloadContentRepository } from '../../../src/infrastructure/cms/contentGateway';
import { payloadSeedRepository } from '../../../src/infrastructure/cms/seedGateway';
import { payloadSearchRepository } from '../../../src/infrastructure/cms/searchGateway';
import { hasDatabaseCredentials, isPersistentStoreConfigured } from '../../../src/infrastructure/persistence/backendStore';

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
  const requestStartById = new Map<string, number>();

  const isDev = process.env.NODE_ENV !== 'production';
  const rawOrigins = process.env.BACKEND_CORS_ORIGINS || process.env.NEXT_PUBLIC_SERVER_URL || '';
  const allowedOrigins = rawOrigins
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const app = Fastify({
    logger: isDev
      ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
      : { level: process.env.LOG_LEVEL || 'info' },
    trustProxy: true,
    requestIdHeader: 'x-request-id',
  });

  app.register(cors, {
    origin: isDev || allowedOrigins.length === 0 ? true : allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Api-Key', 'Idempotency-Key', 'X-Request-Id'],
    credentials: false,
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
    const startedAt = requestStartById.get(request.id) || Date.now();
    requestStartById.delete(request.id);
    const durationMs = Date.now() - startedAt;
    const path = request.url.split('?')[0] || '/';

    reply.header('x-request-id', request.id);
    reply.header('x-response-time-ms', String(durationMs));

    recordBackendRequest({
      method: request.method,
      path,
      statusCode: reply.statusCode,
      durationMs,
    });

    request.log.info(
      {
        path,
        method: request.method,
        statusCode: reply.statusCode,
        durationMs,
        requestId: request.id,
      },
      'Backend request completed',
    );

    return payload;
  });

  app.addHook('onRequest', async (request) => {
    requestStartById.set(request.id, Date.now());
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, 'Unhandled backend error');
    reply.status(500).send(
      toBackendErrorResponse({
        status: 500,
        requestId: request.id,
        body: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      }),
    );
  });

  app.get('/health', async (request) => ({
    ok: true,
    service: 'plenor-backend',
    requestId: request.id,
    timestamp: new Date().toISOString(),
  }));

  app.get('/health/ready', async (request) => {
    let cmsReady = true;
    let cmsError: string | null = null;

    if (process.env.CMS_SKIP_PAYLOAD !== 'true') {
      try {
        const mod = (await import('../../../src/payload/client')) as Record<
          string,
          unknown
        >;
        const getPayload = pickExport<() => Promise<unknown>>(mod, 'getPayload');
        await getPayload();
      } catch (error) {
        cmsReady = false;
        cmsError = error instanceof Error ? error.message : String(error);
      }
    }

    const dbConfigured = hasDatabaseCredentials();
    const persistentStoreReady = isPersistentStoreConfigured();

    const ready = cmsReady;
    return {
      ok: ready,
      service: 'plenor-backend',
      requestId: request.id,
      timestamp: new Date().toISOString(),
      dependencies: {
        cms: {
          ready: cmsReady,
          error: cmsError,
        },
        database: {
          credentialsConfigured: dbConfigured,
        },
        persistence: {
          idempotencyAndOutboxPersistentStoreReady: persistentStoreReady,
        },
      },
    };
  });

  app.get('/metrics', async (request, reply) => {
    const auth = requireApiRole(
      toRequestContext(request).apiKey,
      ['internal', 'admin'],
    );

    if (!auth.ok) {
      return reply.status(auth.status).send(
        toBackendErrorResponse({
          status: auth.status,
          requestId: request.id,
          body: {
            code: auth.code,
            message: auth.message,
          },
        }),
      );
    }

    return {
      ...getBackendMetricsSnapshot(),
      requestId: request.id,
      timestamp: new Date().toISOString(),
    };
  });

  app.get('/v1/search', async (request, reply) => {
    const mod = (await import(
      '../../../src/application/search/searchService'
    )) as Record<string, unknown>;
    const searchSiteContent = pickExport<
      (
        context: RequestContext,
        repository: typeof payloadSearchRepository,
      ) => Promise<ServiceResult<unknown>>
    >(mod, 'searchSiteContent');

    const result = await searchSiteContent(
      toRequestContext(request),
      payloadSearchRepository,
    );
    return sendServiceResult(reply, result, request.id);
  });

  app.post('/v1/forms/guide', async (request, reply) => {
    const idempotency = await tryHandleIdempotentReplay({
      request,
      reply,
      routePath: '/v1/forms/guide',
    });
    if (idempotency.kind === 'handled') {
      return reply;
    }

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
    const responseBody =
      result.status >= 400
        ? toBackendErrorResponse({
            status: result.status,
            requestId: request.id,
            body: result.body as Record<string, unknown>,
            headers: result.headers,
          })
        : result.body;

    await persistIdempotentResult({
      routePath: '/v1/forms/guide',
      key: idempotency.key,
      fingerprint: idempotency.fingerprint,
      status: result.status,
      body: responseBody,
      headers: result.headers,
    });

    return sendServiceResult(reply, result, request.id);
  });

  app.post('/v1/forms/inquiry', async (request, reply) => {
    const idempotency = await tryHandleIdempotentReplay({
      request,
      reply,
      routePath: '/v1/forms/inquiry',
    });
    if (idempotency.kind === 'handled') {
      return reply;
    }

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
    const responseBody =
      result.status >= 400
        ? toBackendErrorResponse({
            status: result.status,
            requestId: request.id,
            body: result.body as Record<string, unknown>,
            headers: result.headers,
          })
        : result.body;

    await persistIdempotentResult({
      routePath: '/v1/forms/inquiry',
      key: idempotency.key,
      fingerprint: idempotency.fingerprint,
      status: result.status,
      body: responseBody,
      headers: result.headers,
    });

    return sendServiceResult(reply, result, request.id);
  });

  app.post('/v1/internal/seed-site-pages', async (request, reply) => {
    const context = toRequestContext(request);
    const hasLegacyBearer = !!context.authorization;
    if (!hasLegacyBearer) {
      const auth = requireApiRole(context.apiKey, ['internal', 'admin']);
      if (!auth.ok) {
        return reply.status(auth.status).send(
          toBackendErrorResponse({
            status: auth.status,
            requestId: request.id,
            body: {
              code: auth.code,
              message: auth.message,
            },
          }),
        );
      }
    }

    const idempotency = await tryHandleIdempotentReplay({
      request,
      reply,
      routePath: '/v1/internal/seed-site-pages',
    });
    if (idempotency.kind === 'handled') {
      return reply;
    }

    const mod = (await import(
      '../../../src/application/internal/seedSitePagesService'
    )) as Record<string, unknown>;
    const seedSitePagesForRequest = pickExport<
      (
        context: RequestContext,
        repository: typeof payloadSeedRepository,
      ) => Promise<ServiceResult<unknown>>
    >(mod, 'seedSitePagesForRequest');

    const result = await seedSitePagesForRequest(
      context,
      payloadSeedRepository,
    );
    const responseBody =
      result.status >= 400
        ? toBackendErrorResponse({
            status: result.status,
            requestId: request.id,
            body: result.body as Record<string, unknown>,
            headers: result.headers,
          })
        : result.body;

    await persistIdempotentResult({
      routePath: '/v1/internal/seed-site-pages',
      key: idempotency.key,
      fingerprint: idempotency.fingerprint,
      status: result.status,
      body: responseBody,
      headers: result.headers,
    });

    return sendServiceResult(reply, result, request.id);
  });

  app.get('/v1/content/pages/:slug', async (request, reply) => {
    const slug = String((request.params as Record<string, unknown>).slug || '');
    const mod = (await import(
      '../../../src/application/content/pageContentService'
    )) as Record<string, unknown>;
    const getContentPageBySlug = pickExport<
      (
        context: RequestContext,
        slug: string,
        repository: typeof payloadContentRepository,
      ) => Promise<ServiceResult<unknown>>
    >(mod, 'getContentPageBySlug');

    const result = await getContentPageBySlug(
      toRequestContext(request),
      slug,
      payloadContentRepository,
    );
    return sendServiceResult(reply, result, request.id);
  });

  app.get('/v1/content/navigation', async (request, reply) => {
    const mod = (await import(
      '../../../src/application/content/pageContentService'
    )) as Record<string, unknown>;
    const getContentNavigation = pickExport<
      (
        context: RequestContext,
        repository: typeof payloadContentRepository,
      ) => Promise<ServiceResult<unknown>>
    >(mod, 'getContentNavigation');

    const result = await getContentNavigation(
      toRequestContext(request),
      payloadContentRepository,
    );
    return sendServiceResult(reply, result, request.id);
  });

  app.get('/v1/admin/submissions', async (request, reply) => {
    const auth = requireApiRole(
      toRequestContext(request).apiKey,
      ['admin'],
    );
    if (!auth.ok) {
      return reply.status(auth.status).send(
        toBackendErrorResponse({
          status: auth.status,
          requestId: request.id,
          body: {
            code: auth.code,
            message: auth.message,
          },
        }),
      );
    }

    const mod = (await import(
      '../../../src/application/admin/submissionsService'
    )) as Record<string, unknown>;
    const listAdminSubmissions = pickExport<
      (context: RequestContext) => Promise<ServiceResult<unknown>>
    >(mod, 'listAdminSubmissions');

    const result = await listAdminSubmissions(toRequestContext(request));
    return sendServiceResult(reply, result, request.id);
  });

  app.get('/v1/admin/submissions/:id', async (request, reply) => {
    const auth = requireApiRole(
      toRequestContext(request).apiKey,
      ['admin'],
    );
    if (!auth.ok) {
      return reply.status(auth.status).send(
        toBackendErrorResponse({
          status: auth.status,
          requestId: request.id,
          body: {
            code: auth.code,
            message: auth.message,
          },
        }),
      );
    }

    const submissionId = String((request.params as Record<string, unknown>).id || '');
    const mod = (await import(
      '../../../src/application/admin/submissionsService'
    )) as Record<string, unknown>;
    const getAdminSubmissionById = pickExport<
      (submissionId: string) => Promise<ServiceResult<unknown>>
    >(mod, 'getAdminSubmissionById');

    const result = await getAdminSubmissionById(submissionId);
    return sendServiceResult(reply, result, request.id);
  });

  app.post('/v1/admin/submissions/:id/replay-side-effects', async (request, reply) => {
    const auth = requireApiRole(
      toRequestContext(request).apiKey,
      ['admin'],
    );
    if (!auth.ok) {
      return reply.status(auth.status).send(
        toBackendErrorResponse({
          status: auth.status,
          requestId: request.id,
          body: {
            code: auth.code,
            message: auth.message,
          },
        }),
      );
    }

    const idempotency = await tryHandleIdempotentReplay({
      request,
      reply,
      routePath: '/v1/admin/submissions/:id/replay-side-effects',
    });
    if (idempotency.kind === 'handled') {
      return reply;
    }

    const submissionId = String((request.params as Record<string, unknown>).id || '');
    const mod = (await import(
      '../../../src/application/admin/submissionsService'
    )) as Record<string, unknown>;
    const replaySubmissionSideEffects = pickExport<
      (submissionId: string) => Promise<ServiceResult<unknown>>
    >(mod, 'replaySubmissionSideEffects');

    const result = await replaySubmissionSideEffects(submissionId);

    const responseBody =
      result.status >= 400
        ? toBackendErrorResponse({
            status: result.status,
            requestId: request.id,
            body: result.body as Record<string, unknown>,
            headers: result.headers,
          })
        : result.body;

    await persistIdempotentResult({
      routePath: '/v1/admin/submissions/:id/replay-side-effects',
      key: idempotency.key,
      fingerprint: idempotency.fingerprint,
      status: result.status,
      body: responseBody,
      headers: result.headers,
    });

    return sendServiceResult(reply, result, request.id);
  });

  app.get('/v1/integrations/status', async (request, reply) => {
    const auth = requireApiRole(
      toRequestContext(request).apiKey,
      ['internal', 'admin'],
    );
    if (!auth.ok) {
      return reply.status(auth.status).send(
        toBackendErrorResponse({
          status: auth.status,
          requestId: request.id,
          body: {
            code: auth.code,
            message: auth.message,
          },
        }),
      );
    }

    return sendServiceResult(reply, getIntegrationStatus(), request.id);
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
