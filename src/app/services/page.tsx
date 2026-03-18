import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import ServicesSections, { type ServicesSection } from '@/components/ServicesSections';
import { getPayload } from '@/payload/client';
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

interface ServicesPageData extends LegacyServicesFields {
  _id?: string;
  _type?: string;
  sections?: ServicesSection[];
}

const defaults: Required<LegacyServicesFields> = {
  heroHeading: 'Two framework stages. The two that decide whether a product succeeds.',
  heroSubtext:
    'Testing & QA and Launch & Go-to-Market are where most product failures originate — not in design or development. Plenor Systems is built specifically for these stages.',
  testingBody:
    'Shipping without a structured quality process means issues surface after release — when they’re most expensive to fix. The Testing & QA module establishes clear quality criteria, verification steps, and release gates before code reaches users.',
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
    'Ad-hoc approaches to testing and go-to-market work in isolation but don’t build repeatable capability. Each launch starts from scratch, and teams re-learn the same lessons.',
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

function isServicesSection(value: unknown): value is ServicesSection {
  if (!value || typeof value !== 'object') return false;
  const sectionType = (value as { _type?: string })._type;
  return (
    sectionType === 'servicesHeroSection' ||
    sectionType === 'servicesTestingSection' ||
    sectionType === 'servicesLaunchSection' ||
    sectionType === 'servicesWhySection' ||
    sectionType === 'servicesLinksSection' ||
    sectionType === 'servicesCtaSection'
  );
}

function buildLegacySections(cms?: LegacyServicesFields): ServicesSection[] {
  return [
    {
      _key: 'hero',
      _type: 'servicesHeroSection',
      heading: cms?.heroHeading ?? defaults.heroHeading,
      subtext: cms?.heroSubtext ?? defaults.heroSubtext,
    },
    {
      _key: 'testing',
      _type: 'servicesTestingSection',
      body: cms?.testingBody ?? defaults.testingBody,
      items: cms?.testingItems?.length ? cms.testingItems : defaults.testingItems,
      whoFor: cms?.testingWhoFor ?? defaults.testingWhoFor,
    },
    {
      _key: 'launch',
      _type: 'servicesLaunchSection',
      body: cms?.launchBody ?? defaults.launchBody,
      items: cms?.launchItems?.length ? cms.launchItems : defaults.launchItems,
      whoFor: cms?.launchWhoFor ?? defaults.launchWhoFor,
    },
    {
      _key: 'why',
      _type: 'servicesWhySection',
      heading: cms?.whyFrameworkHeading ?? defaults.whyFrameworkHeading,
      body1: cms?.whyFrameworkBody1 ?? defaults.whyFrameworkBody1,
      body2: cms?.whyFrameworkBody2 ?? defaults.whyFrameworkBody2,
      body3: cms?.whyFrameworkBody3 ?? defaults.whyFrameworkBody3,
    },
    {
      _key: 'links',
      _type: 'servicesLinksSection',
    },
    {
      _key: 'cta',
      _type: 'servicesCtaSection',
      heading: cms?.ctaHeading ?? defaults.ctaHeading,
      body: cms?.ctaBody ?? defaults.ctaBody,
    },
  ];
}

export default async function ServicesPage() {
  const { isEnabled: preview } = await draftMode();
  const [sitePage, cms, siteSettings] = await Promise.all([
    getSitePageBySlug('services', preview),
    getPayload().then(async (payload) => {
      const result = await payload.find({ collection: 'services-pages', limit: 1 });
      return (result.docs[0] as ServicesPageData | undefined) ?? null;
    }),
    getSiteSettings(),
  ]);
  const siteName = siteSettings?.siteName || 'Plenor Systems';
  const siteUrl = siteSettings?.siteUrl || 'https://plenor.ai';

  if (sitePage && Array.isArray(sitePage.sections) && sitePage.sections.length > 0) {
    const collectionData = await getCollectionData(preview);
    return (
      <UniversalSections
        documentId={sitePage._id || 'sitePage.services'}
        documentType={sitePage._type || 'sitePage'}
        sections={sitePage.sections}
        collections={collectionData}
      />
    );
  }

  const sectionList = Array.isArray(cms?.sections) ? cms.sections.filter(isServicesSection) : [];
  const sections = sectionList.length ? sectionList : buildLegacySections(cms ?? undefined);

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
        documentId={cms?._id || 'servicesPage'}
        documentType={cms?._type || 'servicesPage'}
        sections={sections}
      />
    </>
  );
}
