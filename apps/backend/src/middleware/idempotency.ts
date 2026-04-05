import type { FastifyReply, FastifyRequest } from 'fastify';
import * as idempotencyService from '@/infrastructure/persistence/idempotencyService';

const idempotencyModule =
  (idempotencyService as { default?: typeof import('@/infrastructure/persistence/idempotencyService') })
    .default ?? (idempotencyService as typeof import('@/infrastructure/persistence/idempotencyService'));

const {
  buildIdempotencyFingerprint,
  getIdempotencyReplay,
  storeIdempotencyResult,
} = idempotencyModule;

function firstHeader(value: string | string[] | undefined): string | null {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.length > 0) return value[0] || null;
  return null;
}

export async function tryHandleIdempotentReplay(input: {
  request: FastifyRequest;
  reply: FastifyReply;
  routePath: string;
}): Promise<
  | {
      kind: 'continue';
      key?: string;
      fingerprint?: string;
    }
  | {
      kind: 'handled';
    }
> {
  const rawKey = firstHeader(input.request.headers['idempotency-key']);
  if (!rawKey) {
    return { kind: 'continue' };
  }

  const key = rawKey.trim();
  if (!key) {
    return { kind: 'continue' };
  }

  const fingerprint = buildIdempotencyFingerprint({
    route: input.routePath,
    body: input.request.body,
  });

  const replay = await getIdempotencyReplay({
    route: input.routePath,
    key,
    fingerprint,
  });

  if (!replay) {
    return { kind: 'continue', key, fingerprint };
  }

  if (replay.kind === 'mismatch') {
    input.reply.status(409).send({
      success: false,
      code: 'IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD',
      message: 'Idempotency key has already been used with a different payload.',
      error: 'Idempotency key has already been used with a different payload.',
      status: 409,
      requestId: input.request.id,
    });
    return { kind: 'handled' };
  }

  if (replay.headers) {
    for (const [keyName, value] of Object.entries(replay.headers)) {
      input.reply.header(keyName, value);
    }
  }

  input.reply.header('x-idempotent-replay', 'true');
  input.reply.status(replay.status).send(replay.body);
  return { kind: 'handled' };
}

export async function persistIdempotentResult(input: {
  routePath: string;
  key: string | undefined;
  fingerprint: string | undefined;
  status: number;
  body: unknown;
  headers?: Record<string, string>;
}): Promise<void> {
  if (!input.key || !input.fingerprint) {
    return;
  }

  await storeIdempotencyResult({
    route: input.routePath,
    key: input.key,
    fingerprint: input.fingerprint,
    status: input.status,
    body: input.body,
    headers: input.headers,
  });
}
