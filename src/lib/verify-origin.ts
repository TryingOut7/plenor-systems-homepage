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

export function verifyOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get('origin');
  if (!origin) {
    return NextResponse.json({ message: 'Forbidden.' }, { status: 403 });
  }

  if (!getAllowedOrigins().has(origin)) {
    return NextResponse.json({ message: 'Forbidden.' }, { status: 403 });
  }

  return null;
}
