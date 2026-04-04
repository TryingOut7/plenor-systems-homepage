import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageChromeOverrides from '@/components/PageChromeOverrides';
import CmsPreviewDiffBanner from '@/components/CmsPreviewDiffBanner';
import UniversalSections from '@/components/cms/UniversalSections';
import { getCollectionData, getSitePageBySlug, getSiteSettings } from '@/payload/cms';
import { buildSitePageMetadata } from '@/lib/page-metadata';
import { resolveSiteName } from '@/lib/site-config';
import { getCmsReadOptions } from '@/lib/cms-read-options';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const cmsReadOptions = await getCmsReadOptions();
  const [sitePage, settings] = await Promise.all([
    getSitePageBySlug('home', cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);
  const siteName = resolveSiteName(settings);
  return buildSitePageMetadata({
    slug: '',
    page: sitePage,
    settings,
    fallbackTitle: `${siteName} — Testing & QA and Launch & Go-to-Market Framework`,
    fallbackDescription:
      `${siteName} brings structure to the two most failure-prone stages of product development: Testing & QA and Launch & Go-to-Market.`,
  });
}

export default async function HomePage() {
  const cmsReadOptions = await getCmsReadOptions();
  const [sitePage, siteSettings, collectionData] = await Promise.all([
    getSitePageBySlug('home', cmsReadOptions),
    getSiteSettings(cmsReadOptions),
    getCollectionData(cmsReadOptions),
  ]);

  if (!sitePage || !Array.isArray(sitePage.sections) || sitePage.sections.length === 0) {
    notFound();
  }

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

