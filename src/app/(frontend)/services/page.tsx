import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CmsPreviewDiffBanner from '@/components/CmsPreviewDiffBanner';
import PageChromeOverrides from '@/components/PageChromeOverrides';
import UniversalSections from '@/components/cms/UniversalSections';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import { buildSitePageMetadata } from '@/lib/page-metadata';
import { resolveSiteName } from '@/lib/site-config';
import { getCollectionData, getSitePageBySlug, getSiteSettings } from '@/payload/cms';

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
    fallbackTitle: 'Services — Testing & QA and Launch & Go-to-Market',
    fallbackDescription:
      `${siteName} covers two framework stages: Testing & QA and Launch & Go-to-Market. Learn what each stage covers, who it helps, and why a structured framework matters.`,
  });
}

export default async function ServicesPage() {
  const cmsReadOptions = await getCmsReadOptions();
  const [sitePage, siteSettings] = await Promise.all([
    getSitePageBySlug('services', cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);

  if (!sitePage || !Array.isArray(sitePage.sections) || sitePage.sections.length === 0) {
    notFound();
  }

  const collectionData = await getCollectionData(cmsReadOptions);
  return (
    <>
      <PageChromeOverrides page={sitePage} />
      <CmsPreviewDiffBanner summary={(sitePage as Record<string, unknown>).previewDiffSummary} />
      <UniversalSections
        sections={sitePage.sections}
        collections={collectionData}
        guideFormLabels={siteSettings?.guideForm}
        inquiryFormLabels={siteSettings?.inquiryForm}
      />
    </>
  );
}
