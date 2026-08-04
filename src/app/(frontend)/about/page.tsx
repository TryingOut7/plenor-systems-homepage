import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CmsPreviewDiffBanner from '@/components/CmsPreviewDiffBanner';
import PageChromeOverrides from '@/components/PageChromeOverrides';
import UniversalSections from '@/components/cms/UniversalSections';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import { buildSitePageMetadata } from '@/lib/page-metadata';
import { getCollectionData, getSitePageBySlug, getSiteSettings, type PageSection } from '@/payload/cms';
import { buildCorePresetSections } from '@/payload/presets/corePagePresets';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const cmsReadOptions = await getCmsReadOptions();
  const [sitePage, settings] = await Promise.all([
    getSitePageBySlug('about', cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);
  return buildSitePageMetadata({
    slug: 'about',
    page: sitePage,
    settings,
    fallbackTitle: 'About Plenor Systems | Why Plenor Exists',
    fallbackDescription:
      'Learn why Plenor helps founders and growing businesses close the gap between business ideas and software development.',
    forceFallback: true,
  });
}

export default async function AboutPage() {
  const cmsReadOptions = await getCmsReadOptions();
  const [sitePage, siteSettings] = await Promise.all([
    getSitePageBySlug('about', cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);

  if (!sitePage) {
    notFound();
  }

  const approvedSections = buildCorePresetSections('about', {}) as PageSection[];
  const collectionData = await getCollectionData(cmsReadOptions);
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
