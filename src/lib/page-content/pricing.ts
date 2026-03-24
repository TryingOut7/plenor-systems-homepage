import type { PageSection } from '@/payload/cms';
import {
  asTrimmedString,
  findSection,
  getCellValue,
  getRichTextParagraphs,
  getRows,
} from '@/lib/page-content/helpers';

type PricingIncludedItem = { title: string; desc: string };
type PricingAudience = { label: string; copy: string };

export interface PricingPageData {
  heroLabel?: string;
  heroHeading?: string;
  heroSubtext?: string;
  includedLabel?: string;
  includedHeading?: string;
  includedItems?: PricingIncludedItem[];
  includedBody?: string;
  audiencesLabel?: string;
  audiencesHeading?: string;
  audiences?: PricingAudience[];
  noMinimumNote?: string;
  ctaHeading?: string;
  ctaBody?: string;
  ctaButtonLabel?: string;
  ctaButtonHref?: string;
  backLinkLabel?: string;
  backLinkHref?: string;
  notReadyHeading?: string;
  notReadyBody?: string;
  notReadyButtonLabel?: string;
  notReadyButtonHref?: string;
}

export const PRICING_PAGE_DEFAULTS: Required<PricingPageData> = {
  heroLabel: 'Pricing',
  heroHeading: 'Let’s find the right fit for your team.',
  heroSubtext:
    'Pricing is tailored based on your team size and scope. Get in touch and we’ll come back with a proposal.',
  includedLabel: "What's included",
  includedHeading: 'Everything you need to ship with confidence.',
  includedItems: [
    {
      title: 'Testing & QA Module',
      desc: 'Quality criteria, structured test planning, release readiness checklists, and defect triage.',
    },
    {
      title: 'Launch & Go-to-Market Module',
      desc: 'Positioning and messaging, channel strategy, launch sequencing, and operational readiness.',
    },
    {
      title: 'Onboarding support',
      desc: 'Get your team up and running with the framework from day one.',
    },
  ],
  includedBody:
    'Engagement is straightforward to start. The framework is accessible to teams of any size — no minimum headcount or project scale required.',
  audiencesLabel: 'Who we work with',
  audiencesHeading: 'No minimum team size. Any stage.',
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
  noMinimumNote: 'There is no minimum team size requirement to work with us.',
  ctaHeading: 'Ready to talk?',
  ctaBody: 'Tell us about your product and team — we’ll come back with a proposal.',
  ctaButtonLabel: 'Get in touch',
  ctaButtonHref: '/contact',
  backLinkLabel: '← Back to Services',
  backLinkHref: '/services',
  notReadyHeading: 'Not ready to talk yet?',
  notReadyBody: 'Start with the free guide to get a sense of the problems the framework addresses.',
  notReadyButtonLabel: 'Get the free guide',
  notReadyButtonHref: '/contact#guide',
};

export function resolvePricingPageData(
  sections: PageSection[] | null | undefined,
): Required<PricingPageData> {
  const safeSections = Array.isArray(sections) ? sections : [];
  const hero = findSection(safeSections, 'heroSection');
  const simpleTables = safeSections.filter((section) => section.blockType === 'simpleTableSection');
  const includedTable = findSection(
    safeSections,
    'simpleTableSection',
    'Everything you need to ship with confidence.',
  ) || simpleTables[0];
  const includedBodySection = findSection(safeSections, 'richTextSection');
  const audienceTable = findSection(
    safeSections,
    'simpleTableSection',
    'No minimum team size. Any stage.',
  ) || simpleTables.find((section) => section !== includedTable);
  const cta = findSection(safeSections, 'ctaSection', 'Ready to talk?');
  const notReady = findSection(safeSections, 'ctaSection', 'Not ready to talk yet?');

  const includedRows = getRows(includedTable);
  const audiencesRows = getRows(audienceTable);
  const includedBodyParagraphs = getRichTextParagraphs(includedBodySection);

  const includedItems = includedRows
    .map((row) => ({
      title: getCellValue(row, 0),
      desc: getCellValue(row, 1),
    }))
    .filter((entry) => entry.title && entry.desc);

  const audiences = audiencesRows
    .map((row) => ({
      label: getCellValue(row, 0),
      copy: getCellValue(row, 1),
    }))
    .filter((entry) => entry.label && entry.copy);

  return {
    ...PRICING_PAGE_DEFAULTS,
    heroLabel:
      asTrimmedString(hero?.eyebrow) ||
      asTrimmedString(hero?.sectionLabel) ||
      PRICING_PAGE_DEFAULTS.heroLabel,
    heroHeading: asTrimmedString(hero?.heading) || PRICING_PAGE_DEFAULTS.heroHeading,
    heroSubtext:
      asTrimmedString(hero?.subheading) || PRICING_PAGE_DEFAULTS.heroSubtext,
    includedLabel:
      asTrimmedString(includedTable?.sectionLabel) || PRICING_PAGE_DEFAULTS.includedLabel,
    includedHeading: asTrimmedString(includedTable?.heading) || PRICING_PAGE_DEFAULTS.includedHeading,
    includedItems: includedItems.length ? includedItems : PRICING_PAGE_DEFAULTS.includedItems,
    includedBody: includedBodyParagraphs[0] || PRICING_PAGE_DEFAULTS.includedBody,
    audiencesLabel:
      asTrimmedString(audienceTable?.sectionLabel) || PRICING_PAGE_DEFAULTS.audiencesLabel,
    audiencesHeading:
      asTrimmedString(audienceTable?.heading) || PRICING_PAGE_DEFAULTS.audiencesHeading,
    audiences: audiences.length ? audiences : PRICING_PAGE_DEFAULTS.audiences,
    noMinimumNote: includedBodyParagraphs[1] || PRICING_PAGE_DEFAULTS.noMinimumNote,
    ctaHeading: asTrimmedString(cta?.heading) || PRICING_PAGE_DEFAULTS.ctaHeading,
    ctaBody: asTrimmedString(cta?.body) || PRICING_PAGE_DEFAULTS.ctaBody,
    ctaButtonLabel: asTrimmedString(cta?.buttonLabel) || PRICING_PAGE_DEFAULTS.ctaButtonLabel,
    ctaButtonHref: asTrimmedString(cta?.buttonHref) || PRICING_PAGE_DEFAULTS.ctaButtonHref,
    backLinkLabel: PRICING_PAGE_DEFAULTS.backLinkLabel,
    backLinkHref: PRICING_PAGE_DEFAULTS.backLinkHref,
    notReadyHeading:
      asTrimmedString(notReady?.heading) || PRICING_PAGE_DEFAULTS.notReadyHeading,
    notReadyBody: asTrimmedString(notReady?.body) || PRICING_PAGE_DEFAULTS.notReadyBody,
    notReadyButtonLabel:
      asTrimmedString(notReady?.buttonLabel) || PRICING_PAGE_DEFAULTS.notReadyButtonLabel,
    notReadyButtonHref:
      asTrimmedString(notReady?.buttonHref) || PRICING_PAGE_DEFAULTS.notReadyButtonHref,
  };
}
