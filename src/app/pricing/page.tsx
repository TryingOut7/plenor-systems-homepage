import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import PricingSections, { type PricingSection } from '@/components/PricingSections';
import { sanityFetch } from '@/sanity/client';

export const revalidate = 60;

interface LegacyPricingFields {
  heroHeading?: string;
  heroSubtext?: string;
  includedItems?: Array<{ _key?: string; title?: string; desc?: string } | string>;
  includedBody?: string;
  audiences?: { _key?: string; label?: string; copy?: string }[];
  ctaHeading?: string;
  ctaBody?: string;
  notReadyHeading?: string;
  notReadyBody?: string;
}

interface PricingPageData extends LegacyPricingFields {
  _id?: string;
  _type?: string;
  sections?: PricingSection[];
}

const defaults: Required<LegacyPricingFields> = {
  heroHeading: 'Let’s find the right fit for your team.',
  heroSubtext:
    'Pricing is tailored based on your team size and scope. Get in touch and we’ll come back with a proposal.',
  includedItems: [
    {
      title: 'Testing & QA Module',
      desc: 'Quality criteria, structured test planning, release readiness checklists, and defect triage.',
    },
    {
      title: 'Launch & Go-to-Market Module',
      desc: 'Positioning and messaging, channel strategy, launch sequencing, and operational readiness.',
    },
    { title: 'Onboarding support', desc: 'Get your team up and running with the framework from day one.' },
  ],
  includedBody:
    'Engagement is straightforward to start. The framework is accessible to teams of any size — no minimum headcount or project scale required.',
  audiences: [
    {
      label: 'Startups',
      copy: 'Early-stage teams preparing for a first or major launch who need process without overhead.',
    },
    {
      label: 'SMEs',
      copy: 'Mid-sized teams with established products moving into new markets or scaling delivery cadence.',
    },
    {
      label: 'Enterprises',
      copy: 'Larger organisations that need a repeatable framework across multiple product lines or teams.',
    },
  ],
  ctaHeading: 'Ready to talk?',
  ctaBody: 'Tell us about your product and team — we’ll come back with a proposal.',
  notReadyHeading: 'Not ready to talk yet?',
  notReadyBody: 'Start with the free guide to get a sense of the problems the framework addresses.',
};

const includedHeading = 'Everything you need to ship with confidence.';
const audienceHeading = 'No minimum team size. Any stage.';

export const metadata: Metadata = {
  title: "Pricing — Let's find the right fit for your team",
  description:
    'Plenor Systems pricing is tailored to your team size and scope. Get in touch to discuss your product and receive a proposal.',
  alternates: { canonical: 'https://plenor.ai/pricing' },
  openGraph: {
    title: 'Pricing | Plenor Systems',
    description:
      'Plenor Systems pricing is tailored to your team size and scope. Get in touch to discuss your product and receive a proposal.',
    url: 'https://plenor.ai/pricing',
  },
};

function isPricingSection(value: unknown): value is PricingSection {
  if (!value || typeof value !== 'object') return false;
  const sectionType = (value as { _type?: string })._type;
  return (
    sectionType === 'pricingHeroSection' ||
    sectionType === 'pricingIncludedSection' ||
    sectionType === 'pricingAudienceSection' ||
    sectionType === 'pricingCtaSection' ||
    sectionType === 'pricingGuideSection'
  );
}

function buildLegacySections(cms?: LegacyPricingFields): PricingSection[] {
  return [
    {
      _key: 'hero',
      _type: 'pricingHeroSection',
      heading: cms?.heroHeading ?? defaults.heroHeading,
      subtext: cms?.heroSubtext ?? defaults.heroSubtext,
    },
    {
      _key: 'included',
      _type: 'pricingIncludedSection',
      heading: includedHeading,
      items: cms?.includedItems?.length ? cms.includedItems : defaults.includedItems,
      body: cms?.includedBody ?? defaults.includedBody,
    },
    {
      _key: 'audience',
      _type: 'pricingAudienceSection',
      heading: audienceHeading,
      audiences: cms?.audiences?.length ? cms.audiences : defaults.audiences,
    },
    {
      _key: 'cta',
      _type: 'pricingCtaSection',
      heading: cms?.ctaHeading ?? defaults.ctaHeading,
      body: cms?.ctaBody ?? defaults.ctaBody,
    },
    {
      _key: 'guide',
      _type: 'pricingGuideSection',
      heading: cms?.notReadyHeading ?? defaults.notReadyHeading,
      body: cms?.notReadyBody ?? defaults.notReadyBody,
    },
  ];
}

export default async function PricingPage() {
  const { isEnabled: preview } = await draftMode();
  const cms = await sanityFetch<PricingPageData>(`*[_type == "pricingPage"][0]{..., sections[]{...}}`, {
    preview,
  });
  const sectionList = Array.isArray(cms?.sections) ? cms.sections.filter(isPricingSection) : [];
  const sections = sectionList.length ? sectionList : buildLegacySections(cms ?? undefined);

  return (
    <PricingSections
      documentId={cms?._id || 'pricingPage'}
      documentType={cms?._type || 'pricingPage'}
      sections={sections}
    />
  );
}
