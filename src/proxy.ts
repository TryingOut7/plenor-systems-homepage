import { NextRequest, NextResponse } from 'next/server';

const COOKIE = 'staging_auth';

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
  const password = process.env.STAGING_PASSWORD;
  const { pathname } = request.nextUrl;

  // Skip proxy for Payload API routes to avoid self-referential fetch deadlock
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/staging-auth')) {
    return NextResponse.next();
  }

  if (password) {
    // Always allow the login page, its auth API route, the Payload admin panel, and API routes
    if (
      pathname === '/staging-login' ||
      pathname.startsWith('/api/staging-auth') ||
      pathname.startsWith('/admin')
    ) {
      return NextResponse.next();
    }

    // Password protected staging: enforce session cookie.
    if (request.cookies.get(COOKIE)?.value !== password) {
      const url = request.nextUrl.clone();
      url.pathname = '/staging-login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  const rules = await loadRedirectRules();
  const normalizedPath = normalizePath(pathname);
  const match = findRedirectMatch(rules, normalizedPath);

  if (match?.toPath) {
    const resolvedTo = resolveRedirectTarget(match.fromPath ?? '', match.toPath, normalizedPath);
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
