import { MetadataRoute } from 'next';
import { getSitemapSlugs, getSiteSettings } from '@/payload/cms';
import { resolveSiteUrl } from '@/lib/site-config';

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, cms] = await Promise.all([getSiteSettings(), getSitemapSlugs()]);
  const base = resolveSiteUrl(settings);
  const lastModified = new Date();
  const sitePages = cms.sitePages ?? [];
  const frameworkEntries = cms.frameworkEntries ?? [];
  const solutionEntries = cms.solutionEntries ?? [];
  const insightEntries = cms.insightEntries ?? [];
  const aboutProfiles = cms.aboutProfiles ?? [];

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/framework`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/solutions`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/insights`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/about`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = [
    ...sitePages
      .filter((page) => page.includeInSitemap !== false && page.slug)
      .map((page) => ({
        url: `${base}/${page.slug}`,
        lastModified: page.updatedAt ? new Date(page.updatedAt) : lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    ...frameworkEntries
      .filter((entry) => entry.includeInSitemap !== false && entry.slug)
      .map((entry) => ({
        url: `${base}/framework/${entry.slug}`,
        lastModified: entry.updatedAt ? new Date(entry.updatedAt) : lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      })),
    ...solutionEntries
      .filter((entry) => entry.includeInSitemap !== false && entry.slug)
      .map((entry) => ({
        url: `${base}/solutions/${entry.slug}`,
        lastModified: entry.updatedAt ? new Date(entry.updatedAt) : lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      })),
    ...insightEntries
      .filter((entry) => entry.includeInSitemap !== false && entry.slug)
      .map((entry) => ({
        url: `${base}/insights/${entry.slug}`,
        lastModified: entry.updatedAt ? new Date(entry.updatedAt) : lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ...aboutProfiles
      .filter((entry) => entry.includeInSitemap !== false && entry.slug)
      .map((entry) => ({
        url: `${base}/about/${entry.slug}`,
        lastModified: entry.updatedAt ? new Date(entry.updatedAt) : lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
  ];

  const seen = new Set<string>();
  return [...staticRoutes, ...dynamicRoutes].filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
