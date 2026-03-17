import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import ContactSections, { type ContactSection } from '@/components/ContactSections';
import { sanityFetch } from '@/sanity/client';
import UniversalSections from '@/components/cms/UniversalSections';
import { getCollectionData, getSitePageBySlug } from '@/sanity/cms';

export const revalidate = 60;

interface LegacyContactFields {
  heroHeading?: string;
  heroSubtext?: string;
  inquiryHeading?: string;
  inquirySubtext?: string;
  privacyLabel?: string;
}

interface ContactPageData extends LegacyContactFields {
  _id?: string;
  _type?: string;
  sections?: ContactSection[];
}

const defaults: Required<LegacyContactFields> = {
  heroHeading: 'Let’s talk.',
  heroSubtext: 'Tell us about your product and team and we’ll get back to you within 2 business days.',
  inquiryHeading: 'Send a direct inquiry',
  inquirySubtext:
    'Tell us about your product, your team, and the challenge you’re working through. We’ll respond within 2 business days.',
  privacyLabel: 'By submitting this form, you agree to our',
};

const guideHeading = 'Get the free guide';
const guideBody =
  'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent to your inbox automatically.';

export const metadata: Metadata = {
  title: 'Contact — Send an Inquiry',
  description:
    'Send a direct inquiry to Plenor Systems. Tell us about your product and team.',
  alternates: { canonical: 'https://plenor.ai/contact' },
  openGraph: {
    title: 'Contact Plenor Systems',
    description:
      'Send a direct inquiry to Plenor Systems. Tell us about your product and team.',
    url: 'https://plenor.ai/contact',
  },
};

function isContactSection(value: unknown): value is ContactSection {
  if (!value || typeof value !== 'object') return false;
  const sectionType = (value as { _type?: string })._type;
  return (
    sectionType === 'contactHeroSection' ||
    sectionType === 'contactGuideSection' ||
    sectionType === 'contactInquirySection' ||
    sectionType === 'contactPrivacySection'
  );
}

function buildLegacySections(cms?: LegacyContactFields): ContactSection[] {
  return [
    {
      _key: 'hero',
      _type: 'contactHeroSection',
      heading: cms?.heroHeading ?? defaults.heroHeading,
      subtext: cms?.heroSubtext ?? defaults.heroSubtext,
    },
    {
      _key: 'guide',
      _type: 'contactGuideSection',
      heading: guideHeading,
      body: guideBody,
    },
    {
      _key: 'inquiry',
      _type: 'contactInquirySection',
      heading: cms?.inquiryHeading ?? defaults.inquiryHeading,
      subtext: cms?.inquirySubtext ?? defaults.inquirySubtext,
    },
    {
      _key: 'privacy',
      _type: 'contactPrivacySection',
      label: cms?.privacyLabel ?? defaults.privacyLabel,
    },
  ];
}

export default async function ContactPage() {
  const { isEnabled: preview } = await draftMode();
  const [sitePage, cms] = await Promise.all([
    getSitePageBySlug('contact', preview),
    sanityFetch<ContactPageData>(`*[_type == "contactPage"][0]{..., sections[]{...}}`, {
      preview,
    }),
  ]);

  if (sitePage && Array.isArray(sitePage.sections) && sitePage.sections.length > 0) {
    const collectionData = await getCollectionData(preview);
    return (
      <UniversalSections
        documentId={sitePage._id || 'sitePage.contact'}
        documentType={sitePage._type || 'sitePage'}
        sections={sitePage.sections}
        collections={collectionData}
      />
    );
  }

  const sectionList = Array.isArray(cms?.sections) ? cms.sections.filter(isContactSection) : [];
  const sections = sectionList.length ? sectionList : buildLegacySections(cms ?? undefined);

  return (
    <ContactSections
      documentId={cms?._id || 'contactPage'}
      documentType={cms?._type || 'contactPage'}
      sections={sections}
    />
  );
}
