import Fastify, {
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
} from 'fastify';
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
import { checkSchemaContractReadiness } from './health/schemaContractReadiness';
import * as integrationStatusService from '@/application/integrations/integrationStatusService';
import * as formTemplateService from '@/application/forms/formTemplateService';
import * as contentGateway from '@/infrastructure/cms/contentGateway';
import * as seedGateway from '@/infrastructure/cms/seedGateway';
import * as searchGateway from '@/infrastructure/cms/searchGateway';
import * as payloadFormTemplateRepository from '@/infrastructure/forms/payloadFormTemplateRepository';
import * as backendStore from '@/infrastructure/persistence/backendStore';
import * as searchService from '@/application/search/searchService';
import * as guideSubmissionService from '@/application/forms/guideSubmissionService';
import * as inquirySubmissionService from '@/application/forms/inquirySubmissionService';
import * as seedSitePagesService from '@/application/internal/seedSitePagesService';
import * as workspaceMutationService from '@/application/workspaces/workspaceMutationService';
import * as workspaceErrorStatus from '@/application/workspaces/workspaceErrorStatus';
import * as pageContentService from '@/application/content/pageContentService';
import * as submissionsService from '@/application/admin/submissionsService';
import * as payloadRouteAuth from '@/infrastructure/http/payloadRouteAuth';
import * as payloadWorkspaceMutationRepository from '@/infrastructure/workspaces/payloadWorkspaceMutationRepository';

function interopModule<T>(namespace: T | { default?: T }): T {
  return (namespace as { default?: T }).default ?? (namespace as T);
}

const { getIntegrationStatus } =
  interopModule<typeof import('@/application/integrations/integrationStatusService')>(
    integrationStatusService,
  );

const {
  createWorkspaceFormTemplate,
  getSupportedFormTemplateKeysLabel,
  parseRequestedFormTemplateKey,
} = interopModule<typeof import('@/application/forms/formTemplateService')>(formTemplateService);

const { payloadContentRepository } =
  interopModule<typeof import('@/infrastructure/cms/contentGateway')>(contentGateway);
const { payloadSeedRepository } = interopModule<typeof import('@/infrastructure/cms/seedGateway')>(
  seedGateway,
);
const { payloadSearchRepository } =
  interopModule<typeof import('@/infrastructure/cms/searchGateway')>(searchGateway);
const { createPayloadFormTemplateRepository } =
  interopModule<typeof import('@/infrastructure/forms/payloadFormTemplateRepository')>(
    payloadFormTemplateRepository,
  );

const {
  hasDatabaseCredentials,
  isPersistentStoreConfigured,
  refreshPersistenceCapabilityState,
} = interopModule<typeof import('@/infrastructure/persistence/backendStore')>(backendStore);

const { searchSiteContent } = interopModule<typeof import('@/application/search/searchService')>(
  searchService,
);
const { submitGuideForm } =
  interopModule<typeof import('@/application/forms/guideSubmissionService')>(
    guideSubmissionService,
  );
const { submitInquiryForm } =
  interopModule<typeof import('@/application/forms/inquirySubmissionService')>(
    inquirySubmissionService,
  );
const { seedSitePagesForRequest } =
  interopModule<typeof import('@/application/internal/seedSitePagesService')>(
    seedSitePagesService,
  );

const {
  createDraftFromPlayground: createDraftFromPlaygroundWorkspace,
  createDraftFromPreset: createDraftFromPresetWorkspace,
  createPresetFromDraft: createPresetFromDraftWorkspace,
  createPresetFromLivePage: createPresetFromLivePageWorkspace,
  createPresetFromPlayground: createPresetFromPlaygroundWorkspace,
  promoteDraftToLive: promoteDraftToLiveWorkspace,
} = interopModule<typeof import('@/application/workspaces/workspaceMutationService')>(
  workspaceMutationService,
);

const { inferWorkspaceErrorStatus } =
  interopModule<typeof import('@/application/workspaces/workspaceErrorStatus')>(
    workspaceErrorStatus,
  );
const {
  getContentPageBySlug,
  getContentNavigation,
} = interopModule<typeof import('@/application/content/pageContentService')>(pageContentService);
const {
  listAdminSubmissions,
  getAdminSubmissionById,
  replaySubmissionSideEffects,
} = interopModule<typeof import('@/application/admin/submissionsService')>(submissionsService);
const { getPayloadSessionFromHeaders } =
  interopModule<typeof import('@/infrastructure/http/payloadRouteAuth')>(payloadRouteAuth);
const { createPayloadWorkspaceMutationRepository } =
  interopModule<typeof import('@/infrastructure/workspaces/payloadWorkspaceMutationRepository')>(
    payloadWorkspaceMutationRepository,
  );

const PRESET_CREATOR_ROLES = new Set(['admin', 'editor']);
const WORKSPACE_ROLES = new Set(['admin', 'editor', 'author']);

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function readParamId(params: unknown): string {
  const raw = asRecord(params).id;
  if (typeof raw !== 'string') return '';
  return raw.trim();
}

function readTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function buildBackendServer(): FastifyInstance {
  const rateLimitMax = Number(process.env.BACKEND_RATE_LIMIT_MAX || '120');
  const rateLimitWindowMs = Number(process.env.BACKEND_RATE_LIMIT_WINDOW_MS || '60000');
  const requestStartById = new Map<string, number>();

  const isDev = process.env.NODE_ENV !== 'production';
  const isProduction = process.env.NODE_ENV === 'production';
  const schemaContractRequired =
    process.env.BACKEND_REQUIRE_SCHEMA_CONTRACT === 'true' ||
    (isProduction && process.env.BACKEND_REQUIRE_SCHEMA_CONTRACT !== 'false');
  const schemaReadinessCacheMs = Number(
    process.env.BACKEND_SCHEMA_READINESS_CACHE_MS || '60000',
  );
  const isVitestRuntime =
    process.env.VITEST === 'true' ||
    process.env.VITEST_WORKER_ID != null;
  const rawOrigins = process.env.BACKEND_CORS_ORIGINS || process.env.NEXT_PUBLIC_SERVER_URL || '';
  const allowedOrigins = rawOrigins
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((origin) => {
      const normalized = /^https?:\/\//i.test(origin)
        ? origin
        : origin.startsWith('localhost') || origin.startsWith('127.0.0.1')
          ? `http://${origin}`
          : `https://${origin}`;
      const parsed = new URL(normalized);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error(`Invalid CORS origin protocol: ${origin}`);
      }
      return parsed.origin;
    });

  if (isProduction && allowedOrigins.length === 0) {
    throw new Error(
      'BACKEND_CORS_ORIGINS (or NEXT_PUBLIC_SERVER_URL) must be set in production for fail-closed CORS.',
    );
  }

  const app = Fastify({
    logger: isVitestRuntime
      ? { level: 'silent' }
      : isDev
      ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
      : { level: process.env.LOG_LEVEL || 'info' },
    trustProxy: true,
    requestIdHeader: 'x-request-id',
    bodyLimit: Number(process.env.BACKEND_BODY_LIMIT_BYTES || String(512 * 1024)), // 512 KB default
  });

  app.register(cors, {
    origin: isDev ? true : allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Api-Key', 'Idempotency-Key', 'X-Request-Id'],
    credentials: false,
  });

  app.addHook(
    'onRequest',
    createRateLimitHook({
      allowInMemoryFallbackWhenPersistentUnavailable: process.env.NODE_ENV !== 'production',
      maxRequests: rateLimitMax,
      windowMs: rateLimitWindowMs,
      skipPaths: ['/health', '/health/ready'],
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
    requestStartById.delete(request.id);
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

  app.addHook('onRequestAbort', async (request) => {
    requestStartById.delete(request.id);
  });

  async function requireWorkspaceSession(
    request: FastifyRequest,
    reply: FastifyReply,
    allowedRoles: Set<string>,
    forbiddenMessage: string,
  ) {
    try {
      const session = await getPayloadSessionFromHeaders(
        request.headers as Record<string, string | string[] | undefined>,
      );

      if (!session.user) {
        reply.status(401).send(
          toBackendErrorResponse({
            status: 401,
            requestId: request.id,
            body: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required.',
            },
          }),
        );
        return null;
      }

      if (!allowedRoles.has(session.role)) {
        reply.status(403).send(
          toBackendErrorResponse({
            status: 403,
            requestId: request.id,
            body: {
              code: 'FORBIDDEN',
              message: forbiddenMessage,
            },
          }),
        );
        return null;
      }

      return {
        ...session,
        user: session.user,
      };
    } catch (error) {
      request.log.error({ err: error }, 'Workspace session resolution failed');
      reply.status(503).send(
        toBackendErrorResponse({
          status: 503,
          requestId: request.id,
          body: {
            code: 'DEPENDENCY_UNAVAILABLE',
            message: 'CMS authentication service unavailable.',
          },
        }),
      );
      return null;
    }
  }

  app.get('/health', async (request) => ({
    ok: true,
    service: 'plenor-backend',
    requestId: request.id,
    timestamp: new Date().toISOString(),
  }));

  app.get('/health/ready', async (request, reply) => {
    let cmsReady = true;
    let cmsError: string | null = null;
    const hasPayloadDatabaseConnection = Boolean(
      process.env.POSTGRES_URL || process.env.DATABASE_URI || process.env.DATABASE_URL,
    );

    if (process.env.CMS_SKIP_PAYLOAD !== 'true') {
      if (!hasPayloadDatabaseConnection) {
        cmsReady = false;
        cmsError = 'POSTGRES_URL is not configured.';
      } else {
        try {
          const { getPayload } = await import('@/payload/client');
          await getPayload();
        } catch (error) {
          cmsReady = false;
          cmsError = error instanceof Error ? error.message : String(error);
        }
      }
    }

    const dbConfigured = hasDatabaseCredentials();
    let persistentStoreReady = isPersistentStoreConfigured();
    let persistenceError: string | null = null;

    try {
      await refreshPersistenceCapabilityState();
      persistentStoreReady = isPersistentStoreConfigured();
    } catch (error) {
      persistentStoreReady = false;
      persistenceError = error instanceof Error ? error.message : String(error);
    }

    let schemaContractReady = true;
    let schemaContractMissingTables: string[] = [];
    let schemaContractMissingColumns: Array<{ table: string; column: string }> = [];
    let schemaContractMissingFunctions: string[] = [];
    let schemaContractError: string | null = null;
    let schemaContractCheckedAt: string | null = null;
    let schemaContractRequiredTableCount = 0;
    let schemaContractRequiredColumnCount = 0;

    if (!hasPayloadDatabaseConnection) {
      schemaContractReady = false;
      schemaContractError = 'POSTGRES_URL is not configured.';
    } else {
      const schemaStatus = await checkSchemaContractReadiness({
        cacheTtlMs: schemaReadinessCacheMs,
        logger: request.log,
      });
      schemaContractReady = schemaStatus.ready;
      schemaContractMissingTables = schemaStatus.missingTables;
      schemaContractMissingColumns = schemaStatus.missingColumns;
      schemaContractMissingFunctions = schemaStatus.missingFunctions;
      schemaContractError = schemaStatus.error;
      schemaContractCheckedAt = schemaStatus.checkedAt;
      schemaContractRequiredTableCount = schemaStatus.requiredTableCount;
      schemaContractRequiredColumnCount = schemaStatus.requiredColumnCount;
    }

    const ready =
      cmsReady &&
      (!isProduction || persistentStoreReady) &&
      (!schemaContractRequired || schemaContractReady);
    return reply.status(ready ? 200 : 503).send({
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
          requiredPersistenceTablesReady: persistentStoreReady,
          idempotencyAndOutboxPersistentStoreReady: persistentStoreReady,
          error: persistenceError,
        },
        schemaContract: {
          required: schemaContractRequired,
          ready: schemaContractReady,
          checkedAt: schemaContractCheckedAt,
          requiredTableCount: schemaContractRequiredTableCount,
          requiredColumnCount: schemaContractRequiredColumnCount,
          missingTableCount: schemaContractMissingTables.length,
          missingTables: schemaContractMissingTables.slice(0, 25),
          missingColumnCount: schemaContractMissingColumns.length,
          missingColumns: schemaContractMissingColumns.slice(0, 50),
          missingFunctionCount: schemaContractMissingFunctions.length,
          missingFunctions: schemaContractMissingFunctions.slice(0, 10),
          error: schemaContractError,
        },
      },
    });
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

    const result = await submitGuideForm(toRequestContext(request), request.body);
    const responseBody =
      result.status >= 400
        ? toBackendErrorResponse({
            status: result.status,
            requestId: request.id,
            body: result.body as unknown as Record<string, unknown>,
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

    const result = await submitInquiryForm(toRequestContext(request), request.body);
    const responseBody =
      result.status >= 400
        ? toBackendErrorResponse({
            status: result.status,
            requestId: request.id,
            body: result.body as unknown as Record<string, unknown>,
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

  app.post('/v1/forms/templates/create', async (request, reply) => {
    const session = await requireWorkspaceSession(
      request,
      reply,
      WORKSPACE_ROLES,
      'Insufficient permissions.',
    );
    if (!session) return reply;

    const body = asRecord(request.body);
    const templateKey = parseRequestedFormTemplateKey(body.templateKey);
    if (!templateKey) {
      return reply.status(400).send(
        toBackendErrorResponse({
          status: 400,
          requestId: request.id,
          body: {
            code: 'VALIDATION_ERROR',
            message: `templateKey must be one of: ${getSupportedFormTemplateKeysLabel()}.`,
          },
        }),
      );
    }

    try {
      const repository = createPayloadFormTemplateRepository({
        payload: session.payload,
        user: session.user,
      });
      const form = await createWorkspaceFormTemplate(repository, templateKey);
      return reply.send({
        success: true,
        form,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create form template.';
      const status = inferWorkspaceErrorStatus(message);
      return reply.status(status).send(
        toBackendErrorResponse({
          status,
          requestId: request.id,
          body: {
            message,
          },
        }),
      );
    }
  });

  app.post('/v1/pages/live/:id/create-preset', async (request, reply) => {
    const session = await requireWorkspaceSession(
      request,
      reply,
      PRESET_CREATOR_ROLES,
      'Only admins and editors can create presets.',
    );
    if (!session) return reply;

    const livePageId = readParamId(request.params);
    if (!livePageId) {
      return reply.status(400).send(
        toBackendErrorResponse({
          status: 400,
          requestId: request.id,
          body: {
            code: 'VALIDATION_ERROR',
            message: 'id is required.',
          },
        }),
      );
    }

    try {
      const repository = createPayloadWorkspaceMutationRepository({
        payload: session.payload,
        user: session.user,
      });
      const preset = await createPresetFromLivePageWorkspace(repository, {
        livePageId,
        presetMeta: asRecord(request.body),
      });
      return reply.send({
        success: true,
        preset,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Operation failed.';
      const status = inferWorkspaceErrorStatus(message);
      return reply.status(status).send(
        toBackendErrorResponse({
          status,
          requestId: request.id,
          body: {
            message,
          },
        }),
      );
    }
  });

  app.post('/v1/pages/drafts/:id/create-preset', async (request, reply) => {
    const session = await requireWorkspaceSession(
      request,
      reply,
      PRESET_CREATOR_ROLES,
      'Only admins and editors can create presets.',
    );
    if (!session) return reply;

    const draftId = readParamId(request.params);
    if (!draftId) {
      return reply.status(400).send(
        toBackendErrorResponse({
          status: 400,
          requestId: request.id,
          body: {
            code: 'VALIDATION_ERROR',
            message: 'id is required.',
          },
        }),
      );
    }

    try {
      const repository = createPayloadWorkspaceMutationRepository({
        payload: session.payload,
        user: session.user,
      });
      const preset = await createPresetFromDraftWorkspace(repository, {
        draftId,
        presetMeta: asRecord(request.body),
      });
      return reply.send({
        success: true,
        preset,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Operation failed.';
      const status = inferWorkspaceErrorStatus(message);
      return reply.status(status).send(
        toBackendErrorResponse({
          status,
          requestId: request.id,
          body: {
            message,
          },
        }),
      );
    }
  });

  app.post('/v1/pages/drafts/:id/promote-to-live', async (request, reply) => {
    const session = await requireWorkspaceSession(
      request,
      reply,
      PRESET_CREATOR_ROLES,
      'Only admins and editors can promote drafts.',
    );
    if (!session) return reply;

    const draftId = readParamId(request.params);
    if (!draftId) {
      return reply.status(400).send(
        toBackendErrorResponse({
          status: 400,
          requestId: request.id,
          body: {
            code: 'VALIDATION_ERROR',
            message: 'id is required.',
          },
        }),
      );
    }

    try {
      const repository = createPayloadWorkspaceMutationRepository({
        payload: session.payload,
        user: session.user,
      });
      const livePage = await promoteDraftToLiveWorkspace(repository, {
        draftId,
      });
      return reply.send({
        success: true,
        livePage,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to promote draft to live.';
      const status = inferWorkspaceErrorStatus(message);
      return reply.status(status).send(
        toBackendErrorResponse({
          status,
          requestId: request.id,
          body: {
            message,
          },
        }),
      );
    }
  });

  app.post('/v1/pages/playgrounds/:id/create-draft', async (request, reply) => {
    const session = await requireWorkspaceSession(
      request,
      reply,
      WORKSPACE_ROLES,
      'Insufficient permissions.',
    );
    if (!session) return reply;

    const playgroundId = readParamId(request.params);
    if (!playgroundId) {
      return reply.status(400).send(
        toBackendErrorResponse({
          status: 400,
          requestId: request.id,
          body: {
            code: 'VALIDATION_ERROR',
            message: 'id is required.',
          },
        }),
      );
    }

    const body = asRecord(request.body);
    const title = readTrimmedString(body.title);
    const targetSlug = readTrimmedString(body.targetSlug);
    if (!targetSlug) {
      return reply.status(400).send(
        toBackendErrorResponse({
          status: 400,
          requestId: request.id,
          body: {
            code: 'VALIDATION_ERROR',
            message: 'targetSlug is required.',
          },
        }),
      );
    }

    try {
      const repository = createPayloadWorkspaceMutationRepository({
        payload: session.payload,
        user: session.user,
      });
      const draft = await createDraftFromPlaygroundWorkspace(repository, {
        playgroundId,
        title,
        targetSlug,
      });
      return reply.send({
        success: true,
        draft,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create draft.';
      const status = inferWorkspaceErrorStatus(message);
      return reply.status(status).send(
        toBackendErrorResponse({
          status,
          requestId: request.id,
          body: {
            message,
          },
        }),
      );
    }
  });

  app.post('/v1/pages/presets/:id/create-draft', async (request, reply) => {
    const session = await requireWorkspaceSession(
      request,
      reply,
      WORKSPACE_ROLES,
      'Insufficient permissions.',
    );
    if (!session) return reply;

    const presetId = readParamId(request.params);
    if (!presetId) {
      return reply.status(400).send(
        toBackendErrorResponse({
          status: 400,
          requestId: request.id,
          body: {
            code: 'VALIDATION_ERROR',
            message: 'id is required.',
          },
        }),
      );
    }

    const body = asRecord(request.body);
    const title = readTrimmedString(body.title);
    const targetSlug = readTrimmedString(body.targetSlug);
    if (!targetSlug) {
      return reply.status(400).send(
        toBackendErrorResponse({
          status: 400,
          requestId: request.id,
          body: {
            code: 'VALIDATION_ERROR',
            message: 'targetSlug is required.',
          },
        }),
      );
    }

    try {
      const repository = createPayloadWorkspaceMutationRepository({
        payload: session.payload,
        user: session.user,
      });
      const draft = await createDraftFromPresetWorkspace(repository, {
        presetId,
        title,
        targetSlug,
      });
      return reply.send({
        success: true,
        draft,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create draft.';
      const status = inferWorkspaceErrorStatus(message);
      return reply.status(status).send(
        toBackendErrorResponse({
          status,
          requestId: request.id,
          body: {
            message,
          },
        }),
      );
    }
  });

  app.post('/v1/pages/playgrounds/:id/create-preset', async (request, reply) => {
    const session = await requireWorkspaceSession(
      request,
      reply,
      PRESET_CREATOR_ROLES,
      'Only admins and editors can create presets.',
    );
    if (!session) return reply;

    const playgroundId = readParamId(request.params);
    if (!playgroundId) {
      return reply.status(400).send(
        toBackendErrorResponse({
          status: 400,
          requestId: request.id,
          body: {
            code: 'VALIDATION_ERROR',
            message: 'id is required.',
          },
        }),
      );
    }

    try {
      const repository = createPayloadWorkspaceMutationRepository({
        payload: session.payload,
        user: session.user,
      });
      const preset = await createPresetFromPlaygroundWorkspace(repository, {
        playgroundId,
        presetMeta: asRecord(request.body),
      });
      return reply.send({
        success: true,
        preset,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create preset.';
      const status = inferWorkspaceErrorStatus(message);
      return reply.status(status).send(
        toBackendErrorResponse({
          status,
          requestId: request.id,
          body: {
            message,
          },
        }),
      );
    }
  });

  app.post('/v1/internal/seed-site-pages', async (request, reply) => {
    const context = toRequestContext(request);
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

    const idempotency = await tryHandleIdempotentReplay({
      request,
      reply,
      routePath: '/v1/internal/seed-site-pages',
    });
    if (idempotency.kind === 'handled') {
      return reply;
    }

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
    const result = await getContentPageBySlug(
      toRequestContext(request),
      slug,
      payloadContentRepository,
    );
    return sendServiceResult(reply, result, request.id);
  });

  app.get('/v1/content/navigation', async (request, reply) => {
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

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, 'Received shutdown signal — closing server gracefully');
    try {
      await app.close();
      process.exit(0);
    } catch (err) {
      app.log.error({ err }, 'Error during graceful shutdown');
      process.exit(1);
    }
  };

  process.once('SIGTERM', () => { void shutdown('SIGTERM'); });
  process.once('SIGINT',  () => { void shutdown('SIGINT'); });

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
