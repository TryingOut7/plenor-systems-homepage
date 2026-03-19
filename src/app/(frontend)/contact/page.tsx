import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import UniversalSections from '@/components/cms/UniversalSections';
import { getCollectionData, getSitePageBySlug, getSiteSettings } from '@/payload/cms';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || 'Plenor Systems';
  const siteUrl = settings?.siteUrl || 'https://plenor.ai';
  return {
    title: 'Contact — Send an Inquiry',
    description: `Send a direct inquiry to ${siteName}. Tell us about your product and team.`,
    alternates: { canonical: `${siteUrl}/contact` },
    openGraph: {
      title: `Contact ${siteName}`,
      description: `Send a direct inquiry to ${siteName}. Tell us about your product and team.`,
      url: `${siteUrl}/contact`,
    },
  };
}

export default async function ContactPage() {
  const [sitePage, siteSettings, collectionData] = await Promise.all([
    getSitePageBySlug('contact'),
    getSiteSettings(),
    getCollectionData(),
  ]);

  if (!sitePage || !Array.isArray(sitePage.sections) || sitePage.sections.length === 0) {
    notFound();
  }

  return (
    <UniversalSections
      documentId={sitePage.id || 'sitePage.contact'}
      documentType="site-pages"
      sections={sitePage.sections}
      collections={collectionData}
      guideFormLabels={siteSettings?.guideForm}
      inquiryFormLabels={siteSettings?.inquiryForm}
    />
  );
}
