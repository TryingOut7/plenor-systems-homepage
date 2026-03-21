import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = new Set<string>();

function getAllowedOrigins(): Set<string> {
  if (allowedOrigins.size > 0) return allowedOrigins;

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  if (serverUrl) {
    try {
      allowedOrigins.add(new URL(serverUrl).origin);
    } catch { /* skip invalid */ }
  }

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProd) allowedOrigins.add(`https://${vercelProd}`);

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) allowedOrigins.add(`https://${vercelUrl}`);

  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.add('http://localhost:3000');
  }

  return allowedOrigins;
}

function getRequestOrigin(req: NextRequest): string | null {
  const forwardedProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const host = forwardedHost || req.headers.get('host')?.trim();
  const proto =
    forwardedProto && /^(https?|wss?)$/i.test(forwardedProto)
      ? forwardedProto.toLowerCase()
      : host?.startsWith('localhost')
        ? 'http'
        : 'https';

  if (!host) return null;
  return `${proto}://${host}`;
}

export function verifyOrigin(req: NextRequest): NextResponse | null {
  const originHeader = req.headers.get('origin');
  if (!originHeader) {
    return NextResponse.json({ message: 'Forbidden.' }, { status: 403 });
  }

  let normalizedOrigin: string;
  try {
    normalizedOrigin = new URL(originHeader).origin;
  } catch {
    return NextResponse.json({ message: 'Forbidden.' }, { status: 403 });
  }

  const requestOrigin = getRequestOrigin(req);
  if (requestOrigin && normalizedOrigin === requestOrigin) {
    return null;
  }

  if (!getAllowedOrigins().has(normalizedOrigin)) {
    return NextResponse.json({ message: 'Forbidden.' }, { status: 403 });
  }

  return null;
}
