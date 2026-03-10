import { NextRequest, NextResponse } from 'next/server';

const COOKIE = 'staging_auth';

export function middleware(request: NextRequest) {
  const password = process.env.STAGING_PASSWORD;

  // No password set → not staging, let everything through
  if (!password) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Always allow the login page and its auth API route
  if (pathname === '/staging-login' || pathname.startsWith('/api/staging-auth')) {
    return NextResponse.next();
  }

  // Valid session cookie → allow
  if (request.cookies.get(COOKIE)?.value === password) {
    return NextResponse.next();
  }

  // Redirect to login, preserving the intended destination
  const url = request.nextUrl.clone();
  url.pathname = '/staging-login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.ico$|.*\\.png$).*)'],
};
