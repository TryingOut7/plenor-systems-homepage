import { NextRequest, NextResponse } from 'next/server';
import {
  findRedirectMatch,
  isValidRedirectPath,
  normalizeRedirectPath,
  resolveRedirectChain,
  type RedirectRuleLike,
} from './lib/redirects';
import { buildContentSecurityPolicy } from './lib/external-resource-policy';

type RedirectRule = RedirectRuleLike;

type RedirectCacheEntry = {
  expiresAt: number;
  rules: RedirectRule[];
};

const redirectCacheByBaseUrl = new Map<string, RedirectCacheEntry>();

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

function nextWithFrontendHeaders(): NextResponse {
  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', buildContentSecurityPolicy());
  return response;
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

  // Skip admin panel — those routes should never be redirected, and checking
  // redirect rules on admin cold starts wastes a PgBouncer connection slot.
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return NextResponse.next();
  }

  // Skip framework internals (HMR, chunks, image optimizer, RSC endpoints).
  if (pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  const rules = await loadRedirectRules(request.nextUrl.origin);
  const normalizedPath = normalizeRedirectPath(pathname);
  const resolution = resolveRedirectChain(rules, normalizedPath);

  if (resolution.kind === 'blocked') {
    const match = findRedirectMatch(rules, normalizedPath);
    console.error('[redirect-proxy] blocked redirect chain', {
      requestPath: normalizedPath,
      reason: resolution.reason,
      visitedPaths: resolution.visitedPaths,
      ruleFromPath: match?.fromPath ?? resolution.matchedRule?.fromPath,
      ruleToPath: match?.toPath ?? resolution.matchedRule?.toPath,
    });
    return nextWithFrontendHeaders();
  }

  if (
    resolution.kind === 'redirect' &&
    isValidRedirectPath(resolution.targetPath, false) &&
    resolution.targetPath !== normalizedPath
  ) {
    const url = request.nextUrl.clone();
    url.pathname = resolution.targetPath;
    return NextResponse.redirect(url, resolution.isPermanent ? 308 : 307);
  }

  return nextWithFrontendHeaders();
}

export const proxyInternals = {
  loadRedirectRules,
  redirectCacheByBaseUrl,
  nextWithFrontendHeaders,
};

export default proxy;

export const config = {
  matcher: ['/((?!_next/|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|css|js|map|txt|xml)$).*)'],
};
