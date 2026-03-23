import type { FastifyReply } from 'fastify';
import type { ServiceResult } from '../../../../src/application/shared/serviceResult';

export function sendServiceResult<T>(
  reply: FastifyReply,
  result: ServiceResult<T>,
): FastifyReply {
  if (result.headers) {
    for (const [key, value] of Object.entries(result.headers)) {
      reply.header(key, value);
    }
  }

  return reply.status(result.status).send(result.body);
}
