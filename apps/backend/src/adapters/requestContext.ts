import type { FastifyRequest } from 'fastify';
import type { RequestContext } from '../../../../src/application/shared/requestContext';

function firstHeader(value: string | string[] | undefined): string | null {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.length > 0) return value[0] || null;
  return null;
}

export function toRequestContext(request: FastifyRequest): RequestContext {
  const path = request.url.split('?')[0] || '/';
  const host = firstHeader(request.headers.host);
  const forwardedProto = firstHeader(request.headers['x-forwarded-proto']);
  const protocol = forwardedProto?.split(',')[0]?.trim() || request.protocol || 'http';
  const base = host ? `${protocol}://${host}` : `http://localhost`;

  return {
    requestId: request.id,
    method: request.method,
    path,
    url: `${base}${request.url}`,
    origin: firstHeader(request.headers.origin),
    host,
    forwardedHost: firstHeader(request.headers['x-forwarded-host']),
    forwardedProto,
    realIp: firstHeader(request.headers['x-real-ip']),
    forwardedFor: firstHeader(request.headers['x-forwarded-for']),
    authorization: firstHeader(request.headers.authorization),
    apiKey: firstHeader(request.headers['x-api-key']),
    idempotencyKey: firstHeader(request.headers['idempotency-key']),
  };
}
