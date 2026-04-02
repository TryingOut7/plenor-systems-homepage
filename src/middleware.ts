import { type NextRequest, NextResponse } from 'next/server';

// Per-IP sliding window rate limiter for form endpoints.
// Uses a module-level Map — effective within a single warm instance.
// For multi-instance deployments, replace with an edge KV store (e.g. Vercel KV).
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

function isRateLimited(ip: string): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  const current = store.get(ip);

  if (!current || current.resetAt <= now) {
    store.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false, retryAfter: 0 };
  }

  current.count += 1;
  if (current.count > RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((current.resetAt - now) / 1000);
    return { limited: true, retryAfter };
  }

  return { limited: false, retryAfter: 0 };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isFormRoute = pathname === '/api/guide' || pathname === '/api/inquiry';

  if (isFormRoute) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const { limited, retryAfter } = isRateLimited(ip);

    if (limited) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
          },
        },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/guide', '/api/inquiry'],
};
