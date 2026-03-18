import type { Metadata } from 'next';
import HomeSections, { type HomeSection } from '@/components/HomeSections';
import UniversalSections from '@/components/cms/UniversalSections';
import { getCollectionData, getSitePageBySlug, getSiteSettings } from '@/payload/cms';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || 'Plenor Systems';
  const siteUrl = settings?.siteUrl || 'https://plenor.ai';
  const title = settings?.defaultSeo?.metaTitle || `${siteName} — Testing & QA and Launch & Go-to-Market Framework`;
  const description =
    settings?.defaultMetaDescription ||
    'Plenor Systems brings structure to the two most failure-prone stages of product development: Testing & QA and Launch & Go-to-Market.';

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/`,
    },
  };
}

const defaults = {
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
    { label: 'Startups', copy: 'Moving fast but need a reliable process for the final stretch — before a launch defines your reputation.' },
    { label: 'SMEs', copy: 'Growing teams that have outpaced informal processes and need structure without slowing down delivery.' },
    { label: 'Enterprises', copy: 'Larger organisations that need a rigorous, repeatable framework that scales across products and teams.' },
  ],
  guideCTAHeading: 'Get the free guide',
  guideCTABody:
    'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent to your inbox automatically.',
};

function buildLegacySections(): HomeSection[] {
  return [
    { _key: 'hero', _type: 'homeHeroSection', heading: defaults.heroHeading, subtext: defaults.heroSubtext },
    { _key: 'problem', _type: 'homeProblemSection', heading: defaults.problemHeading, body1: defaults.problemBody1, body2: defaults.problemBody2 },
    { _key: 'what-we-do', _type: 'homeWhatWeDoSection', heading: defaults.whatWeDoHeading, testingCardTitle: defaults.testingCardTitle, testingCardBody: defaults.testingCardBody, launchCardTitle: defaults.launchCardTitle, launchCardBody: defaults.launchCardBody },
    { _key: 'audience', _type: 'homeAudienceSection', heading: defaults.whoForHeading, audiences: defaults.audiences },
    { _key: 'guide', _type: 'homeGuideSection', heading: defaults.guideCTAHeading, body: defaults.guideCTABody },
  ];
}

export default async function HomePage() {
  const [sitePage, siteSettings] = await Promise.all([
    getSitePageBySlug('home'),
    getSiteSettings(),
  ]);

  const renderCmsSections =
    sitePage && Array.isArray(sitePage.sections) && sitePage.sections.length > 0;
  const collectionData = renderCmsSections ? await getCollectionData() : null;

  if (renderCmsSections && collectionData) {
    return (
      <UniversalSections
        documentId={sitePage.id || 'sitePage.home'}
        documentType="site-pages"
        sections={sitePage.sections || []}
        collections={collectionData}
      />
    );
  }

  const sections = buildLegacySections();
  return (
    <HomeSections
      documentId="homePage"
      documentType="homePage"
      sections={sections}
      guideFormLabels={siteSettings?.guideForm}
    />
  );
}
