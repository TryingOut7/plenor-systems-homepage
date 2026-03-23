import type { RequestContext } from '@/application/shared/requestContext';
import type { NextRequest } from 'next/server';

export function toRequestContext(request: NextRequest): RequestContext {
  return {
    path: request.nextUrl.pathname,
    url: request.url,
    origin: request.headers.get('origin'),
    host: request.headers.get('host'),
    forwardedHost: request.headers.get('x-forwarded-host'),
    forwardedProto: request.headers.get('x-forwarded-proto'),
    realIp: request.headers.get('x-real-ip'),
    forwardedFor: request.headers.get('x-forwarded-for'),
    authorization: request.headers.get('authorization'),
  };
}

export async function readJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
