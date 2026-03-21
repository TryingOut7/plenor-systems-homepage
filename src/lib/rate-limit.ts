import { NextRequest, NextResponse } from 'next/server';

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const MAX_STORE_SIZE = 10_000;

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function rateLimit(req: NextRequest): NextResponse | null {
  const key = `${getIp(req)}:${req.nextUrl.pathname}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    if (store.size >= MAX_STORE_SIZE) cleanup();
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  entry.count++;

  if (entry.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { message: 'Too many requests.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  return null;
}
