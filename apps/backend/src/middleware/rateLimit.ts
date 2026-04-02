import type { FastifyReply, FastifyRequest } from 'fastify';
import { toBackendErrorResponse } from '../adapters/errorEnvelope';
import { consumeRateLimitBucket } from '../../../../src/infrastructure/security/rateLimiter';

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  skipPaths?: string[];
}

export function createRateLimitHook(options: RateLimitOptions) {
  const skipPaths = new Set(options.skipPaths || []);

  return async function rateLimitHook(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const path = request.url.split('?')[0] || '/';
    if (skipPaths.has(path)) {
      return;
    }

    try {
      const key = `${request.ip}:${path}`;
      const outcome = await consumeRateLimitBucket({
        key,
        windowMs: options.windowMs,
        maxRequests: options.maxRequests,
      });

      if (!outcome.limited) {
        return;
      }

      const retryAfter = Math.max(1, outcome.retryAfterSeconds || 1);
      reply.header('Retry-After', String(retryAfter));
      reply.status(429).send(
        toBackendErrorResponse({
          status: 429,
          requestId: request.id,
          body: {
            code: 'RATE_LIMITED',
            message: 'Too many requests.',
          },
          headers: {
            'Retry-After': String(retryAfter),
          },
        }),
      );
    } catch (error) {
      request.log.error({ err: error }, 'Rate limiter failure');
      reply.status(503).send(
        toBackendErrorResponse({
          status: 503,
          requestId: request.id,
          body: {
            code: 'DEPENDENCY_UNAVAILABLE',
            message: 'Rate limiting temporarily unavailable.',
          },
        }),
      );
    }
  };
}
