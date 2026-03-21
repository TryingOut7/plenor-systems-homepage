import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import UniversalSections from '@/components/cms/UniversalSections';
import { getCollectionData, getSitePageBySlug, getSiteSettings } from '@/payload/cms';
import { buildBreadcrumbJsonLd } from '@/lib/breadcrumbs';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || 'Plenor Systems';
  const siteUrl = settings?.siteUrl || 'https://plenor.ai';
  return {
    title: 'About - Who We Are and Why We Built This',
    description: `${siteName} was built to address the two stages of product development most likely to cause failure: Testing & QA and Launch & Go-to-Market.`,
    alternates: { canonical: `${siteUrl}/about` },
    openGraph: {
      title: `About ${siteName}`,
      description: `${siteName} was built to address the two stages of product development most likely to cause failure: Testing & QA and Launch & Go-to-Market.`,
      url: `${siteUrl}/about`,
    },
  };
}

export default async function AboutPage() {
  const [sitePage, siteSettings, collectionData] = await Promise.all([
    getSitePageBySlug('about'),
    getSiteSettings(),
    getCollectionData(),
  ]);

  if (!sitePage || !Array.isArray(sitePage.sections) || sitePage.sections.length === 0) {
    notFound();
  }

  const siteUrl = siteSettings?.siteUrl || 'https://plenor.ai';
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: 'Home', url: siteUrl },
    { name: 'About', url: `${siteUrl}/about` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <UniversalSections
        documentId={sitePage.id || 'sitePage.about'}
        documentType="site-pages"
        sections={sitePage.sections}
        collections={collectionData}
        guideFormLabels={siteSettings?.guideForm}
        inquiryFormLabels={siteSettings?.inquiryForm}
      />
    </>
  );
}
