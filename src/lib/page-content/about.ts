import type { PageSection } from '@/payload/cms';
import { asTrimmedString, findSection, getRichTextParagraphs } from '@/lib/page-content/helpers';

export interface AboutPageData {
  heroLabel?: string;
  heroHeading?: string;
  heroParagraph1?: string;
  heroParagraph2?: string;
  heroParagraph3?: string;
  focusLabel?: string;
  focusHeading?: string;
  focusLinkLabel?: string;
  focusLinkHref?: string;
  focusParagraph1?: string;
  focusParagraph2?: string;
  focusParagraph3?: string;
  missionLabel?: string;
  missionQuote?: string;
  teamLabel?: string;
  teamHeading?: string;
  founderName?: string;
  founderRole?: string;
  founderBio?: string;
  ctaHeading?: string;
  ctaBody?: string;
  ctaPrimaryLabel?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
}

export const ABOUT_PAGE_DEFAULTS: Required<AboutPageData> = {
  heroLabel: 'About',
  heroHeading: 'Who we are',
  heroParagraph1:
    'This product development framework is built around a specific observation: the stages most likely to cause a launch to fail are Testing & QA and Go-to-Market — and they’re consistently the least structured.',
  heroParagraph2:
    'Most frameworks cover the full development lifecycle. This framework covers only the final two stages — not because the others don’t matter, but because these two are where structure is most absent and most needed.',
  heroParagraph3:
    'The framework is used by teams ranging from early-stage startups to enterprise product groups who need a repeatable, structured process for the stretch of work between build completion and a successful launch.',
  focusLabel: 'Our Focus',
  focusHeading: 'Narrow by design. Deep by necessity.',
  focusLinkLabel: 'See how the two stages work →',
  focusLinkHref: '/services',
  focusParagraph1:
    'This framework covers two stages: Testing & QA and Launch & Go-to-Market. That scope is intentional.',
  focusParagraph2:
    'Narrowing to two stages means the framework goes deep rather than broad. Each module is specific — built from observed patterns of what goes wrong and why. It is not a general project management tool dressed as a product framework.',
  focusParagraph3:
    'The narrow focus is a strength, not a limitation. Teams get a framework that is actually applicable to the work at hand, not a set of generic principles that need extensive interpretation.',
  missionLabel: 'What we believe',
  missionQuote:
    'A well-built product deserves a structured path to market — and consistent quality standards before it gets there.',
  teamLabel: 'The Team',
  teamHeading: 'The people behind the framework.',
  founderName: '',
  founderRole: '',
  founderBio: '',
  ctaHeading: 'Want to work together?',
  ctaBody: 'Get in touch to discuss your product and team, or start with the free guide.',
  ctaPrimaryLabel: 'Get in touch',
  ctaPrimaryHref: '/contact',
  ctaSecondaryLabel: 'Get the free guide',
  ctaSecondaryHref: '/contact#guide',
};

export function resolveAboutPageData(
  sections: PageSection[] | null | undefined,
): Required<AboutPageData> {
  const safeSections = Array.isArray(sections) ? sections : [];

  const hero = findSection(safeSections, 'heroSection');
  const whoSection = findSection(safeSections, 'richTextSection', 'Who we are');
  const focusSection = findSection(
    safeSections,
    'richTextSection',
    'Narrow by design. Deep by necessity.',
  );
  const mission = findSection(safeSections, 'ctaSection', 'What we believe');
  const cta = findSection(safeSections, 'ctaSection', 'Want to work together?');

  const whoParagraphs = getRichTextParagraphs(whoSection);
  const focusParagraphs = getRichTextParagraphs(focusSection);

  return {
    ...ABOUT_PAGE_DEFAULTS,
    heroLabel:
      asTrimmedString(hero?.eyebrow) || asTrimmedString(hero?.sectionLabel) || ABOUT_PAGE_DEFAULTS.heroLabel,
    heroHeading:
      asTrimmedString(whoSection?.heading) ||
      asTrimmedString(hero?.heading) ||
      ABOUT_PAGE_DEFAULTS.heroHeading,
    heroParagraph1:
      asTrimmedString(hero?.subheading) || ABOUT_PAGE_DEFAULTS.heroParagraph1,
    heroParagraph2: whoParagraphs[0] || ABOUT_PAGE_DEFAULTS.heroParagraph2,
    heroParagraph3: whoParagraphs[1] || ABOUT_PAGE_DEFAULTS.heroParagraph3,
    focusLabel: asTrimmedString(focusSection?.sectionLabel) || ABOUT_PAGE_DEFAULTS.focusLabel,
    focusHeading: asTrimmedString(focusSection?.heading) || ABOUT_PAGE_DEFAULTS.focusHeading,
    focusLinkLabel: ABOUT_PAGE_DEFAULTS.focusLinkLabel,
    focusLinkHref: ABOUT_PAGE_DEFAULTS.focusLinkHref,
    focusParagraph1: focusParagraphs[0] || ABOUT_PAGE_DEFAULTS.focusParagraph1,
    focusParagraph2: focusParagraphs[1] || ABOUT_PAGE_DEFAULTS.focusParagraph2,
    focusParagraph3: focusParagraphs[2] || ABOUT_PAGE_DEFAULTS.focusParagraph3,
    missionLabel: asTrimmedString(mission?.heading) || ABOUT_PAGE_DEFAULTS.missionLabel,
    missionQuote: asTrimmedString(mission?.body) || ABOUT_PAGE_DEFAULTS.missionQuote,
    teamLabel: ABOUT_PAGE_DEFAULTS.teamLabel,
    teamHeading: ABOUT_PAGE_DEFAULTS.teamHeading,
    ctaHeading: asTrimmedString(cta?.heading) || ABOUT_PAGE_DEFAULTS.ctaHeading,
    ctaBody: asTrimmedString(cta?.body) || ABOUT_PAGE_DEFAULTS.ctaBody,
    ctaPrimaryLabel: asTrimmedString(cta?.buttonLabel) || ABOUT_PAGE_DEFAULTS.ctaPrimaryLabel,
    ctaPrimaryHref: asTrimmedString(cta?.buttonHref) || ABOUT_PAGE_DEFAULTS.ctaPrimaryHref,
    ctaSecondaryLabel: ABOUT_PAGE_DEFAULTS.ctaSecondaryLabel,
    ctaSecondaryHref: ABOUT_PAGE_DEFAULTS.ctaSecondaryHref,
    founderName: ABOUT_PAGE_DEFAULTS.founderName,
    founderRole: ABOUT_PAGE_DEFAULTS.founderRole,
    founderBio: ABOUT_PAGE_DEFAULTS.founderBio,
  };
}
