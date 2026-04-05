import { NextRequest, NextResponse } from 'next/server';

type RedirectRule = {
  fromPath?: string;
  toPath?: string;
  isPermanent?: boolean;
};

type RedirectCacheEntry = {
  expiresAt: number;
  rules: RedirectRule[];
};

const redirectCacheByBaseUrl = new Map<string, RedirectCacheEntry>();

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

function resolveRedirectApiBaseUrl(requestOrigin?: string): string {
  if (requestOrigin) return requestOrigin;
  return (
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
    'http://localhost:3000'
  );
}

function resolvePayloadApiRoot(): string {
  const configured = process.env.PAYLOAD_ROUTE_API;
  if (!configured) return '/api';
  return configured.startsWith('/') ? configured : `/${configured}`;
}

async function loadRedirectRules(requestOrigin?: string): Promise<RedirectRule[]> {
  const enableDevRedirects = process.env.ENABLE_DEV_REDIRECT_RULES === 'true';
  if (process.env.NODE_ENV !== 'production' && !enableDevRedirects) {
    return [];
  }

  const baseUrl = resolveRedirectApiBaseUrl(requestOrigin);
  const now = Date.now();
  const cachedEntry = redirectCacheByBaseUrl.get(baseUrl);
  if (cachedEntry && now < cachedEntry.expiresAt) return cachedEntry.rules;

  const apiRoot = resolvePayloadApiRoot();
  try {
    // Anonymous read access on redirect-rules already constrains enabled=true; omitting
    // where[enabled] avoids Payload merging duplicate predicates on the same column.
    const url = `${baseUrl}${apiRoot}/redirect-rules?limit=500`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) {
      // Keep the last successful rules; retry after a short backoff.
      const fallbackRules = cachedEntry?.rules ?? [];
      redirectCacheByBaseUrl.set(baseUrl, {
        rules: fallbackRules,
        expiresAt: now + 30_000,
      });
      return fallbackRules;
    }
    const data = (await response.json()) as { docs?: RedirectRule[] };
    const rules = Array.isArray(data.docs) ? data.docs : [];
    redirectCacheByBaseUrl.set(baseUrl, {
      rules,
      expiresAt: now + 60_000,
    });
    return rules;
  } catch {
    // Keep the last successful rules; retry after a short backoff.
    const fallbackRules = cachedEntry?.rules ?? [];
    redirectCacheByBaseUrl.set(baseUrl, {
      rules: fallbackRules,
      expiresAt: now + 30_000,
    });
    return fallbackRules;
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

  // Skip proxy for Payload API routes to avoid self-referential fetch deadlock.
  // Uses the same PAYLOAD_ROUTE_API root that loadRedirectRules() fetches from,
  // so a custom API prefix is honoured consistently.
  const apiRoot = resolvePayloadApiRoot();
  if (pathname === apiRoot || pathname.startsWith(`${apiRoot}/`)) {
    return NextResponse.next();
  }

  // Skip framework internals (HMR, chunks, image optimizer, RSC endpoints).
  if (pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  const rules = await loadRedirectRules(request.nextUrl.origin);
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
  matcher: ['/((?!_next/|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|css|js|map|txt|xml)$).*)'],
};
