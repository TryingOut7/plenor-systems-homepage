import { NextRequest, NextResponse } from 'next/server';

const COOKIE = 'staging_auth';
const SANITY_API_VERSION = '2024-01-01';

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
  const now = Date.now();
  if (now < cacheExpiresAt) return cachedRedirects;

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const token = process.env.SANITY_API_READ_TOKEN;

  if (!projectId) {
    cachedRedirects = [];
    cacheExpiresAt = now + 30_000;
    return cachedRedirects;
  }

  const query =
    '*[_type == "redirectRule" && enabled == true]{fromPath, toPath, isPermanent}';
  const url = `https://${projectId}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    if (!response.ok) {
      cachedRedirects = [];
      cacheExpiresAt = now + 30_000;
      return cachedRedirects;
    }
    const data = (await response.json()) as { result?: RedirectRule[] };
    cachedRedirects = Array.isArray(data.result) ? data.result : [];
    cacheExpiresAt = now + 60_000;
    return cachedRedirects;
  } catch {
    cachedRedirects = [];
    cacheExpiresAt = now + 30_000;
    return cachedRedirects;
  }
}

export async function middleware(request: NextRequest) {
  const password = process.env.STAGING_PASSWORD;
  const { pathname } = request.nextUrl;

  if (password) {
    // Always allow the login page, its auth API route, the Sanity Studio, and draft mode routes
    if (
      pathname === '/staging-login' ||
      pathname.startsWith('/api/staging-auth') ||
      pathname.startsWith('/api/draft-mode') ||
      pathname.startsWith('/studio')
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
  const match = rules.find(
    (rule) =>
      typeof rule.fromPath === 'string' &&
      typeof rule.toPath === 'string' &&
      normalizePath(rule.fromPath) === normalizedPath
  );

  if (match?.toPath) {
    const toPath = normalizePath(match.toPath);
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
