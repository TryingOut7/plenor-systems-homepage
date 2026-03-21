import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import UniversalSections from '@/components/cms/UniversalSections';
import { getCollectionData, getSitePageBySlug, getSiteSettings } from '@/payload/cms';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || 'Plenor Systems';
  const siteUrl = settings?.siteUrl || 'https://plenor.ai';
  const title = settings?.defaultSeo?.metaTitle || `${siteName} — Testing & QA and Launch & Go-to-Market Framework`;
  const description =
    settings?.defaultMetaDescription ||
    'Plenor Systems brings structure to the two most failure-prone stages of product development: Testing & QA and Launch & Go-to-Market.';

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/`,
    },
  };
}

export default async function HomePage() {
  const [sitePage, siteSettings, collectionData] = await Promise.all([
    getSitePageBySlug('home'),
    getSiteSettings(),
    getCollectionData(),
  ]);

  if (!sitePage) {
    notFound();
  }

  return (
    <UniversalSections
      documentId={sitePage.id || 'sitePage.home'}
      documentType="site-pages"
      sections={sitePage.sections}
      collections={collectionData}
      guideFormLabels={siteSettings?.guideForm}
      inquiryFormLabels={siteSettings?.inquiryForm}
    />
  );
}
