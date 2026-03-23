import type { FastifyReply, FastifyRequest } from 'fastify';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  maxStoreSize?: number;
  skipPaths?: string[];
}

const DEFAULT_MAX_STORE_SIZE = 10_000;

export function createRateLimitHook(options: RateLimitOptions) {
  const store = new Map<string, RateLimitEntry>();
  const skipPaths = new Set(options.skipPaths || []);
  const maxStoreSize = options.maxStoreSize || DEFAULT_MAX_STORE_SIZE;

  function cleanup(now: number) {
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) {
        store.delete(key);
      }
    }
  }

  return async function rateLimitHook(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const path = request.url.split('?')[0] || '/';
    if (skipPaths.has(path)) {
      return;
    }

    const now = Date.now();
    const key = `${request.ip}:${path}`;
    const current = store.get(key);

    if (!current || current.resetAt <= now) {
      if (store.size >= maxStoreSize) {
        cleanup(now);
      }

      store.set(key, { count: 1, resetAt: now + options.windowMs });
      return;
    }

    current.count += 1;
    if (current.count > options.maxRequests) {
      const retryAfter = Math.ceil((current.resetAt - now) / 1000);
      reply.header('Retry-After', String(retryAfter));
      reply.status(429).send({ error: 'Too many requests.' });
    }
  };
}
