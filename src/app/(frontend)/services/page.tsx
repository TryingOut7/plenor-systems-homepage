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
    getSitePageBySlug('services', cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);
  return buildSitePageMetadata({
    slug: 'services',
    page: sitePage,
    settings,
    fallbackTitle: 'Product, Experience, and System Definition | Plenor Systems',
    fallbackDescription:
      'Use the Plenor governed platform to define the product, design user experiences and workflows, and create system specifications ready to guide implementation.',
    forceFallback: true,
  });
}

export default async function ServicesPage() {
  const cmsReadOptions = await getCmsReadOptions();
  const [sitePage, siteSettings] = await Promise.all([
    getSitePageBySlug('services', cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);

  if (!sitePage) {
    notFound();
  }

  const approvedSections = buildCorePresetSections('services', {}) as PageSection[];
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
