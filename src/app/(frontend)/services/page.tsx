import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import { resolveSiteName } from '@/lib/site-config';
import { buildSitePageMetadata } from '@/lib/page-metadata';
import { getSitePageBySlug, getSiteSettings } from '@/payload/cms';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const cmsReadOptions = await getCmsReadOptions();
  const [sitePage, settings] = await Promise.all([
    getSitePageBySlug('services', cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);
  const siteName = resolveSiteName(settings);
  return buildSitePageMetadata({
    slug: 'services',
    page: sitePage,
    settings,
    fallbackTitle: 'Solutions | Plenor.ai',
    fallbackDescription:
      `${siteName} organises its offer around structured solutions, CMS implementation, and framework-led delivery.`,
  });
}

export default async function ServicesPage() {
  redirect('/solutions');
}
