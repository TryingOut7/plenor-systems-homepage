import type { CollectionData, RedirectRule, ServiceItem, SitemapQueryResult, SitePage, SiteSettings, UISettings } from './types.ts';

export type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export const CMS_CACHE_TTL_MS = Number.parseInt(process.env.CMS_CACHE_TTL_MS || '60000', 10);
export const CMS_FAILURE_BACKOFF_MS = Number.parseInt(process.env.CMS_FAILURE_BACKOFF_MS || '30000', 10);

if (process.env.CMS_SKIP_PAYLOAD === 'true' && process.env.NODE_ENV === 'production') {
  console.warn(
    '[CMS] WARNING: CMS_SKIP_PAYLOAD=true is set in production. ' +
    'Payload data will be bypassed — fallbacks will be served for all CMS content.',
  );
}

export const siteSettingsCache: { entry?: CacheEntry<SiteSettings | null> } = {};
export const uiSettingsCache: { entry?: CacheEntry<UISettings | null> } = {};
export const collectionDataCache: { entry?: CacheEntry<CollectionData> } = {};
export const pageCache = new Map<string, CacheEntry<SitePage | null>>();
export const serviceItemCache = new Map<string, CacheEntry<ServiceItem | null>>();
export const sitemapCache: { entry?: CacheEntry<SitemapQueryResult> } = {};
export const redirectRulesCache: { entry?: CacheEntry<RedirectRule[]> } = {};

let payloadFailureUntil = 0;

export function getFromCache<T>(entry: CacheEntry<T> | undefined): T | undefined {
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) return undefined;
  return entry.value;
}

export function setCache<T>(holder: { entry?: CacheEntry<T> }, value: T, ttl = CMS_CACHE_TTL_MS): T {
  holder.entry = {
    value,
    expiresAt: Date.now() + ttl,
  };
  return value;
}

export function getMapCache<T>(map: Map<string, CacheEntry<T>>, key: string): T | undefined {
  const entry = map.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    map.delete(key);
    return undefined;
  }
  return entry.value;
}

export function setMapCache<T>(map: Map<string, CacheEntry<T>>, key: string, value: T, ttl = CMS_CACHE_TTL_MS): T {
  map.set(key, {
    value,
    expiresAt: Date.now() + ttl,
  });
  return value;
}

export function shouldSkipPayload(): boolean {
  if (process.env.CMS_SKIP_PAYLOAD === 'true') {
    return true;
  }
  const hasDatabaseConnectionString = Boolean(
    process.env.POSTGRES_URL || process.env.DATABASE_URI || process.env.DATABASE_URL,
  );
  if (!hasDatabaseConnectionString) {
    return true;
  }
  return Date.now() < payloadFailureUntil;
}

export function markPayloadFailure(): void {
  payloadFailureUntil = Date.now() + CMS_FAILURE_BACKOFF_MS;
}

function clearHolderEntry(holder: { entry?: unknown }): void {
  if ('entry' in holder) {
    delete holder.entry;
  }
}

function readSlugFromDoc(doc: unknown, field: 'slug' | 'targetSlug' = 'slug'): string | null {
  if (!doc || typeof doc !== 'object') return null;
  const raw = (doc as Record<string, unknown>)[field];
  if (typeof raw !== 'string') return null;
  const normalized = raw.trim().replace(/^\/+|\/+$/g, '');
  return normalized || null;
}

function invalidatePageCacheForSlug(slug: string | null): void {
  if (!slug) return;
  pageCache.delete(slug);
}

export function invalidateCmsCollectionCaches(input: {
  collectionSlug: string;
  doc?: unknown;
  previousDoc?: unknown;
}): void {
  switch (input.collectionSlug) {
    case 'site-pages': {
      invalidatePageCacheForSlug(readSlugFromDoc(input.doc, 'slug'));
      invalidatePageCacheForSlug(readSlugFromDoc(input.previousDoc, 'slug'));
      clearHolderEntry(sitemapCache);
      break;
    }
    case 'redirect-rules': {
      clearHolderEntry(redirectRulesCache);
      break;
    }
    case 'service-items':
    case 'blog-posts':
    case 'testimonials':
    case 'team-members':
    case 'logos': {
      clearHolderEntry(collectionDataCache);
      clearHolderEntry(sitemapCache);
      break;
    }
    case 'page-drafts': {
      invalidatePageCacheForSlug(readSlugFromDoc(input.doc, 'targetSlug'));
      invalidatePageCacheForSlug(readSlugFromDoc(input.previousDoc, 'targetSlug'));
      break;
    }
    default:
      break;
  }
}

export function invalidateCmsGlobalCaches(globalSlug: string): void {
  switch (globalSlug) {
    case 'site-settings':
      clearHolderEntry(siteSettingsCache);
      clearHolderEntry(sitemapCache);
      pageCache.clear();
      break;
    case 'ui-settings':
      clearHolderEntry(uiSettingsCache);
      break;
    default:
      break;
  }
}
