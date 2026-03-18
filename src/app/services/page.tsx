import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import ServicesSections, { type ServicesSection } from '@/components/ServicesSections';
import UniversalSections from '@/components/cms/UniversalSections';
import { getCollectionData, getSitePageBySlug, getSiteSettings } from '@/payload/cms';

export const revalidate = 60;

interface LegacyServicesFields {
  heroHeading?: string;
  heroSubtext?: string;
  testingBody?: string;
  testingItems?: string[];
  testingWhoFor?: string;
  launchBody?: string;
  launchItems?: string[];
  launchWhoFor?: string;
  whyFrameworkHeading?: string;
  whyFrameworkBody1?: string;
  whyFrameworkBody2?: string;
  whyFrameworkBody3?: string;
  ctaHeading?: string;
  ctaBody?: string;
}

const defaults: Required<LegacyServicesFields> = {
  heroHeading: 'Two framework stages. The two that decide whether a product succeeds.',
  heroSubtext:
    'Testing & QA and Launch & Go-to-Market are where most product failures originate — not in design or development. Plenor Systems is built specifically for these stages.',
  testingBody:
    'Shipping without a structured quality process means issues surface after release — when they\u2019re most expensive to fix. The Testing & QA module establishes clear quality criteria, verification steps, and release gates before code reaches users.',
  testingItems: [
    'Defining quality criteria and acceptance standards before development completes',
    'Structured test planning: functional, regression, performance, and edge-case coverage',
    'Release readiness checklists and sign-off processes',
    'Defect triage and prioritisation so teams know what must be fixed before launch',
  ],
  testingWhoFor:
    'Teams that are shipping frequently and catching issues too late, or organisations preparing for a significant launch that cannot afford post-release rework.',
  launchBody:
    'A product can pass QA and still underperform at launch. Go-to-market failures are often structural — unclear positioning, undefined channels, or a launch day without operational readiness. The Launch & GTM module addresses each of these.',
  launchItems: [
    'Market positioning and messaging that reflects what the product actually does',
    'Channel selection grounded in where your target audience can be reached',
    'Launch sequencing and operational readiness — support, onboarding, and infrastructure',
    'Post-launch review process to capture what worked and what to adjust',
  ],
  launchWhoFor:
    'Startups preparing for a first launch, product teams at SMEs rolling out a new offering, and enterprise groups managing a significant market entry.',
  whyFrameworkHeading: 'Why a framework, not a one-off engagement',
  whyFrameworkBody1:
    'Ad-hoc approaches to testing and go-to-market work in isolation but don\u2019t build repeatable capability. Each launch starts from scratch, and teams re-learn the same lessons.',
  whyFrameworkBody2:
    'A structured framework means your team builds consistent habits — clear criteria before testing begins, defined channels before launch planning starts. It works for startups moving fast and for enterprises that need process rigour across multiple products.',
  whyFrameworkBody3:
    'The framework is not prescriptive. It sets the structure; your team fills in the specifics.',
  ctaHeading: 'Not sure yet?',
  ctaBody: 'Start with the guide — see the kinds of mistakes the framework is designed to prevent.',
};

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

function buildLegacySections(): ServicesSection[] {
  return [
    {
      _key: 'hero',
      _type: 'servicesHeroSection',
      heading: defaults.heroHeading,
      subtext: defaults.heroSubtext,
    },
    {
      _key: 'testing',
      _type: 'servicesTestingSection',
      body: defaults.testingBody,
      items: defaults.testingItems,
      whoFor: defaults.testingWhoFor,
    },
    {
      _key: 'launch',
      _type: 'servicesLaunchSection',
      body: defaults.launchBody,
      items: defaults.launchItems,
      whoFor: defaults.launchWhoFor,
    },
    {
      _key: 'why',
      _type: 'servicesWhySection',
      heading: defaults.whyFrameworkHeading,
      body1: defaults.whyFrameworkBody1,
      body2: defaults.whyFrameworkBody2,
      body3: defaults.whyFrameworkBody3,
    },
    {
      _key: 'links',
      _type: 'servicesLinksSection',
    },
    {
      _key: 'cta',
      _type: 'servicesCtaSection',
      heading: defaults.ctaHeading,
      body: defaults.ctaBody,
    },
  ];
}

export default async function ServicesPage() {
  const { isEnabled: preview } = await draftMode();
  const [sitePage, siteSettings] = await Promise.all([
    getSitePageBySlug('services'),
    getSiteSettings(),
  ]);
  const siteName = siteSettings?.siteName || 'Plenor Systems';
  const siteUrl = siteSettings?.siteUrl || 'https://plenor.ai';

  if (sitePage && Array.isArray(sitePage.sections) && sitePage.sections.length > 0) {
    const collectionData = await getCollectionData();
    return (
      <UniversalSections
        documentId={sitePage.id || 'sitePage.services'}
        documentType={'sitePage'}
        sections={sitePage.sections}
        collections={collectionData}
      />
    );
  }

  const sections = buildLegacySections();

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

      <ServicesSections
        documentId={'servicesPage'}
        documentType={'servicesPage'}
        sections={sections}
      />
    </>
  );
}
