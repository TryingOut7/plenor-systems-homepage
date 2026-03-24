import type { RequestContext } from '@/application/shared/requestContext';
import { fail, type ServiceResult } from '@/application/shared/serviceResult';

interface Entry {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const MAX_STORE_SIZE = 10_000;
const store = new Map<string, Entry>();

function cleanup(): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

function getClientIp(context: RequestContext): string {
  const ip = context.realIp || context.forwardedFor?.split(',')[0]?.trim();
  if (!ip) {
    console.warn('Rate limiter: could not determine client IP, using fallback key');
    return 'unknown';
  }
  return ip;
}

export function checkRateLimit(
  context: RequestContext,
): ServiceResult<{ message: string }> | null {
  const key = `${getClientIp(context)}:${context.path}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    if (store.size >= MAX_STORE_SIZE) {
      cleanup();
    }

    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  entry.count += 1;

  if (entry.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      ...fail(429, { message: 'Too many requests.' }),
      headers: { 'Retry-After': String(retryAfter) },
    };
  }

  return null;
}
