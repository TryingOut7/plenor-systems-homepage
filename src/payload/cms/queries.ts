import { cache } from 'react';
import { getPayload } from '../client.ts';
import {
  collectionDataCache,
  getFromCache,
  getMapCache,
  markPayloadFailure,
  pageCache,
  redirectRulesCache,
  serviceItemCache,
  setCache,
  setMapCache,
  shouldSkipPayload,
  sitemapCache,
  siteSettingsCache,
  uiSettingsCache,
} from './cache.ts';
import {
  cloneDefaultSitePage,
  DEFAULT_SITE_PAGE_SLUGS,
  normalizeBlogPost,
  normalizeSection,
  normalizeServiceItem,
  normalizeTestimonial,
  normalizeSeo,
} from './normalize.ts';
import type {
  CmsReadOptions,
  CollectionData,
  RedirectRule,
  ServiceItem,
  SitemapQueryResult,
  SitePage,
  SiteSettings,
  UISettings,
} from './types.ts';

const PAYLOAD_QUERY_TIMEOUT_MS = 8000;

async function withPayloadTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(() => {
          reject(new Error(`Payload query timeout after ${PAYLOAD_QUERY_TIMEOUT_MS}ms (${label})`));
        }, PAYLOAD_QUERY_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function isDraftRead(options?: CmsReadOptions): boolean {
  return options?.draft === true;
}

export const getSiteSettings = cache(async function getSiteSettings(
  options: CmsReadOptions = {},
): Promise<SiteSettings | null> {
  const draft = isDraftRead(options);

  if (!draft) {
    const cached = getFromCache(siteSettingsCache.entry);
    if (cached !== undefined) return cached;
    if (shouldSkipPayload()) return setCache(siteSettingsCache, null, 10_000);
  }

  try {
    const payload = await getPayload();
    const data = await withPayloadTimeout(
      payload.findGlobal({
        slug: 'site-settings',
        ...(draft ? { draft: true } : {}),
      }),
      'findGlobal:site-settings',
    );
    if (!data) {
      return draft ? null : setCache(siteSettingsCache, null);
    }

    const d = data as Record<string, unknown>;
    const normalized: SiteSettings = {
      siteName: d.siteName as string | undefined,
      brandTagline: d.brandTagline as string | undefined,
      siteUrl: d.siteUrl as string | undefined,
      contactEmail: d.contactEmail as string | undefined,
      headerButtons: d.headerButtons as SiteSettings['headerButtons'],
      twitterHandle: d.twitterHandle as string | undefined,
      defaultSeo: normalizeSeo(d.defaultSeo),
      defaultMetaDescription: d.defaultMetaDescription as string | undefined,
      navigationLinks: d.navigationLinks as SiteSettings['navigationLinks'],
      footerColumns: d.footerColumns as SiteSettings['footerColumns'],
      socialLinks: d.socialLinks as SiteSettings['socialLinks'],
      copyrightText: d.copyrightText as string | undefined,
      footerLegalLabel: d.footerLegalLabel as string | undefined,
      footerLegalHref: d.footerLegalHref as string | undefined,
      jsonLd: d.jsonLd as SiteSettings['jsonLd'],
      guideForm: d.guideForm as SiteSettings['guideForm'],
      inquiryForm: d.inquiryForm as SiteSettings['inquiryForm'],
      cookieBanner: d.cookieBanner as SiteSettings['cookieBanner'],
      privacyPolicy: d.privacyPolicy,
      privacyLastUpdated: d.privacyLastUpdated as string | undefined,
      notFoundPage: d.notFoundPage as SiteSettings['notFoundPage'],
      analyticsId: d.analyticsId as string | undefined,
    };

    return draft ? normalized : setCache(siteSettingsCache, normalized);
  } catch {
    if (draft) return null;
    markPayloadFailure();
    return setCache(siteSettingsCache, null, 10_000);
  }
});

export const getUISettings = cache(async function getUISettings(
  options: CmsReadOptions = {},
): Promise<UISettings | null> {
  const draft = isDraftRead(options);

  if (!draft) {
    const cached = getFromCache(uiSettingsCache.entry);
    if (cached !== undefined) return cached;
    if (shouldSkipPayload()) return setCache(uiSettingsCache, null, 10_000);
  }

  try {
    const payload = await getPayload();
    const data = await withPayloadTimeout(
      payload.findGlobal({
        slug: 'ui-settings',
        ...(draft ? { draft: true } : {}),
      }),
      'findGlobal:ui-settings',
    );
    if (!data) return draft ? null : setCache(uiSettingsCache, null);

    const d = data as Record<string, unknown>;
    const normalized: UISettings = {
      colors: d.colors as UISettings['colors'],
      typography: d.typography as UISettings['typography'],
      layout: d.layout as UISettings['layout'],
      buttons: d.buttons as UISettings['buttons'],
    };

    return draft ? normalized : setCache(uiSettingsCache, normalized);
  } catch {
    if (draft) return null;
    markPayloadFailure();
    return setCache(uiSettingsCache, null, 10_000);
  }
});

export const getSitePageBySlug = cache(async function getSitePageBySlug(
  slug: string,
  options: CmsReadOptions = {},
): Promise<SitePage | null> {
  const draft = isDraftRead(options);
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, '');
  if (!draft) {
    const cached = getMapCache(pageCache, normalizedSlug);
    if (cached !== undefined) return cached;
    if (shouldSkipPayload()) {
      return setMapCache(pageCache, normalizedSlug, cloneDefaultSitePage(normalizedSlug), 10_000);
    }
  }

  try {
    const payload = await getPayload();
    const result = await withPayloadTimeout(
      payload.find({
        collection: 'site-pages',
        where: {
          slug: { equals: normalizedSlug },
          ...(draft
            ? {}
            : {
                isActive: { equals: true },
                workflowStatus: { equals: 'published' },
              }),
        },
        limit: 1,
        depth: 1,
        overrideAccess: draft,
        ...(draft ? { draft: true } : {}),
      }),
      `find:site-pages:${normalizedSlug}`,
    );
    const doc = result.docs[0];
    if (!doc) {
      if (draft) return null;
      return setMapCache(pageCache, normalizedSlug, cloneDefaultSitePage(normalizedSlug));
    }

    const d = doc as Record<string, unknown>;
    const fallback = cloneDefaultSitePage(normalizedSlug);
    const sections = Array.isArray(d.sections) ? d.sections.map(normalizeSection) : [];
    const resolvedSections = sections.length > 0 ? sections : (fallback?.sections ?? []);

    const normalized: SitePage = {
      id: String(d.id),
      title: (d.title as string | undefined) || fallback?.title,
      slug: (d.slug as string | undefined) || fallback?.slug,
      pageMode: d.pageMode as SitePage['pageMode'],
      templateKey: d.templateKey as SitePage['templateKey'],
      presetKey: d.presetKey as SitePage['presetKey'],
      presetContent: d.presetContent as SitePage['presetContent'],
      isActive: d.isActive as boolean | undefined,
      hideNavbar: d.hideNavbar as boolean | undefined,
      hideFooter: d.hideFooter as boolean | undefined,
      pageBackgroundColor: d.pageBackgroundColor as string | undefined,
      customHeadScripts: d.customHeadScripts as string | undefined,
      seo: normalizeSeo(d.seo),
      sections: resolvedSections,
    };

    return draft ? normalized : setMapCache(pageCache, normalizedSlug, normalized);
  } catch {
    if (draft) return null;
    markPayloadFailure();
    return setMapCache(pageCache, normalizedSlug, cloneDefaultSitePage(normalizedSlug), 10_000);
  }
});

export const getCollectionData = cache(async function getCollectionData(
  options: CmsReadOptions = {},
): Promise<CollectionData> {
  const draft = isDraftRead(options);
  if (!draft) {
    const cached = getFromCache(collectionDataCache.entry);
    if (cached !== undefined) return cached;
  }
  const emptyData: CollectionData = { serviceItems: [], blogPosts: [], testimonials: [] };
  if (!draft && shouldSkipPayload()) return setCache(collectionDataCache, emptyData, 10_000);

  try {
    const payload = await getPayload();
    const publishedFilter = { workflowStatus: { equals: 'published' } };
    const [serviceResult, blogResult, testimonialResult] = await Promise.all([
      withPayloadTimeout(
        payload.find({
          collection: 'service-items',
          ...(draft ? {} : { where: publishedFilter }),
          sort: '-updatedAt',
          limit: 100,
          depth: 1,
          ...(draft ? { draft: true } : {}),
        }),
        'find:service-items',
      ),
      withPayloadTimeout(
        payload.find({
          collection: 'blog-posts',
          ...(draft ? {} : { where: publishedFilter }),
          sort: '-publishedAt',
          limit: 100,
          depth: 1,
          ...(draft ? { draft: true } : {}),
        }),
        'find:blog-posts',
      ),
      withPayloadTimeout(
        payload.find({
          collection: 'testimonials',
          ...(draft ? {} : { where: publishedFilter }),
          sort: '-publishedAt',
          limit: 100,
          depth: 1,
          ...(draft ? { draft: true } : {}),
        }),
        'find:testimonials',
      ),
    ]);

    const normalized: CollectionData = {
      serviceItems: serviceResult.docs.map((d) => normalizeServiceItem(d as unknown as Record<string, unknown>)),
      blogPosts: blogResult.docs.map((d) => normalizeBlogPost(d as unknown as Record<string, unknown>)),
      testimonials: testimonialResult.docs.map((d) => normalizeTestimonial(d as unknown as Record<string, unknown>)),
    };

    return draft ? normalized : setCache(collectionDataCache, normalized);
  } catch {
    if (draft) return emptyData;
    markPayloadFailure();
    return setCache(collectionDataCache, emptyData, 10_000);
  }
});

export const getServiceItemBySlug = cache(async function getServiceItemBySlug(
  slug: string,
  options: CmsReadOptions = {},
): Promise<ServiceItem | null> {
  const draft = isDraftRead(options);
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, '');
  if (!draft) {
    const cached = getMapCache(serviceItemCache, normalizedSlug);
    if (cached !== undefined) return cached;
    if (shouldSkipPayload()) return setMapCache(serviceItemCache, normalizedSlug, null, 10_000);
  }

  try {
    const payload = await getPayload();
    const result = await withPayloadTimeout(
      payload.find({
        collection: 'service-items',
        where: {
          slug: { equals: normalizedSlug },
          ...(draft ? {} : { workflowStatus: { equals: 'published' } }),
        },
        limit: 1,
        depth: 1,
        ...(draft ? { draft: true } : {}),
      }),
      `find:service-items:${normalizedSlug}`,
    );
    const doc = result.docs[0];
    if (!doc) return draft ? null : setMapCache(serviceItemCache, normalizedSlug, null);

    const normalized = normalizeServiceItem(doc as unknown as Record<string, unknown>);
    return draft ? normalized : setMapCache(serviceItemCache, normalizedSlug, normalized);
  } catch {
    if (draft) return null;
    markPayloadFailure();
    return setMapCache(serviceItemCache, normalizedSlug, null, 10_000);
  }
});

export const getSitemapSlugs = cache(async function getSitemapSlugs(): Promise<SitemapQueryResult> {
  const cached = getFromCache(sitemapCache.entry);
  if (cached !== undefined) return cached;
  if (shouldSkipPayload()) {
    const fallback = {
      sitePages: DEFAULT_SITE_PAGE_SLUGS.map((slug) => ({ slug, includeInSitemap: true })),
      serviceItems: [],
    };
    return setCache(sitemapCache, fallback, 10_000);
  }

  try {
    const payload = await getPayload();
    const [pages, services] = await Promise.all([
      withPayloadTimeout(
        payload.find({ collection: 'site-pages', where: { isActive: { equals: true }, workflowStatus: { equals: 'published' } }, limit: 500 }),
        'find:site-pages:sitemap',
      ),
      withPayloadTimeout(
        payload.find({ collection: 'service-items', where: { workflowStatus: { equals: 'published' } }, limit: 500 }),
        'find:service-items:sitemap',
      ),
    ]);

    const mapDoc = (d: Record<string, unknown>) => ({
      slug: d.slug as string | undefined,
      includeInSitemap: (d.seo as Record<string, unknown> | undefined)?.includeInSitemap as boolean | undefined ?? true,
      updatedAt: d.updatedAt as string | undefined,
    });

    return setCache(sitemapCache, {
      sitePages: pages.docs.map((d) => mapDoc(d as unknown as Record<string, unknown>)),
      serviceItems: services.docs.map((d) => mapDoc(d as unknown as Record<string, unknown>)),
    });
  } catch {
    markPayloadFailure();
    const fallback = {
      sitePages: DEFAULT_SITE_PAGE_SLUGS.map((slug) => ({ slug, includeInSitemap: true })),
      serviceItems: [],
    };
    return setCache(sitemapCache, fallback, 10_000);
  }
});

export const getRedirectRules = cache(async function getRedirectRules(): Promise<RedirectRule[]> {
  const cached = getFromCache(redirectRulesCache.entry);
  if (cached !== undefined) return cached;
  if (shouldSkipPayload()) return setCache(redirectRulesCache, [], 10_000);

  try {
    const payload = await getPayload();
    const result = await withPayloadTimeout(
      payload.find({
        collection: 'redirect-rules',
        where: { enabled: { equals: true } },
        limit: 500,
      }),
      'find:redirect-rules',
    );
    return setCache(
      redirectRulesCache,
      result.docs.map((d) => {
        const doc = d as unknown as Record<string, unknown>;
        return {
          fromPath: doc.fromPath as string | undefined,
          toPath: doc.toPath as string | undefined,
          isPermanent: doc.isPermanent as boolean | undefined,
          enabled: doc.enabled as boolean | undefined,
        };
      }),
    );
  } catch {
    markPayloadFailure();
    return setCache(redirectRulesCache, [], 10_000);
  }
});
