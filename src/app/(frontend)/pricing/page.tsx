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
    title: "Pricing — Let’s find the right fit for your team",
    description: `${siteName} pricing is tailored to your team size and scope. Get in touch to discuss your product and receive a proposal.`,
    alternates: { canonical: `${siteUrl}/pricing` },
    openGraph: {
      title: `Pricing | ${siteName}`,
      description: `${siteName} pricing is tailored to your team size and scope. Get in touch to discuss your product and receive a proposal.`,
      url: `${siteUrl}/pricing`,
    },
  };
}

export default async function PricingPage() {
  const [sitePage, siteSettings, collectionData] = await Promise.all([
    getSitePageBySlug('pricing'),
    getSiteSettings(),
    getCollectionData(),
  ]);

  if (!sitePage || !Array.isArray(sitePage.sections) || sitePage.sections.length === 0) {
    notFound();
  }

  const siteUrl = siteSettings?.siteUrl || 'https://plenor.ai';
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: 'Home', url: siteUrl },
    { name: 'Pricing', url: `${siteUrl}/pricing` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <UniversalSections
        documentId={sitePage.id || 'sitePage.pricing'}
        documentType="site-pages"
        sections={sitePage.sections}
        collections={collectionData}
        guideFormLabels={siteSettings?.guideForm}
        inquiryFormLabels={siteSettings?.inquiryForm}
      />
    </>
  );
}
