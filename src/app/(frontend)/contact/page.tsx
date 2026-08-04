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
    getSitePageBySlug('contact', cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);
  return buildSitePageMetadata({
    slug: 'contact',
    page: sitePage,
    settings,
    fallbackTitle: 'Discuss Your Product | Plenor Systems',
    fallbackDescription:
      'Contact Plenor to discuss a business idea, product, or system that needs a clearer definition for software development.',
    forceFallback: true,
  });
}

export default async function ContactPage() {
  const cmsReadOptions = await getCmsReadOptions();
  const [sitePage, siteSettings] = await Promise.all([
    getSitePageBySlug('contact', cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);

  if (!sitePage) {
    notFound();
  }

  const approvedSections = buildCorePresetSections('contact', {}) as PageSection[];
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
