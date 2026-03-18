import { MetadataRoute } from 'next';
import { getSiteSettings } from '@/payload/cms';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();
  const siteUrl = (settings?.siteUrl || 'https://plenor.ai').replace(/\/$/, '');

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
