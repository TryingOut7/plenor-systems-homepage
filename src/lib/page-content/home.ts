import type { PageSection } from '@/payload/cms';

type HomeAudience = { label: string; copy: string };

export interface HomePageData {
  heroEyebrow?: string;
  heroHeading?: string;
  heroSubtext?: string;
  heroCtaLabel?: string;
  heroCtaHref?: string;
  problemLabel?: string;
  problemHeading?: string;
  problemBody1?: string;
  problemBody2?: string;
  whatWeDoLabel?: string;
  whatWeDoHeading?: string;
  whatWeDoLinkLabel?: string;
  whatWeDoLinkHref?: string;
  testingStageLabel?: string;
  testingCardTitle?: string;
  testingCardBody?: string;
  launchStageLabel?: string;
  launchCardTitle?: string;
  launchCardBody?: string;
  whoLabel?: string;
  whoHeading?: string;
  audiences?: HomeAudience[];
  guideLabel?: string;
  guideCTAHeading?: string;
  guideHighlightText?: string;
  guideCTABody?: string;
}

export const HOME_PAGE_DEFAULTS: Required<HomePageData> = {
  heroEyebrow: 'Product Development Framework',
  heroHeading: 'A structured framework for the two most failure-prone stages of product development.',
  heroSubtext: 'Testing & QA and Launch & Go-to-Market, done right.',
  heroCtaLabel: 'Get the Free Guide',
  heroCtaHref: '/contact#guide',
  problemLabel: 'The Problem',
  problemHeading: 'Most product failures happen at the end, not the beginning.',
  problemBody1:
    "Teams spend months building a product, then rush testing, skip structured QA, and launch without a clear go-to-market plan. The result: bugs found by customers, positioning that misses the market, and launches that don't generate expected traction.",
  problemBody2:
    "These aren't execution failures — they're structural ones. The final stages of product development are consistently underprepared. This framework is built specifically to fix that.",
  whatWeDoLabel: 'What We Do',
  whatWeDoHeading: 'Two stages. Both critical.',
  whatWeDoLinkLabel: 'How it works',
  whatWeDoLinkHref: '/services',
  testingStageLabel: 'Stage 1',
  testingCardTitle: 'Testing & QA that catches what matters before release.',
  testingCardBody:
    'A structured approach to verification, quality criteria, and release readiness. Designed to reduce rework and give your team confidence before shipping.',
  launchStageLabel: 'Stage 2',
  launchCardTitle: 'Launch & Go-to-Market with a plan that holds up on launch day.',
  launchCardBody:
    'From positioning and channel selection to operational readiness, the framework keeps go-to-market work structured rather than reactive.',
  whoLabel: "Who It's For",
  whoHeading: 'Built for teams at every stage',
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
  guideLabel: 'Free Resource',
  guideCTAHeading: 'Get the free guide',
  guideHighlightText: 'The 7 Most Common Product Development Mistakes — and How to Avoid Them.',
  guideCTABody:
    'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent to your inbox automatically.',
};

function asTrimmedString(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function findSection(
  sections: PageSection[],
  blockType: string,
  heading?: string,
): PageSection | undefined {
  return sections.find((section) => {
    if (section.blockType !== blockType) return false;
    if (!heading) return true;
    return String(section.heading || '').trim() === heading;
  });
}

function getRows(section: PageSection | undefined): unknown[] {
  if (!section || !Array.isArray(section.rows)) return [];
  return section.rows;
}

function getCellValue(row: unknown, index: number): string {
  if (!row || typeof row !== 'object') return '';
  const cells = Array.isArray((row as Record<string, unknown>).cells)
    ? ((row as Record<string, unknown>).cells as unknown[])
    : [];
  const cell = cells[index];
  if (!cell || typeof cell !== 'object') return '';
  const value = (cell as Record<string, unknown>).value;
  return typeof value === 'string' ? value : '';
}

function getRichTextParagraphs(section: PageSection | undefined): string[] {
  if (!section || !section.content || typeof section.content !== 'object') return [];
  const root = (section.content as Record<string, unknown>).root;
  if (!root || typeof root !== 'object') return [];
  const children = Array.isArray((root as Record<string, unknown>).children)
    ? ((root as Record<string, unknown>).children as unknown[])
    : [];

  const readText = (node: unknown): string => {
    if (!node || typeof node !== 'object') return '';
    const record = node as Record<string, unknown>;
    if (typeof record.text === 'string') return record.text;
    if (!Array.isArray(record.children)) return '';
    return record.children.map(readText).join('');
  };

  return children
    .map(readText)
    .map((text) => text.trim())
    .filter(Boolean);
}

export function resolveHomePageData(
  sections: PageSection[] | null | undefined,
): Required<HomePageData> {
  const safeSections = Array.isArray(sections) ? sections : [];

  const hero = findSection(safeSections, 'heroSection');
  const problem =
    findSection(safeSections, 'richTextSection', HOME_PAGE_DEFAULTS.problemHeading) ||
    findSection(safeSections, 'richTextSection');
  const summaryCta =
    findSection(safeSections, 'ctaSection', HOME_PAGE_DEFAULTS.whatWeDoHeading) ||
    findSection(safeSections, 'ctaSection');
  const whatWeDo =
    findSection(safeSections, 'simpleTableSection', HOME_PAGE_DEFAULTS.whatWeDoLabel) ||
    safeSections.find((section) => section.blockType === 'simpleTableSection');
  const audiencesSection =
    findSection(safeSections, 'simpleTableSection', HOME_PAGE_DEFAULTS.whoHeading) ||
    safeSections.find(
      (section) =>
        section.blockType === 'simpleTableSection' &&
        String(section.heading || '').trim() !== String(whatWeDo?.heading || '').trim(),
    );
  const guide = findSection(safeSections, 'guideFormSection');

  const problemParagraphs = getRichTextParagraphs(problem);
  const whatRows = getRows(whatWeDo);
  const audienceRows = getRows(audiencesSection);

  const mappedAudiences = audienceRows
    .map((row) => ({
      label: getCellValue(row, 0),
      copy: getCellValue(row, 1),
    }))
    .filter((entry) => entry.label && entry.copy);

  const problemLabel = asTrimmedString(problem?.sectionLabel);
  const whatWeDoLabel = asTrimmedString(whatWeDo?.heading);
  const whatWeDoHeading = asTrimmedString(summaryCta?.heading);
  const whatWeDoLinkLabel = asTrimmedString(summaryCta?.buttonLabel);
  const whatWeDoLinkHref = asTrimmedString(summaryCta?.buttonHref);
  const whoLabel = asTrimmedString(audiencesSection?.sectionLabel);
  const whoHeading = asTrimmedString(audiencesSection?.heading);

  return {
    ...HOME_PAGE_DEFAULTS,
    heroEyebrow: asTrimmedString(hero?.eyebrow) || HOME_PAGE_DEFAULTS.heroEyebrow,
    heroHeading: asTrimmedString(hero?.heading) || HOME_PAGE_DEFAULTS.heroHeading,
    heroSubtext: asTrimmedString(hero?.subheading) || HOME_PAGE_DEFAULTS.heroSubtext,
    heroCtaLabel: asTrimmedString(hero?.primaryCtaLabel) || HOME_PAGE_DEFAULTS.heroCtaLabel,
    heroCtaHref: asTrimmedString(hero?.primaryCtaHref) || HOME_PAGE_DEFAULTS.heroCtaHref,
    problemLabel: problemLabel || HOME_PAGE_DEFAULTS.problemLabel,
    problemHeading: asTrimmedString(problem?.heading) || HOME_PAGE_DEFAULTS.problemHeading,
    problemBody1: problemParagraphs[0] || HOME_PAGE_DEFAULTS.problemBody1,
    problemBody2: problemParagraphs[1] || HOME_PAGE_DEFAULTS.problemBody2,
    whatWeDoLabel: whatWeDoLabel || HOME_PAGE_DEFAULTS.whatWeDoLabel,
    whatWeDoHeading: whatWeDoHeading || HOME_PAGE_DEFAULTS.whatWeDoHeading,
    whatWeDoLinkLabel: whatWeDoLinkLabel || HOME_PAGE_DEFAULTS.whatWeDoLinkLabel,
    whatWeDoLinkHref: whatWeDoLinkHref || HOME_PAGE_DEFAULTS.whatWeDoLinkHref,
    testingStageLabel: getCellValue(whatRows[0], 0) || HOME_PAGE_DEFAULTS.testingStageLabel,
    testingCardTitle: getCellValue(whatRows[0], 1) || HOME_PAGE_DEFAULTS.testingCardTitle,
    testingCardBody: getCellValue(whatRows[0], 2) || HOME_PAGE_DEFAULTS.testingCardBody,
    launchStageLabel: getCellValue(whatRows[1], 0) || HOME_PAGE_DEFAULTS.launchStageLabel,
    launchCardTitle: getCellValue(whatRows[1], 1) || HOME_PAGE_DEFAULTS.launchCardTitle,
    launchCardBody: getCellValue(whatRows[1], 2) || HOME_PAGE_DEFAULTS.launchCardBody,
    whoLabel: whoLabel || HOME_PAGE_DEFAULTS.whoLabel,
    whoHeading: whoHeading || HOME_PAGE_DEFAULTS.whoHeading,
    audiences: mappedAudiences.length ? mappedAudiences : HOME_PAGE_DEFAULTS.audiences,
    guideLabel: asTrimmedString(guide?.label) || HOME_PAGE_DEFAULTS.guideLabel,
    guideCTAHeading: asTrimmedString(guide?.heading) || HOME_PAGE_DEFAULTS.guideCTAHeading,
    guideHighlightText:
      asTrimmedString(guide?.highlightText) || HOME_PAGE_DEFAULTS.guideHighlightText,
    guideCTABody: asTrimmedString(guide?.body) || HOME_PAGE_DEFAULTS.guideCTABody,
  };
}

