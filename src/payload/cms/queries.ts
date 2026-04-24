import { cache } from 'react';
import { getPayload } from '../client.ts';
import {
  aboutProfileCache,
  aboutProfilesCache,
  blogPostCache,
  collectionDataCache,
  frameworkEntriesCache,
  frameworkEntryCache,
  getFromCache,
  getMapCache,
  insightEntriesCache,
  insightEntryCache,
  markPayloadFailure,
  pageCache,
  redirectRulesCache,
  serviceItemCache,
  setCache,
  setMapCache,
  shouldSkipPayload,
  sitemapCache,
  siteSettingsCache,
  solutionEntriesCache,
  solutionEntryCache,
  uiSettingsCache,
} from './cache.ts';
import {
  cloneDefaultSitePage,
  DEFAULT_SITE_PAGE_SLUGS,
  normalizeAboutProfile,
  normalizeBlogPost,
  normalizeFrameworkEntry,
  normalizeInsightEntry,
  normalizeLogo,
  normalizeSection,
  normalizeServiceItem,
  normalizeSolutionEntry,
  normalizeTeamMember,
  normalizeTestimonial,
  normalizeSeo,
} from './normalize.ts';
import type {
  AboutProfile,
  BlogPost,
  CmsReadOptions,
  CollectionData,
  FrameworkEntry,
  InsightEntry,
  RedirectRule,
  ServiceItem,
  SitemapQueryResult,
  SitePage,
  SiteSettings,
  SolutionEntry,
  UISettings,
} from './types.ts';
import { resolveFormEmbedAliasesInSitePage } from './resolveFormAliases.ts';
import { buildPublicVisibilityWhere } from '../access/publicVisibility.ts';
import { sortGovernedContent } from '@/lib/plenor-site';

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

function normalizeSlug(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}

function mapSitemapDoc(doc: Record<string, unknown>) {
  return {
    slug: doc.slug as string | undefined,
    includeInSitemap:
      (doc.seo as Record<string, unknown> | undefined)?.includeInSitemap as boolean | undefined ??
      true,
    updatedAt: doc.updatedAt as string | undefined,
  };
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

    const d = data as unknown as Record<string, unknown>;
    const normalized: SiteSettings = {
      siteName: d.siteName as string | undefined,
      brandTagline: d.brandTagline as string | undefined,
      siteUrl: d.siteUrl as string | undefined,
      contactEmail: d.contactEmail as string | undefined,
      logoImage: d.logoImage as SiteSettings['logoImage'],
      logoWidth: d.logoWidth as number | undefined,
      headerButtons: d.headerButtons as SiteSettings['headerButtons'],
      twitterHandle: d.twitterHandle as string | undefined,
      contentRouting: d.contentRouting as SiteSettings['contentRouting'],
      emailDefaults: d.emailDefaults as SiteSettings['emailDefaults'],
      corePresetContent: d.corePresetContent as SiteSettings['corePresetContent'],
      defaultSeo: normalizeSeo(d.defaultSeo),
      defaultMetaDescription: d.defaultMetaDescription as string | undefined,
      navigationLinks: d.navigationLinks as SiteSettings['navigationLinks'],
      announcementBanner: d.announcementBanner as SiteSettings['announcementBanner'],
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

    const d = data as unknown as Record<string, unknown>;
    const normalized: UISettings = {
      colors: d.colors as UISettings['colors'],
      typography: d.typography as UISettings['typography'],
      layout: d.layout as UISettings['layout'],
      buttons: d.buttons as UISettings['buttons'],
      emailPalette: d.emailPalette as UISettings['emailPalette'],
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
    if (cached !== undefined) return resolveFormEmbedAliasesInSitePage(cached);
    if (shouldSkipPayload()) {
      const fallback = cloneDefaultSitePage(normalizedSlug);
      const resolved = await resolveFormEmbedAliasesInSitePage(fallback);
      return setMapCache(pageCache, normalizedSlug, resolved, 10_000);
    }
  }

  try {
    const payload = await getPayload();
    const liveResult = await withPayloadTimeout(
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
    const doc = liveResult.docs[0] as unknown as Record<string, unknown> | undefined;

    if (!doc && draft) {
      const draftResult = await withPayloadTimeout(
        payload.find({
          collection: 'page-drafts',
          where: {
            targetSlug: { equals: normalizedSlug },
          },
          limit: 1,
          depth: 1,
          overrideAccess: true,
        }),
        `find:page-drafts:${normalizedSlug}`,
      );

      const draftDoc = draftResult.docs[0] as unknown as Record<string, unknown> | undefined;
      if (draftDoc) {
        const draftSections = Array.isArray(draftDoc.sections)
          ? draftDoc.sections.map(normalizeSection)
          : [];

        const draftPage: SitePage = {
          id: String(draftDoc.id),
          title: (draftDoc.title as string | undefined) || normalizedSlug,
          slug: normalizedSlug,
          presetKey: 'custom',
          presetContent: undefined,
          isActive: true,
          hideNavbar: undefined,
          hideFooter: undefined,
          pageBackgroundColor: undefined,
          customHeadScripts: undefined,
          seo: normalizeSeo(draftDoc.seo),
          sections: draftSections,
        };
        return resolveFormEmbedAliasesInSitePage(draftPage);
      }
    }

    if (!doc) {
      const fallbackPage = cloneDefaultSitePage(normalizedSlug);
      const resolvedFallback = await resolveFormEmbedAliasesInSitePage(fallbackPage);
      return draft ? resolvedFallback : setMapCache(pageCache, normalizedSlug, resolvedFallback);
    }

    const d = doc;
    const fallback = cloneDefaultSitePage(normalizedSlug);
    const sections = Array.isArray(d.sections) ? d.sections.map(normalizeSection) : [];
    const resolvedSections = sections.length > 0 ? sections : (fallback?.sections ?? []);

    const normalized: SitePage = {
      id: String(d.id),
      title: (d.title as string | undefined) || fallback?.title,
      slug: (d.slug as string | undefined) || fallback?.slug,
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

    const resolvedPage = await resolveFormEmbedAliasesInSitePage(normalized);
    return draft ? resolvedPage : setMapCache(pageCache, normalizedSlug, resolvedPage);
  } catch {
    markPayloadFailure();
    const fallbackPage = cloneDefaultSitePage(normalizedSlug);
    const resolvedFallback = await resolveFormEmbedAliasesInSitePage(fallbackPage);
    
    // In draft mode, avoid caching the error fallback to prevent long-livng pollution 
    // of the cache when the DB momentarily dips during a preview session.
    if (draft) return resolvedFallback;
    return setMapCache(pageCache, normalizedSlug, resolvedFallback, 10_000);
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
  const emptyData: CollectionData = {
    serviceItems: [],
    blogPosts: [],
    testimonials: [],
    teamMembers: [],
    logos: [],
  };
  if (!draft && shouldSkipPayload()) return setCache(collectionDataCache, emptyData, 10_000);

  try {
    const payload = await getPayload();
    const publishedFilter = buildPublicVisibilityWhere({
      allowMissingWorkflowStatus: true,
    });
    const [serviceResult, blogResult, testimonialResult, teamResult, logosResult] =
      await Promise.all([
      withPayloadTimeout(
        payload.find({
          collection: 'solution-entries',
          ...(draft ? {} : { where: publishedFilter }),
          sort: '-publishedAt',
          limit: 100,
          depth: 1,
          ...(draft ? { draft: true } : {}),
        }),
        'find:solution-entries:legacy-service-items',
      ),
      withPayloadTimeout(
        payload.find({
          collection: 'insight-entries',
          ...(draft ? {} : { where: publishedFilter }),
          sort: '-publishedAt',
          limit: 100,
          depth: 1,
          ...(draft ? { draft: true } : {}),
        }),
        'find:insight-entries:legacy-blog-posts',
      ),
      withPayloadTimeout(
        payload.find({
          collection: 'testimonials',
          ...(draft ? {} : { where: publishedFilter }),
          // Sort by updatedAt: Testimonials no longer have a publishedAt field.
          sort: '-updatedAt',
          limit: 100,
          depth: 1,
          ...(draft ? { draft: true } : {}),
        }),
        'find:testimonials',
      ),
      withPayloadTimeout(
        payload.find({
          collection: 'team-members',
          ...(draft ? {} : { where: publishedFilter }),
          sort: 'order',
          limit: 200,
          depth: 1,
          ...(draft ? { draft: true } : {}),
        }),
        'find:team-members',
      ),
      withPayloadTimeout(
        payload.find({
          collection: 'logos',
          ...(draft ? {} : { where: publishedFilter }),
          sort: 'order',
          limit: 200,
          depth: 1,
          ...(draft ? { draft: true } : {}),
        }),
        'find:logos',
      ),
    ]);

    const normalized: CollectionData = {
      serviceItems: serviceResult.docs.map((d) => normalizeServiceItem(d as unknown as Record<string, unknown>)),
      blogPosts: blogResult.docs.map((d) => normalizeBlogPost(d as unknown as Record<string, unknown>)),
      testimonials: testimonialResult.docs.map((d) => normalizeTestimonial(d as unknown as Record<string, unknown>)),
      teamMembers: teamResult.docs.map((d) =>
        normalizeTeamMember(d as unknown as Record<string, unknown>),
      ),
      logos: logosResult.docs.map((d) => normalizeLogo(d as unknown as Record<string, unknown>)),
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
        collection: 'solution-entries',
        where: {
          ...(draft
            ? { slug: { equals: normalizedSlug } }
            : {
                and: [
                  { slug: { equals: normalizedSlug } },
                  buildPublicVisibilityWhere({
                    allowMissingWorkflowStatus: true,
                  }),
                ],
              }),
        },
        limit: 1,
        depth: 1,
        ...(draft ? { draft: true } : {}),
      }),
      `find:solution-entries:legacy-service-item:${normalizedSlug}`,
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

export const getBlogPostBySlug = cache(async function getBlogPostBySlug(
  slug: string,
  options: CmsReadOptions = {},
): Promise<BlogPost | null> {
  const draft = isDraftRead(options);
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, '');
  if (!draft) {
    const cached = getMapCache(blogPostCache, normalizedSlug);
    if (cached !== undefined) return cached;
    if (shouldSkipPayload()) return setMapCache(blogPostCache, normalizedSlug, null, 10_000);
  }

  try {
    const payload = await getPayload();
    const result = await withPayloadTimeout(
      payload.find({
        collection: 'insight-entries',
        where: {
          ...(draft
            ? { slug: { equals: normalizedSlug } }
            : {
                and: [
                  { slug: { equals: normalizedSlug } },
                  buildPublicVisibilityWhere({
                    allowMissingWorkflowStatus: true,
                  }),
                ],
              }),
        },
        limit: 1,
        depth: 1,
        ...(draft ? { draft: true } : {}),
      }),
      `find:insight-entries:legacy-blog-post:${normalizedSlug}`,
    );
    const doc = result.docs[0];
    if (!doc) return draft ? null : setMapCache(blogPostCache, normalizedSlug, null);

    const normalized = normalizeBlogPost(doc as unknown as Record<string, unknown>);
    return draft ? normalized : setMapCache(blogPostCache, normalizedSlug, normalized);
  } catch {
    if (draft) return null;
    markPayloadFailure();
    return setMapCache(blogPostCache, normalizedSlug, null, 10_000);
  }
});

export const getFrameworkEntries = cache(async function getFrameworkEntries(
  options: CmsReadOptions = {},
): Promise<FrameworkEntry[]> {
  const draft = isDraftRead(options);
  if (!draft) {
    const cached = getFromCache(frameworkEntriesCache.entry);
    if (cached !== undefined) return cached;
    if (shouldSkipPayload()) return setCache(frameworkEntriesCache, [], 10_000);
  }

  try {
    const payload = await getPayload();
    const result = await withPayloadTimeout(
      payload.find({
        collection: 'framework-entries',
        ...(draft ? {} : { where: buildPublicVisibilityWhere({ allowMissingWorkflowStatus: true }) }),
        sort: '-publishedAt',
        limit: 200,
        depth: 1,
        ...(draft ? { draft: true } : {}),
      }),
      'find:framework-entries',
    );

    const normalized = sortGovernedContent(
      result.docs.map((doc) => normalizeFrameworkEntry(doc as unknown as Record<string, unknown>)),
    );

    return draft ? normalized : setCache(frameworkEntriesCache, normalized);
  } catch {
    if (draft) return [];
    markPayloadFailure();
    return setCache(frameworkEntriesCache, [], 10_000);
  }
});

export const getFrameworkEntryBySlug = cache(async function getFrameworkEntryBySlug(
  slug: string,
  options: CmsReadOptions = {},
): Promise<FrameworkEntry | null> {
  const draft = isDraftRead(options);
  const normalizedSlug = normalizeSlug(slug);

  if (!draft) {
    const cached = getMapCache(frameworkEntryCache, normalizedSlug);
    if (cached !== undefined) return cached;
    if (shouldSkipPayload()) return setMapCache(frameworkEntryCache, normalizedSlug, null, 10_000);
  }

  try {
    const payload = await getPayload();
    const result = await withPayloadTimeout(
      payload.find({
        collection: 'framework-entries',
        where: draft
          ? { slug: { equals: normalizedSlug } }
          : {
              and: [
                { slug: { equals: normalizedSlug } },
                buildPublicVisibilityWhere({ allowMissingWorkflowStatus: true }),
              ],
            },
        limit: 1,
        depth: 1,
        ...(draft ? { draft: true } : {}),
      }),
      `find:framework-entries:${normalizedSlug}`,
    );

    const doc = result.docs[0];
    if (!doc) return draft ? null : setMapCache(frameworkEntryCache, normalizedSlug, null);

    const normalized = normalizeFrameworkEntry(doc as unknown as Record<string, unknown>);
    return draft ? normalized : setMapCache(frameworkEntryCache, normalizedSlug, normalized);
  } catch {
    if (draft) return null;
    markPayloadFailure();
    return setMapCache(frameworkEntryCache, normalizedSlug, null, 10_000);
  }
});

export const getSolutionEntries = cache(async function getSolutionEntries(
  options: CmsReadOptions = {},
): Promise<SolutionEntry[]> {
  const draft = isDraftRead(options);
  if (!draft) {
    const cached = getFromCache(solutionEntriesCache.entry);
    if (cached !== undefined) return cached;
    if (shouldSkipPayload()) return setCache(solutionEntriesCache, [], 10_000);
  }

  try {
    const payload = await getPayload();
    const result = await withPayloadTimeout(
      payload.find({
        collection: 'solution-entries',
        ...(draft ? {} : { where: buildPublicVisibilityWhere({ allowMissingWorkflowStatus: true }) }),
        sort: '-publishedAt',
        limit: 200,
        depth: 1,
        ...(draft ? { draft: true } : {}),
      }),
      'find:solution-entries',
    );

    const normalized = sortGovernedContent(
      result.docs.map((doc) => normalizeSolutionEntry(doc as unknown as Record<string, unknown>)),
    );

    return draft ? normalized : setCache(solutionEntriesCache, normalized);
  } catch {
    if (draft) return [];
    markPayloadFailure();
    return setCache(solutionEntriesCache, [], 10_000);
  }
});

export const getSolutionEntryBySlug = cache(async function getSolutionEntryBySlug(
  slug: string,
  options: CmsReadOptions = {},
): Promise<SolutionEntry | null> {
  const draft = isDraftRead(options);
  const normalizedSlug = normalizeSlug(slug);

  if (!draft) {
    const cached = getMapCache(solutionEntryCache, normalizedSlug);
    if (cached !== undefined) return cached;
    if (shouldSkipPayload()) return setMapCache(solutionEntryCache, normalizedSlug, null, 10_000);
  }

  try {
    const payload = await getPayload();
    const result = await withPayloadTimeout(
      payload.find({
        collection: 'solution-entries',
        where: draft
          ? { slug: { equals: normalizedSlug } }
          : {
              and: [
                { slug: { equals: normalizedSlug } },
                buildPublicVisibilityWhere({ allowMissingWorkflowStatus: true }),
              ],
            },
        limit: 1,
        depth: 1,
        ...(draft ? { draft: true } : {}),
      }),
      `find:solution-entries:${normalizedSlug}`,
    );

    const doc = result.docs[0];
    if (!doc) return draft ? null : setMapCache(solutionEntryCache, normalizedSlug, null);

    const normalized = normalizeSolutionEntry(doc as unknown as Record<string, unknown>);
    return draft ? normalized : setMapCache(solutionEntryCache, normalizedSlug, normalized);
  } catch {
    if (draft) return null;
    markPayloadFailure();
    return setMapCache(solutionEntryCache, normalizedSlug, null, 10_000);
  }
});

export const getInsightEntries = cache(async function getInsightEntries(
  options: CmsReadOptions = {},
): Promise<InsightEntry[]> {
  const draft = isDraftRead(options);
  if (!draft) {
    const cached = getFromCache(insightEntriesCache.entry);
    if (cached !== undefined) return cached;
    if (shouldSkipPayload()) return setCache(insightEntriesCache, [], 10_000);
  }

  try {
    const payload = await getPayload();
    const result = await withPayloadTimeout(
      payload.find({
        collection: 'insight-entries',
        ...(draft ? {} : { where: buildPublicVisibilityWhere({ allowMissingWorkflowStatus: true }) }),
        sort: '-publishedAt',
        limit: 200,
        depth: 1,
        ...(draft ? { draft: true } : {}),
      }),
      'find:insight-entries',
    );

    const normalized = sortGovernedContent(
      result.docs.map((doc) => normalizeInsightEntry(doc as unknown as Record<string, unknown>)),
    );

    return draft ? normalized : setCache(insightEntriesCache, normalized);
  } catch {
    if (draft) return [];
    markPayloadFailure();
    return setCache(insightEntriesCache, [], 10_000);
  }
});

export const getInsightEntryBySlug = cache(async function getInsightEntryBySlug(
  slug: string,
  options: CmsReadOptions = {},
): Promise<InsightEntry | null> {
  const draft = isDraftRead(options);
  const normalizedSlug = normalizeSlug(slug);

  if (!draft) {
    const cached = getMapCache(insightEntryCache, normalizedSlug);
    if (cached !== undefined) return cached;
    if (shouldSkipPayload()) return setMapCache(insightEntryCache, normalizedSlug, null, 10_000);
  }

  try {
    const payload = await getPayload();
    const result = await withPayloadTimeout(
      payload.find({
        collection: 'insight-entries',
        where: draft
          ? { slug: { equals: normalizedSlug } }
          : {
              and: [
                { slug: { equals: normalizedSlug } },
                buildPublicVisibilityWhere({ allowMissingWorkflowStatus: true }),
              ],
            },
        limit: 1,
        depth: 1,
        ...(draft ? { draft: true } : {}),
      }),
      `find:insight-entries:${normalizedSlug}`,
    );

    const doc = result.docs[0];
    if (!doc) return draft ? null : setMapCache(insightEntryCache, normalizedSlug, null);

    const normalized = normalizeInsightEntry(doc as unknown as Record<string, unknown>);
    return draft ? normalized : setMapCache(insightEntryCache, normalizedSlug, normalized);
  } catch {
    if (draft) return null;
    markPayloadFailure();
    return setMapCache(insightEntryCache, normalizedSlug, null, 10_000);
  }
});

export const getAboutProfiles = cache(async function getAboutProfiles(
  options: CmsReadOptions = {},
): Promise<AboutProfile[]> {
  const draft = isDraftRead(options);
  if (!draft) {
    const cached = getFromCache(aboutProfilesCache.entry);
    if (cached !== undefined) return cached;
    if (shouldSkipPayload()) return setCache(aboutProfilesCache, [], 10_000);
  }

  try {
    const payload = await getPayload();
    const result = await withPayloadTimeout(
      payload.find({
        collection: 'org-about-profiles',
        ...(draft ? {} : { where: buildPublicVisibilityWhere({ allowMissingWorkflowStatus: true }) }),
        sort: 'displayOrder',
        limit: 200,
        depth: 1,
        ...(draft ? { draft: true } : {}),
      }),
      'find:org-about-profiles',
    );

    const normalized = result.docs
      .map((doc) => normalizeAboutProfile(doc as unknown as Record<string, unknown>))
      .sort((left, right) => {
        const leftOrder =
          typeof left.displayOrder === 'number' ? left.displayOrder : Number.POSITIVE_INFINITY;
        const rightOrder =
          typeof right.displayOrder === 'number' ? right.displayOrder : Number.POSITIVE_INFINITY;
        if (leftOrder !== rightOrder) return leftOrder - rightOrder;
        return (left.name || '').localeCompare(right.name || '');
      });

    return draft ? normalized : setCache(aboutProfilesCache, normalized);
  } catch {
    if (draft) return [];
    markPayloadFailure();
    return setCache(aboutProfilesCache, [], 10_000);
  }
});

export const getAboutProfileBySlug = cache(async function getAboutProfileBySlug(
  slug: string,
  options: CmsReadOptions = {},
): Promise<AboutProfile | null> {
  const draft = isDraftRead(options);
  const normalizedSlug = normalizeSlug(slug);

  if (!draft) {
    const cached = getMapCache(aboutProfileCache, normalizedSlug);
    if (cached !== undefined) return cached;
    if (shouldSkipPayload()) return setMapCache(aboutProfileCache, normalizedSlug, null, 10_000);
  }

  try {
    const payload = await getPayload();
    const result = await withPayloadTimeout(
      payload.find({
        collection: 'org-about-profiles',
        where: draft
          ? { slug: { equals: normalizedSlug } }
          : {
              and: [
                { slug: { equals: normalizedSlug } },
                buildPublicVisibilityWhere({ allowMissingWorkflowStatus: true }),
              ],
            },
        limit: 1,
        depth: 1,
        ...(draft ? { draft: true } : {}),
      }),
      `find:org-about-profiles:${normalizedSlug}`,
    );

    const doc = result.docs[0];
    if (!doc) return draft ? null : setMapCache(aboutProfileCache, normalizedSlug, null);

    const normalized = normalizeAboutProfile(doc as unknown as Record<string, unknown>);
    return draft ? normalized : setMapCache(aboutProfileCache, normalizedSlug, normalized);
  } catch {
    if (draft) return null;
    markPayloadFailure();
    return setMapCache(aboutProfileCache, normalizedSlug, null, 10_000);
  }
});

export const getSitemapSlugs = cache(async function getSitemapSlugs(): Promise<SitemapQueryResult> {
  const cached = getFromCache(sitemapCache.entry);
  if (cached !== undefined) return cached;
  if (shouldSkipPayload()) {
    const fallback = {
      sitePages: DEFAULT_SITE_PAGE_SLUGS.map((slug) => ({ slug, includeInSitemap: true })),
      serviceItems: [],
      frameworkEntries: [],
      solutionEntries: [],
      insightEntries: [],
      aboutProfiles: [],
    };
    return setCache(sitemapCache, fallback, 10_000);
  }

  try {
    const payload = await getPayload();
    const [pages, services, frameworkEntries, solutionEntries, insightEntries, aboutProfiles] =
      await Promise.all([
      withPayloadTimeout(
        payload.find({
          collection: 'site-pages',
          where: { isActive: { equals: true }, workflowStatus: { equals: 'published' } },
          limit: 500,
        }),
        'find:site-pages:sitemap',
      ),
      withPayloadTimeout(
        payload.find({
          collection: 'solution-entries',
          where: buildPublicVisibilityWhere({ allowMissingWorkflowStatus: true }),
          limit: 500,
        }),
        'find:solution-entries:legacy-service-items:sitemap',
      ),
      withPayloadTimeout(
        payload.find({
          collection: 'framework-entries',
          where: buildPublicVisibilityWhere({ allowMissingWorkflowStatus: true }),
          limit: 500,
        }),
        'find:framework-entries:sitemap',
      ),
      withPayloadTimeout(
        payload.find({
          collection: 'solution-entries',
          where: buildPublicVisibilityWhere({ allowMissingWorkflowStatus: true }),
          limit: 500,
        }),
        'find:solution-entries:sitemap',
      ),
      withPayloadTimeout(
        payload.find({
          collection: 'insight-entries',
          where: buildPublicVisibilityWhere({ allowMissingWorkflowStatus: true }),
          limit: 500,
        }),
        'find:insight-entries:sitemap',
      ),
      withPayloadTimeout(
        payload.find({
          collection: 'org-about-profiles',
          where: buildPublicVisibilityWhere({ allowMissingWorkflowStatus: true }),
          limit: 500,
        }),
        'find:org-about-profiles:sitemap',
      ),
    ]);

    return setCache(sitemapCache, {
      sitePages: pages.docs.map((d) => mapSitemapDoc(d as unknown as Record<string, unknown>)),
      serviceItems: services.docs.map((d) =>
        mapSitemapDoc(d as unknown as Record<string, unknown>),
      ),
      frameworkEntries: frameworkEntries.docs.map((d) =>
        mapSitemapDoc(d as unknown as Record<string, unknown>),
      ),
      solutionEntries: solutionEntries.docs.map((d) =>
        mapSitemapDoc(d as unknown as Record<string, unknown>),
      ),
      insightEntries: insightEntries.docs.map((d) =>
        mapSitemapDoc(d as unknown as Record<string, unknown>),
      ),
      aboutProfiles: aboutProfiles.docs.map((d) =>
        mapSitemapDoc(d as unknown as Record<string, unknown>),
      ),
    });
  } catch {
    markPayloadFailure();
    const fallback = {
      sitePages: DEFAULT_SITE_PAGE_SLUGS.map((slug) => ({ slug, includeInSitemap: true })),
      serviceItems: [],
      frameworkEntries: [],
      solutionEntries: [],
      insightEntries: [],
      aboutProfiles: [],
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
        overrideAccess: true,
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
