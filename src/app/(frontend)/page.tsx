import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageChromeOverrides from '@/components/PageChromeOverrides';
import CmsPreviewDiffBanner from '@/components/CmsPreviewDiffBanner';
import UniversalSections from '@/components/cms/UniversalSections';
import { getCollectionData, getSitePageBySlug, getSiteSettings, type PageSection } from '@/payload/cms';
import { buildSitePageMetadata } from '@/lib/page-metadata';
import { resolveSiteName } from '@/lib/site-config';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import { buildCorePresetSections } from '@/payload/presets/corePagePresets';

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
    fallbackTitle: `${siteName} | Execution-Ready Product Definitions`,
    fallbackDescription:
      'Plenor helps founders and growing businesses create execution-ready product definitions and system specifications for AI tools and engineering teams.',
    forceFallback: true,
  });
}

export default async function HomePage() {
  const cmsReadOptions = await getCmsReadOptions();
  const [sitePage, siteSettings, collectionData] = await Promise.all([
    getSitePageBySlug('home', cmsReadOptions),
    getSiteSettings(cmsReadOptions),
    getCollectionData(cmsReadOptions),
  ]);

  if (!sitePage) {
    notFound();
  }

  const approvedSections = buildCorePresetSections('home', {}) as PageSection[];

  return (
    <>
      <PageChromeOverrides page={sitePage} />
      <CmsPreviewDiffBanner summary={(sitePage as Record<string, unknown>).previewDiffSummary} />
      <UniversalSections
        sections={approvedSections}
        collections={collectionData}
        guideFormLabels={siteSettings?.guideForm}
        inquiryFormLabels={siteSettings?.inquiryForm}
      />
    </>
  );
}
