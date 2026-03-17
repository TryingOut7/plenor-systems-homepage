import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import HomeSections, { type HomeSection } from '@/components/HomeSections';
import { sanityFetch } from '@/sanity/client';
import UniversalSections from '@/components/cms/UniversalSections';
import { getCollectionData, getSitePageBySlug } from '@/sanity/cms';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Plenor Systems — Testing & QA and Launch & Go-to-Market Framework',
  description:
    'Plenor Systems brings structure to the two most failure-prone stages of product development: Testing & QA and Launch & Go-to-Market.',
  alternates: { canonical: 'https://plenor.ai/' },
  openGraph: {
    title: 'Plenor Systems — Testing & QA and Launch & Go-to-Market Framework',
    description:
      'Plenor Systems brings structure to the two most failure-prone stages of product development: Testing & QA and Launch & Go-to-Market.',
    url: 'https://plenor.ai/',
  },
};

interface LegacyHomeFields {
  heroHeading?: string;
  heroSubtext?: string;
  problemHeading?: string;
  problemBody1?: string;
  problemBody2?: string;
  whatWeDoHeading?: string;
  testingCardTitle?: string;
  testingCardBody?: string;
  launchCardTitle?: string;
  launchCardBody?: string;
  whoForHeading?: string;
  audiences?: { _key?: string; label?: string; copy?: string }[];
  guideCTAHeading?: string;
  guideCTABody?: string;
}

interface HomePageData extends LegacyHomeFields {
  _id?: string;
  _type?: string;
  sections?: HomeSection[];
}

const defaults: Required<LegacyHomeFields> = {
  heroHeading: 'Plenor Systems brings structure to the two most failure-prone stages of product development.',
  heroSubtext: 'Testing & QA and Launch & Go-to-Market, done right.',
  problemHeading: 'Most product failures happen at the end, not the beginning.',
  problemBody1:
    "Teams spend months building a product, then rush testing, skip structured QA, and launch without a clear go-to-market plan. The result: bugs found by customers, positioning that misses the market, and launches that don't generate expected traction.",
  problemBody2:
    "These aren't execution failures — they're structural ones. The final stages of product development are consistently underprepared. Plenor Systems is built specifically to fix that.",
  whatWeDoHeading: 'Two stages. Both critical.',
  testingCardTitle: 'Testing & QA that catches what matters before release.',
  testingCardBody:
    'A structured approach to verification, quality criteria, and release readiness. Designed to reduce rework and give your team confidence before shipping.',
  launchCardTitle: 'Launch & Go-to-Market with a plan that holds up on launch day.',
  launchCardBody:
    'From positioning and channel selection to operational readiness, the framework keeps go-to-market work structured rather than reactive.',
  whoForHeading: 'Built for teams at every stage.',
  audiences: [
    {
      label: 'Startups',
      copy: 'Moving fast but need a reliable process for the final stretch — before a launch defines your reputation.',
    },
    {
      label: 'SMEs',
      copy: 'Growing teams that have outpaced informal processes and need structure without slowing down delivery.',
    },
    {
      label: 'Enterprises',
      copy: 'Larger organisations that need a rigorous, repeatable framework that scales across products and teams.',
    },
  ],
  guideCTAHeading: 'Get the free guide',
  guideCTABody:
    'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent to your inbox automatically.',
};

function isHomeSection(value: unknown): value is HomeSection {
  if (!value || typeof value !== 'object') return false;
  const sectionType = (value as { _type?: string })._type;
  return (
    sectionType === 'homeHeroSection' ||
    sectionType === 'homeProblemSection' ||
    sectionType === 'homeWhatWeDoSection' ||
    sectionType === 'homeAudienceSection' ||
    sectionType === 'homeGuideSection'
  );
}

function buildLegacySections(cms?: LegacyHomeFields): HomeSection[] {
  return [
    {
      _key: 'hero',
      _type: 'homeHeroSection',
      heading: cms?.heroHeading ?? defaults.heroHeading,
      subtext: cms?.heroSubtext ?? defaults.heroSubtext,
    },
    {
      _key: 'problem',
      _type: 'homeProblemSection',
      heading: cms?.problemHeading ?? defaults.problemHeading,
      body1: cms?.problemBody1 ?? defaults.problemBody1,
      body2: cms?.problemBody2 ?? defaults.problemBody2,
    },
    {
      _key: 'what-we-do',
      _type: 'homeWhatWeDoSection',
      heading: cms?.whatWeDoHeading ?? defaults.whatWeDoHeading,
      testingCardTitle: cms?.testingCardTitle ?? defaults.testingCardTitle,
      testingCardBody: cms?.testingCardBody ?? defaults.testingCardBody,
      launchCardTitle: cms?.launchCardTitle ?? defaults.launchCardTitle,
      launchCardBody: cms?.launchCardBody ?? defaults.launchCardBody,
    },
    {
      _key: 'audience',
      _type: 'homeAudienceSection',
      heading: cms?.whoForHeading ?? defaults.whoForHeading,
      audiences: cms?.audiences?.length ? cms.audiences : defaults.audiences,
    },
    {
      _key: 'guide',
      _type: 'homeGuideSection',
      heading: cms?.guideCTAHeading ?? defaults.guideCTAHeading,
      body: cms?.guideCTABody ?? defaults.guideCTABody,
    },
  ];
}

export default async function HomePage() {
  const { isEnabled: preview } = await draftMode();
  const [sitePage, cms] = await Promise.all([
    getSitePageBySlug('home', preview),
    sanityFetch<HomePageData>(`*[_type == "homePage"][0]{..., sections[]{...}}`, {
      preview,
    }),
  ]);

  const renderCmsSections =
    sitePage && Array.isArray(sitePage.sections) && sitePage.sections.length > 0;
  const collectionData = renderCmsSections ? await getCollectionData(preview) : null;

  const sectionList = Array.isArray(cms?.sections) ? cms.sections.filter(isHomeSection) : [];
  const sections = sectionList.length ? sectionList : buildLegacySections(cms ?? undefined);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Plenor Systems',
            url: 'https://plenor.ai',
            sameAs: ['https://www.linkedin.com/company/plenor-ai'],
            contactPoint: {
              '@type': 'ContactPoint',
              email: 'hello@plenor.ai',
              contactType: 'customer service',
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Plenor Systems',
            url: 'https://plenor.ai',
          }),
        }}
      />

      {renderCmsSections && collectionData ? (
        <UniversalSections
          documentId={sitePage._id || 'sitePage.home'}
          documentType={sitePage._type || 'sitePage'}
          sections={sitePage.sections || []}
          collections={collectionData}
        />
      ) : (
        <HomeSections
          documentId={cms?._id || 'homePage'}
          documentType={cms?._type || 'homePage'}
          sections={sections}
        />
      )}
    </>
  );
}
