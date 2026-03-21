import { NextRequest, NextResponse } from 'next/server';
import { safeCompare } from '@/lib/timing-safe-equal';
import { verifyOrigin } from '@/lib/verify-origin';

export async function POST(request: NextRequest) {
  const originError = verifyOrigin(request);
  if (originError) return originError;

  const password = process.env.STAGING_PASSWORD;
  if (!password) return NextResponse.json({ error: 'Not a staging environment' }, { status: 403 });

  const { password: submitted, next } = await request.json();

  if (!safeCompare(String(submitted ?? ''), password)) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, next: next || '/' });
  response.cookies.set('staging_auth', password, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 86400, // 24 hours
  });

  return response;
}
