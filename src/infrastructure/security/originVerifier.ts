import type { RequestContext } from '@/application/shared/requestContext';
import { fail, type ServiceResult } from '@/application/shared/serviceResult';

const allowedOrigins = new Set<string>();

function getAllowedOrigins(): Set<string> {
  if (allowedOrigins.size > 0) {
    return allowedOrigins;
  }

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  if (serverUrl) {
    try {
      allowedOrigins.add(new URL(serverUrl).origin);
    } catch {
      // Ignore invalid value.
    }
  }

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProd) {
    allowedOrigins.add(`https://${vercelProd}`);
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    allowedOrigins.add(`https://${vercelUrl}`);
  }

  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.add('http://localhost:3000');
  }

  return allowedOrigins;
}

function getRequestOrigin(context: RequestContext): string | null {
  const forwardedProto = context.forwardedProto?.split(',')[0]?.trim();
  const host = context.forwardedHost?.split(',')[0]?.trim() || context.host?.trim();
  const proto =
    forwardedProto && /^(https?|wss?)$/i.test(forwardedProto)
      ? forwardedProto.toLowerCase()
      : host?.startsWith('localhost')
        ? 'http'
        : 'https';

  if (!host) {
    return null;
  }

  return `${proto}://${host}`;
}

export function verifyRequestOrigin(
  context: RequestContext,
): ServiceResult<{ message: string }> | null {
  if (!context.origin) {
    return fail(403, { message: 'Forbidden.' });
  }

  let normalizedOrigin: string;
  try {
    normalizedOrigin = new URL(context.origin).origin;
  } catch {
    return fail(403, { message: 'Forbidden.' });
  }

  const requestOrigin = getRequestOrigin(context);
  if (requestOrigin && requestOrigin === normalizedOrigin) {
    return null;
  }

  if (!getAllowedOrigins().has(normalizedOrigin)) {
    return fail(403, { message: 'Forbidden.' });
  }

  return null;
}
