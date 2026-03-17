import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import AboutSections, { type AboutSection } from '@/components/AboutSections';
import { sanityFetch } from '@/sanity/client';

export const revalidate = 60;

interface LegacyAboutFields {
  heroParagraph1?: string;
  heroParagraph2?: string;
  heroParagraph3?: string;
  focusParagraph1?: string;
  focusParagraph2?: string;
  focusParagraph3?: string;
  missionQuote?: string;
  founderName?: string;
  founderRole?: string;
  founderBio?: string;
  ctaHeading?: string;
  ctaBody?: string;
}

interface AboutPageData extends LegacyAboutFields {
  _id?: string;
  _type?: string;
  sections?: AboutSection[];
}

const legacyDefaults: Required<LegacyAboutFields> = {
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
  founderName: '',
  founderRole: '',
  founderBio: '',
  ctaHeading: 'Want to work together?',
  ctaBody: 'Get in touch to discuss your product and team, or start with the free guide.',
};

function isAboutSection(value: unknown): value is AboutSection {
  if (!value || typeof value !== 'object') return false;
  const sectionType = (value as { _type?: string })._type;
  return (
    sectionType === 'aboutHeroSection' ||
    sectionType === 'aboutFocusSection' ||
    sectionType === 'aboutMissionSection' ||
    sectionType === 'aboutFounderSection' ||
    sectionType === 'aboutCtaSection'
  );
}

function buildLegacySections(cms?: LegacyAboutFields): AboutSection[] {
  return [
    {
      _key: 'hero',
      _type: 'aboutHeroSection',
      label: 'About',
      heading: 'Who we are',
      paragraphs: [
        cms?.heroParagraph1 ?? legacyDefaults.heroParagraph1,
        cms?.heroParagraph2 ?? legacyDefaults.heroParagraph2,
        cms?.heroParagraph3 ?? legacyDefaults.heroParagraph3,
      ],
    },
    {
      _key: 'focus',
      _type: 'aboutFocusSection',
      label: 'Our Focus',
      heading: 'Narrow by design. Deep by necessity.',
      paragraphs: [
        cms?.focusParagraph1 ?? legacyDefaults.focusParagraph1,
        cms?.focusParagraph2 ?? legacyDefaults.focusParagraph2,
        cms?.focusParagraph3 ?? legacyDefaults.focusParagraph3,
      ],
      linkLabel: 'See how the two stages work ->',
      linkHref: '/services',
    },
    {
      _key: 'mission',
      _type: 'aboutMissionSection',
      label: 'What we believe',
      quote: cms?.missionQuote ?? legacyDefaults.missionQuote,
    },
    {
      _key: 'founder',
      _type: 'aboutFounderSection',
      label: 'The Team',
      heading: 'The people behind the framework.',
      founderName: cms?.founderName ?? legacyDefaults.founderName,
      founderRole: cms?.founderRole ?? legacyDefaults.founderRole,
      founderBio: cms?.founderBio ?? legacyDefaults.founderBio,
    },
    {
      _key: 'cta',
      _type: 'aboutCtaSection',
      heading: cms?.ctaHeading ?? legacyDefaults.ctaHeading,
      body: cms?.ctaBody ?? legacyDefaults.ctaBody,
      primaryButtonLabel: 'Get in touch',
      primaryButtonHref: '/contact',
      secondaryButtonLabel: 'Get the free guide',
      secondaryButtonHref: '/contact#guide',
    },
  ];
}

export const metadata: Metadata = {
  title: 'About - Who We Are and Why We Built This',
  description:
    'Plenor Systems was built to address the two stages of product development most likely to cause failure: Testing & QA and Launch & Go-to-Market.',
  alternates: { canonical: 'https://plenor.ai/about' },
  openGraph: {
    title: 'About Plenor Systems',
    description:
      'Plenor Systems was built to address the two stages of product development most likely to cause failure: Testing & QA and Launch & Go-to-Market.',
    url: 'https://plenor.ai/about',
  },
};

export default async function AboutPage() {
  const { isEnabled: preview } = await draftMode();
  const cms = await sanityFetch<AboutPageData>(`*[_type == "aboutPage"][0]{..., sections[]{...}}`, {
    preview,
  });

  const sectionList = Array.isArray(cms?.sections) ? cms.sections.filter(isAboutSection) : [];
  const sections = sectionList.length ? sectionList : buildLegacySections(cms ?? undefined);

  return (
    <AboutSections
      documentId={cms?._id || 'aboutPage'}
      documentType={cms?._type || 'aboutPage'}
      sections={sections}
    />
  );
}
