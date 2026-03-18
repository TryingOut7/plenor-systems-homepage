import type { Metadata } from 'next';
import ContactSections, { type ContactSection } from '@/components/ContactSections';
import UniversalSections from '@/components/cms/UniversalSections';
import { getCollectionData, getSitePageBySlug, getSiteSettings } from '@/payload/cms';

export const revalidate = 60;

const defaults = {
  heroHeading: 'Let\u2019s talk.',
  heroSubtext: 'Tell us about your product and team and we\u2019ll get back to you within 2 business days.',
  inquiryHeading: 'Send a direct inquiry',
  inquirySubtext:
    'Tell us about your product, your team, and the challenge you\u2019re working through. We\u2019ll respond within 2 business days.',
  privacyLabel: 'By submitting this form, you agree to our',
};

const guideHeading = 'Get the free guide';
const guideBody =
  'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent to your inbox automatically.';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || 'Plenor Systems';
  const siteUrl = settings?.siteUrl || 'https://plenor.ai';
  return {
    title: 'Contact \u2014 Send an Inquiry',
    description: `Send a direct inquiry to ${siteName}. Tell us about your product and team.`,
    alternates: { canonical: `${siteUrl}/contact` },
    openGraph: {
      title: `Contact ${siteName}`,
      description: `Send a direct inquiry to ${siteName}. Tell us about your product and team.`,
      url: `${siteUrl}/contact`,
    },
  };
}

function buildLegacySections(): ContactSection[] {
  return [
    { _key: 'hero', _type: 'contactHeroSection', heading: defaults.heroHeading, subtext: defaults.heroSubtext },
    { _key: 'guide', _type: 'contactGuideSection', heading: guideHeading, body: guideBody },
    { _key: 'inquiry', _type: 'contactInquirySection', heading: defaults.inquiryHeading, subtext: defaults.inquirySubtext },
    { _key: 'privacy', _type: 'contactPrivacySection', label: defaults.privacyLabel },
  ];
}

export default async function ContactPage() {
  const [sitePage, siteSettings] = await Promise.all([
    getSitePageBySlug('contact'),
    getSiteSettings(),
  ]);

  if (sitePage && Array.isArray(sitePage.sections) && sitePage.sections.length > 0) {
    const collectionData = await getCollectionData();
    return (
      <UniversalSections
        documentId={sitePage.id || 'sitePage.contact'}
        documentType="site-pages"
        sections={sitePage.sections}
        collections={collectionData}
      />
    );
  }

  const sections = buildLegacySections();
  return (
    <ContactSections
      documentId="contactPage"
      documentType="contactPage"
      sections={sections}
      guideFormLabels={siteSettings?.guideForm}
      inquiryFormLabels={siteSettings?.inquiryForm}
    />
  );
}
