import type { FastifyReply } from 'fastify';
import type { ServiceResult } from '../../../../src/application/shared/serviceResult';
import { toBackendErrorResponse } from './errorEnvelope';

export function sendServiceResult<T>(
  reply: FastifyReply,
  result: ServiceResult<T>,
  requestId?: string,
): FastifyReply {
  if (result.headers) {
    for (const [key, value] of Object.entries(result.headers)) {
      reply.header(key, value);
    }
  }

  if (result.status >= 400) {
    const body = toBackendErrorResponse({
      status: result.status,
      requestId,
      body: result.body as Record<string, unknown> | string | null | undefined,
      headers: result.headers,
    });
    return reply.status(result.status).send(body);
  }

  return reply.status(result.status).send(result.body);
}
