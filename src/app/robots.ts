import { MetadataRoute } from 'next';
import { getSiteSettings } from '@/payload/cms';
import { resolveSiteUrl } from '@/lib/site-config';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();
  const siteUrl = resolveSiteUrl(settings);

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/studio/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
