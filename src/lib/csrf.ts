import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = new Set<string>();

function getAllowedOrigins(): Set<string> {
  if (ALLOWED_ORIGINS.size > 0) return ALLOWED_ORIGINS;

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  if (serverUrl) {
    try {
      ALLOWED_ORIGINS.add(new URL(serverUrl).origin);
    } catch { /* invalid URL, skip */ }
  }

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelUrl) ALLOWED_ORIGINS.add(`https://${vercelUrl}`);

  const vercelBranch = process.env.VERCEL_URL;
  if (vercelBranch) ALLOWED_ORIGINS.add(`https://${vercelBranch}`);

  if (process.env.NODE_ENV === 'development') {
    ALLOWED_ORIGINS.add('http://localhost:3000');
  }

  return ALLOWED_ORIGINS;
}

export function verifyCsrf(req: NextRequest): NextResponse | null {
  const origin = req.headers.get('origin');

  if (!origin) {
    return NextResponse.json({ message: 'Missing Origin header.' }, { status: 403 });
  }

  const allowed = getAllowedOrigins();
  if (!allowed.has(origin)) {
    return NextResponse.json({ message: 'Forbidden: invalid origin.' }, { status: 403 });
  }

  return null;
}
