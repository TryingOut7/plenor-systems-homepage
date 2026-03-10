import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const password = process.env.STAGING_PASSWORD;
  if (!password) return NextResponse.json({ error: 'Not a staging environment' }, { status: 403 });

  const { password: submitted, next } = await request.json();

  if (submitted !== password) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, next: next || '/' });
  response.cookies.set('staging_auth', password, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });

  return response;
}
