import type { Metadata } from 'next';
import AboutSections, { type AboutSection } from '@/components/AboutSections';
import UniversalSections from '@/components/cms/UniversalSections';
import { getCollectionData, getSitePageBySlug, getSiteSettings } from '@/payload/cms';

export const revalidate = 60;

const legacyDefaults = {
  heroParagraph1:
    'Plenor Systems is a product development framework built around a specific observation: the stages most likely to cause a launch to fail are Testing & QA and Go-to-Market - and they are consistently the least structured.',
  heroParagraph2:
    'Most frameworks cover the full development lifecycle. Plenor Systems covers only the final two stages - not because the others do not matter, but because these two are where structure is most absent and most needed.',
  heroParagraph3:
    'The framework is used by teams ranging from early-stage startups to enterprise product groups who need a repeatable, structured process for the stretch of work between build completion and a successful launch.',
  focusParagraph1:
    'Plenor Systems covers two stages: Testing & QA and Launch & Go-to-Market. That scope is intentional.',
  focusParagraph2:
    'Narrowing to two stages means the framework goes deep rather than broad. Each module is specific - built from observed patterns of what goes wrong and why. It is not a general project management tool dressed as a product framework.',
  focusParagraph3:
    'The narrow focus is a strength, not a limitation. Teams get a framework that is actually applicable to the work at hand, not a set of generic principles that need extensive interpretation.',
  missionQuote:
    'A well-built product deserves a structured path to market - and consistent quality standards before it gets there.',
  ctaHeading: 'Want to work together?',
  ctaBody: 'Get in touch to discuss your product and team, or start with the free guide.',
};

function buildLegacySections(): AboutSection[] {
  return [
    { _key: 'hero', _type: 'aboutHeroSection', label: 'About', heading: 'Who we are', paragraphs: [legacyDefaults.heroParagraph1, legacyDefaults.heroParagraph2, legacyDefaults.heroParagraph3] },
    { _key: 'focus', _type: 'aboutFocusSection', label: 'Our Focus', heading: 'Narrow by design. Deep by necessity.', paragraphs: [legacyDefaults.focusParagraph1, legacyDefaults.focusParagraph2, legacyDefaults.focusParagraph3], linkLabel: 'See how the two stages work ->', linkHref: '/services' },
    { _key: 'mission', _type: 'aboutMissionSection', label: 'What we believe', quote: legacyDefaults.missionQuote },
    { _key: 'founder', _type: 'aboutFounderSection', label: 'The Team', heading: 'The people behind the framework.', founderName: '', founderRole: '', founderBio: '' },
    { _key: 'cta', _type: 'aboutCtaSection', heading: legacyDefaults.ctaHeading, body: legacyDefaults.ctaBody, primaryButtonLabel: 'Get in touch', primaryButtonHref: '/contact', secondaryButtonLabel: 'Get the free guide', secondaryButtonHref: '/contact#guide' },
  ];
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || 'Plenor Systems';
  const siteUrl = settings?.siteUrl || 'https://plenor.ai';
  return {
    title: 'About - Who We Are and Why We Built This',
    description: `${siteName} was built to address the two stages of product development most likely to cause failure: Testing & QA and Launch & Go-to-Market.`,
    alternates: { canonical: `${siteUrl}/about` },
    openGraph: {
      title: `About ${siteName}`,
      description: `${siteName} was built to address the two stages of product development most likely to cause failure: Testing & QA and Launch & Go-to-Market.`,
      url: `${siteUrl}/about`,
    },
  };
}

export default async function AboutPage() {
  const sitePage = await getSitePageBySlug('about');

  if (sitePage && Array.isArray(sitePage.sections) && sitePage.sections.length > 0) {
    const collectionData = await getCollectionData();
    return (
      <UniversalSections
        documentId={sitePage.id || 'sitePage.about'}
        documentType="site-pages"
        sections={sitePage.sections}
        collections={collectionData}
      />
    );
  }

  const sections = buildLegacySections();
  return (
    <AboutSections
      documentId="aboutPage"
      documentType="aboutPage"
      sections={sections}
    />
  );
}
