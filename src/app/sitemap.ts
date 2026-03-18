import { MetadataRoute } from 'next';
import { getSitemapSlugs, getSiteSettings } from '@/payload/cms';

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, cms] = await Promise.all([getSiteSettings(), getSitemapSlugs()]);
  const base = (settings?.siteUrl || 'https://plenor.ai').replace(/\/$/, '');
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${base}/blog`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/services`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/testimonials`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
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
        lastModified: page._updatedAt ? new Date(page._updatedAt) : lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    ...cms.blogPosts
      .filter((post) => post.includeInSitemap !== false && post.slug)
      .map((post) => ({
        url: `${base}/blog/${post.slug}`,
        lastModified: post._updatedAt ? new Date(post._updatedAt) : lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    ...cms.serviceItems
      .filter((service) => service.includeInSitemap !== false && service.slug)
      .map((service) => ({
        url: `${base}/services/${service.slug}`,
        lastModified: service._updatedAt ? new Date(service._updatedAt) : lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      })),
    ...cms.testimonials
      .filter((testimonial) => testimonial.includeInSitemap !== false && testimonial.slug)
      .map((testimonial) => ({
        url: `${base}/testimonials/${testimonial.slug}`,
        lastModified: testimonial._updatedAt ? new Date(testimonial._updatedAt) : lastModified,
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
