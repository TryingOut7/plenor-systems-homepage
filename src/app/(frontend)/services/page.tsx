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
    title: 'Services — Testing & QA and Launch & Go-to-Market',
    description: `${siteName} covers two framework stages: Testing & QA and Launch & Go-to-Market. Learn what each stage covers, who it helps, and why a structured framework matters.`,
    alternates: { canonical: `${siteUrl}/services` },
    openGraph: {
      title: `Services — Testing & QA and Launch & Go-to-Market | ${siteName}`,
      description: `${siteName} covers two framework stages: Testing & QA and Launch & Go-to-Market. Learn what each stage covers, who it helps, and why a structured framework matters.`,
      url: `${siteUrl}/services`,
    },
  };
}

export default async function ServicesPage() {
  const [sitePage, siteSettings, collectionData] = await Promise.all([
    getSitePageBySlug('services'),
    getSiteSettings(),
    getCollectionData(),
  ]);

  if (!sitePage || !Array.isArray(sitePage.sections) || sitePage.sections.length === 0) {
    notFound();
  }

  const siteName = siteSettings?.siteName || 'Plenor Systems';
  const siteUrl = siteSettings?.siteUrl || 'https://plenor.ai';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: `${siteName} Product Development Framework`,
            provider: {
              '@type': 'Organization',
              name: siteName,
              url: siteUrl,
            },
            description:
              'A structured framework covering Testing & QA and Launch & Go-to-Market stages of product development.',
            areaServed: 'Worldwide',
          }),
        }}
      />
      <UniversalSections
        documentId={sitePage.id || 'sitePage.services'}
        documentType="site-pages"
        sections={sitePage.sections}
        collections={collectionData}
        guideFormLabels={siteSettings?.guideForm}
        inquiryFormLabels={siteSettings?.inquiryForm}
      />
    </>
  );
}
