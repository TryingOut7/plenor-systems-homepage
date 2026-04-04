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
  return Date.now() < payloadFailureUntil;
}

export function markPayloadFailure(): void {
  payloadFailureUntil = Date.now() + CMS_FAILURE_BACKOFF_MS;
}
