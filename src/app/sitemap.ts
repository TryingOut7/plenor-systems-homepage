import { MetadataRoute } from 'next';
import {
  ABOUT_CATEGORIES,
  LEARNING_CATEGORIES,
  SPOTLIGHT_CATEGORIES,
} from '@/domain/org-site/constants';
import { resolveCommunityBasePath } from '@/lib/community-site-config';
import { buildCommunityHref } from '@/lib/org-site-helpers';
import { getSitemapSlugs, getSiteSettings } from '@/payload/cms';
import { getPayload } from '@/payload/client';
import { resolveSiteUrl } from '@/lib/site-config';

export const revalidate = 60;

type CommunityDoc = {
  slug?: string | null;
  category?: string | null;
  updatedAt?: string | null;
};

type SponsorsGlobalDoc = {
  pageTitle?: string | null;
  updatedAt?: string | null;
  _status?: 'draft' | 'published' | null;
};

function readLastModified(value: unknown, fallback: Date): Date {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? fallback : parsed;
}

function readTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function getCommunityRoutes(baseUrl: string, lastModified: Date): Promise<MetadataRoute.Sitemap> {
  const basePath = resolveCommunityBasePath();
  if (!basePath) return [];

  try {
    const payload = await getPayload();
    const publishedWhere = { _status: { equals: 'published' } } as const;

    const [events, spotlight, learning, aboutProfiles, sponsors] = await Promise.all([
      payload.find({
        collection: 'org-events',
        where: publishedWhere,
        depth: 0,
        limit: 1000,
        sort: '-updatedAt',
      }),
      payload.find({
        collection: 'org-spotlight',
        where: publishedWhere,
        depth: 0,
        limit: 1000,
        sort: '-updatedAt',
      }),
      payload.find({
        collection: 'org-learning',
        where: publishedWhere,
        depth: 0,
        limit: 1000,
        sort: '-updatedAt',
      }),
      payload.find({
        collection: 'org-about-profiles',
        where: publishedWhere,
        depth: 0,
        limit: 1000,
        sort: '-updatedAt',
      }),
      payload.findGlobal({
        slug: 'org-sponsors',
        depth: 0,
      }) as Promise<SponsorsGlobalDoc | null>,
    ]);

    const routes: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}${buildCommunityHref(basePath)}`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}${buildCommunityHref(basePath, 'events')}`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      ...SPOTLIGHT_CATEGORIES.map((category) => ({
        url: `${baseUrl}${buildCommunityHref(basePath, `spotlight/${category}`)}`,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...LEARNING_CATEGORIES.map((category) => ({
        url: `${baseUrl}${buildCommunityHref(basePath, `learning/${category}`)}`,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...ABOUT_CATEGORIES.map((category) => ({
        url: `${baseUrl}${buildCommunityHref(basePath, `about/${category}`)}`,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    ];

    const sponsorsConfigured = readTrimmedString(sponsors?.pageTitle);
    const sponsorsPublished = sponsors?._status !== 'draft';
    if (sponsorsConfigured && sponsorsPublished) {
      routes.push({
        url: `${baseUrl}${buildCommunityHref(basePath, 'sponsors')}`,
        lastModified: readLastModified(sponsors?.updatedAt, lastModified),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }

    for (const doc of events.docs as CommunityDoc[]) {
      const slug = readTrimmedString(doc.slug);
      if (!slug) continue;
      routes.push({
        url: `${baseUrl}${buildCommunityHref(basePath, `events/${slug}`)}`,
        lastModified: readLastModified(doc.updatedAt, lastModified),
        changeFrequency: 'weekly',
        priority: 0.75,
      });
    }

    for (const doc of spotlight.docs as CommunityDoc[]) {
      const slug = readTrimmedString(doc.slug);
      const category = readTrimmedString(doc.category);
      if (!slug || !category || !SPOTLIGHT_CATEGORIES.includes(category as (typeof SPOTLIGHT_CATEGORIES)[number])) {
        continue;
      }
      routes.push({
        url: `${baseUrl}${buildCommunityHref(basePath, `spotlight/${category}/${slug}`)}`,
        lastModified: readLastModified(doc.updatedAt, lastModified),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }

    for (const doc of learning.docs as CommunityDoc[]) {
      const slug = readTrimmedString(doc.slug);
      const category = readTrimmedString(doc.category);
      if (!slug || !category || !LEARNING_CATEGORIES.includes(category as (typeof LEARNING_CATEGORIES)[number])) {
        continue;
      }
      routes.push({
        url: `${baseUrl}${buildCommunityHref(basePath, `learning/${category}/${slug}`)}`,
        lastModified: readLastModified(doc.updatedAt, lastModified),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }

    for (const doc of aboutProfiles.docs as CommunityDoc[]) {
      const slug = readTrimmedString(doc.slug);
      const category = readTrimmedString(doc.category);
      if (!slug || !category || !ABOUT_CATEGORIES.includes(category as (typeof ABOUT_CATEGORIES)[number])) {
        continue;
      }
      routes.push({
        url: `${baseUrl}${buildCommunityHref(basePath, `about/${category}/${slug}`)}`,
        lastModified: readLastModified(doc.updatedAt, lastModified),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }

    return routes;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, cms] = await Promise.all([getSiteSettings(), getSitemapSlugs()]);
  const base = resolveSiteUrl(settings);
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${base}/services`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/pricing`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/about`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = [
    ...cms.sitePages
      .filter((page) => page.includeInSitemap !== false && page.slug)
      .map((page) => ({
        url: `${base}/${page.slug}`,
        lastModified: page.updatedAt ? new Date(page.updatedAt) : lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    ...cms.serviceItems
      .filter((service) => service.includeInSitemap !== false && service.slug)
      .map((service) => ({
        url: `${base}/services/${service.slug}`,
        lastModified: service.updatedAt ? new Date(service.updatedAt) : lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      })),
  ];

  const communityRoutes = await getCommunityRoutes(base, lastModified);

  const seen = new Set<string>();
  return [...staticRoutes, ...dynamicRoutes, ...communityRoutes].filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
