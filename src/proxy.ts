import { NextRequest, NextResponse } from 'next/server';

// Per-IP sliding window rate limiter for form endpoints.
// Uses a module-level Map — effective within a single warm instance.
// For multi-instance deployments, replace with an edge KV store (e.g. Vercel KV).
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function checkRateLimit(ip: string): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  const current = rateLimitStore.get(ip);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false, retryAfter: 0 };
  }

  current.count += 1;
  if (current.count > RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((current.resetAt - now) / 1000);
    return { limited: true, retryAfter };
  }

  return { limited: false, retryAfter: 0 };
}

type RedirectRule = {
  fromPath?: string;
  toPath?: string;
  isPermanent?: boolean;
};

let cachedRedirects: RedirectRule[] = [];
let cacheExpiresAt = 0;

function normalizePath(path: string): string {
  if (!path) return '/';
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (clean.length > 1 && clean.endsWith('/')) return clean.slice(0, -1);
  return clean;
}

function isValidRedirectPath(path: string, allowWildcard: boolean): boolean {
  const trimmed = path.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    trimmed.startsWith('//')
  ) {
    return false;
  }

  if (!trimmed.startsWith('/')) return false;
  if (/\s/.test(trimmed)) return false;
  if (trimmed.includes('?') || trimmed.includes('#')) return false;

  const wildcardCount = (trimmed.match(/\*/g) || []).length;
  if (!allowWildcard && wildcardCount > 0) return false;
  if (allowWildcard && wildcardCount > 0) {
    if (!trimmed.endsWith('/*') || wildcardCount > 1) return false;
  }

  return true;
}

async function loadRedirectRules(): Promise<RedirectRule[]> {
  const enableDevRedirects = process.env.ENABLE_DEV_REDIRECT_RULES === 'true';
  if (process.env.NODE_ENV !== 'production' && !enableDevRedirects) {
    return [];
  }

  const now = Date.now();
  if (now < cacheExpiresAt) return cachedRedirects;

  // Use Payload's REST API to load redirect rules
  const baseUrl =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
    'http://localhost:3000';

  try {
    const url = `${baseUrl}/api/redirect-rules?where[enabled][equals]=true&limit=500`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) {
      cachedRedirects = [];
      cacheExpiresAt = now + 30_000;
      return cachedRedirects;
    }
    const data = (await response.json()) as { docs?: RedirectRule[] };
    cachedRedirects = Array.isArray(data.docs) ? data.docs : [];
    cacheExpiresAt = now + 60_000;
    return cachedRedirects;
  } catch {
    cachedRedirects = [];
    cacheExpiresAt = now + 30_000;
    return cachedRedirects;
  }
}

/**
 * Converts a fromPath pattern with a trailing wildcard `*` into a regex.
 * e.g. "/old-blog/*" matches "/old-blog/post-1", "/old-blog/a/b/c"
 * Literal paths (no wildcard) match exactly.
 */
function matchesFromPath(ruleFrom: string, requestPath: string): boolean {
  const normalizedFrom = normalizePath(ruleFrom);
  if (normalizedFrom.endsWith('/*')) {
    const prefix = normalizedFrom.slice(0, -2); // strip "/*"
    return requestPath === prefix || requestPath.startsWith(prefix + '/');
  }
  return normalizedFrom === requestPath;
}

function findRedirectMatch(
  rules: RedirectRule[],
  normalizedPath: string,
): RedirectRule | undefined {
  return rules.find(
    (rule) =>
      typeof rule.fromPath === 'string' &&
      typeof rule.toPath === 'string' &&
      isValidRedirectPath(rule.fromPath, true) &&
      isValidRedirectPath(rule.toPath, true) &&
      (!rule.toPath.includes('*') || rule.fromPath.endsWith('/*')) &&
      matchesFromPath(rule.fromPath, normalizedPath),
  );
}

/**
 * Resolves the target path, carrying over the wildcard suffix when applicable.
 * e.g. from="/old-blog/*", to="/blog/*", request="/old-blog/my-post" → "/blog/my-post"
 */
function resolveRedirectTarget(
  fromPath: string,
  toPath: string,
  requestPath: string,
): string {
  const normalizedFrom = normalizePath(fromPath);
  if (normalizedFrom.endsWith('/*') && toPath.endsWith('/*')) {
    const prefix = normalizedFrom.slice(0, -2);
    const suffix = requestPath.slice(prefix.length); // includes leading "/"
    return toPath.slice(0, -2) + suffix;
  }
  return toPath;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate-limit form submission endpoints
  if (pathname === '/api/guide' || pathname === '/api/inquiry') {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const { limited, retryAfter } = checkRateLimit(ip);
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

  // Skip proxy for Payload API routes to avoid self-referential fetch deadlock
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const rules = await loadRedirectRules();
  const normalizedPath = normalizePath(pathname);
  const match = findRedirectMatch(rules, normalizedPath);

  if (match?.toPath) {
    const resolvedTo = resolveRedirectTarget(match.fromPath ?? '', match.toPath, normalizedPath);
    if (!isValidRedirectPath(resolvedTo, false)) {
      return NextResponse.next();
    }
    const toPath = normalizePath(resolvedTo);
    if (toPath !== normalizedPath) {
      const url = request.nextUrl.clone();
      url.pathname = toPath;
      return NextResponse.redirect(url, match.isPermanent ? 308 : 307);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|css|js|map|txt|xml)$).*)'],
};
