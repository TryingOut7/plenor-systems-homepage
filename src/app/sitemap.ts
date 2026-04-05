import { MetadataRoute } from 'next';
import { getSitemapSlugs, getSiteSettings } from '@/payload/cms';
import { resolveSiteUrl } from '@/lib/site-config';

export const revalidate = 60;

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

  const seen = new Set<string>();
  return [...staticRoutes, ...dynamicRoutes].filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
