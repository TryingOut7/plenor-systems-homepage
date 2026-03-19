import type { Metadata } from 'next';
import PricingSections, { type PricingSection } from '@/components/PricingSections';
import UniversalSections from '@/components/cms/UniversalSections';
import { getCollectionData, getSitePageBySlug, getSiteSettings } from '@/payload/cms';

export const revalidate = 60;

const defaults = {
  heroHeading: 'Let\u2019s find the right fit for your team.',
  heroSubtext:
    'Pricing is tailored based on your team size and scope. Get in touch and we\u2019ll come back with a proposal.',
  includedItems: [
    { title: 'Testing & QA Module', desc: 'Quality criteria, structured test planning, release readiness checklists, and defect triage.' },
    { title: 'Launch & Go-to-Market Module', desc: 'Positioning and messaging, channel strategy, launch sequencing, and operational readiness.' },
    { title: 'Onboarding support', desc: 'Get your team up and running with the framework from day one.' },
  ],
  includedBody:
    'Engagement is straightforward to start. The framework is accessible to teams of any size \u2014 no minimum headcount or project scale required.',
  audiences: [
    { label: 'Startups', copy: 'Early-stage teams preparing for a first or major launch who need process without overhead.' },
    { label: 'SMEs', copy: 'Mid-sized teams with established products moving into new markets or scaling delivery cadence.' },
    { label: 'Enterprises', copy: 'Larger organisations that need a repeatable framework across multiple product lines or teams.' },
  ],
  ctaHeading: 'Ready to talk?',
  ctaBody: 'Tell us about your product and team \u2014 we\u2019ll come back with a proposal.',
  notReadyHeading: 'Not ready to talk yet?',
  notReadyBody: 'Start with the free guide to get a sense of the problems the framework addresses.',
};

const includedHeading = 'Everything you need to ship with confidence.';
const audienceHeading = 'No minimum team size. Any stage.';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || 'Plenor Systems';
  const siteUrl = settings?.siteUrl || 'https://plenor.ai';
  return {
    title: "Pricing \u2014 Let\u2019s find the right fit for your team",
    description: `${siteName} pricing is tailored to your team size and scope. Get in touch to discuss your product and receive a proposal.`,
    alternates: { canonical: `${siteUrl}/pricing` },
    openGraph: {
      title: `Pricing | ${siteName}`,
      description: `${siteName} pricing is tailored to your team size and scope. Get in touch to discuss your product and receive a proposal.`,
      url: `${siteUrl}/pricing`,
    },
  };
}

function buildLegacySections(): PricingSection[] {
  return [
    { _key: 'hero', _type: 'pricingHeroSection', heading: defaults.heroHeading, subtext: defaults.heroSubtext },
    { _key: 'included', _type: 'pricingIncludedSection', heading: includedHeading, items: defaults.includedItems, body: defaults.includedBody },
    { _key: 'audience', _type: 'pricingAudienceSection', heading: audienceHeading, audiences: defaults.audiences },
    { _key: 'cta', _type: 'pricingCtaSection', heading: defaults.ctaHeading, body: defaults.ctaBody },
    { _key: 'guide', _type: 'pricingGuideSection', heading: defaults.notReadyHeading, body: defaults.notReadyBody },
  ];
}

export default async function PricingPage() {
  const sitePage = await getSitePageBySlug('pricing');

  if (sitePage && Array.isArray(sitePage.sections) && sitePage.sections.length > 0) {
    const collectionData = await getCollectionData();
    return (
      <UniversalSections
        documentId={sitePage.id || 'sitePage.pricing'}
        documentType="site-pages"
        sections={sitePage.sections}
        collections={collectionData}
      />
    );
  }

  const sections = buildLegacySections();
  return (
    <PricingSections
      documentId="pricingPage"
      documentType="pricingPage"
      sections={sections}
    />
  );
}
