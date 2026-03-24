import type { PageSection } from '@/payload/cms';
import {
  asTrimmedString,
  findSection,
  findSectionsByType,
  getCellValue,
  getRichTextParagraphs,
  getRows,
} from '@/lib/page-content/helpers';

export interface ServicesPageData {
  heroLabel?: string;
  heroHeading?: string;
  heroSubtext?: string;
  testingStageLabel?: string;
  testingHeading?: string;
  testingCoverageHeading?: string;
  testingWhoHeading?: string;
  testingBody?: string;
  testingItems?: string[];
  testingWhoFor?: string;
  launchStageLabel?: string;
  launchHeading?: string;
  launchCoverageHeading?: string;
  launchWhoHeading?: string;
  launchBody?: string;
  launchItems?: string[];
  launchWhoFor?: string;
  approachLabel?: string;
  whyFrameworkHeading?: string;
  whyFrameworkBody1?: string;
  whyFrameworkBody2?: string;
  whyFrameworkBody3?: string;
  ctaHeading?: string;
  ctaBody?: string;
  ctaButtonLabel?: string;
  ctaButtonHref?: string;
}

export const SERVICES_PAGE_DEFAULTS: Required<ServicesPageData> = {
  heroLabel: 'Framework Overview',
  heroHeading: 'Two framework stages. The two that decide whether a product succeeds.',
  heroSubtext:
    'Testing & QA and Launch & Go-to-Market are where most product failures originate — not in design or development. This framework is built specifically for these stages.',
  testingStageLabel: 'Stage 1',
  testingHeading: 'Testing & QA',
  testingCoverageHeading: 'What it covers',
  testingWhoHeading: "Who it's for",
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
  launchStageLabel: 'Stage 2',
  launchHeading: 'Launch & Go-to-Market',
  launchCoverageHeading: 'What it covers',
  launchWhoHeading: "Who it's for",
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
  approachLabel: 'The Approach',
  whyFrameworkHeading: 'Why a framework, not a one-off engagement',
  whyFrameworkBody1:
    'Ad-hoc approaches to testing and go-to-market work in isolation but don’t build repeatable capability. Each launch starts from scratch, and teams re-learn the same lessons.',
  whyFrameworkBody2:
    'A structured framework means your team builds consistent habits — clear criteria before testing begins, defined channels before launch planning starts. It works for startups moving fast and for enterprises that need process rigour across multiple products.',
  whyFrameworkBody3:
    'The framework is not prescriptive. It sets the structure; your team fills in the specifics.',
  ctaHeading: 'Not sure yet?',
  ctaBody: 'Start with the guide — see the kinds of mistakes the framework is designed to prevent.',
  ctaButtonLabel: 'Get the Free Guide',
  ctaButtonHref: '/contact#guide',
};

function removeWhoForPrefix(value: string): string {
  return value
    .replace(/^Who it['’]s for:\s*/i, '')
    .replace(/^Who it’s for:\s*/i, '')
    .trim();
}

export function resolveServicesPageData(
  sections: PageSection[] | null | undefined,
): Required<ServicesPageData> {
  const safeSections = Array.isArray(sections) ? sections : [];
  const hero = findSection(safeSections, 'heroSection');
  const testingSection = findSection(safeSections, 'richTextSection', 'Testing & QA');
  const launchSection = findSection(safeSections, 'richTextSection', 'Launch & Go-to-Market');
  const whySection = findSection(
    safeSections,
    'richTextSection',
    'Why a framework, not a one-off engagement',
  );

  const whatCoverTables = findSectionsByType(safeSections, 'simpleTableSection').filter(
    (section) => String(section.heading || '').trim() === 'What it covers',
  );
  const simpleTables = findSectionsByType(safeSections, 'simpleTableSection');
  const coverageTables = whatCoverTables.length >= 2 ? whatCoverTables : simpleTables.slice(0, 2);
  const testingTable = coverageTables[0];
  const launchTable = coverageTables[1];

  const testingItemsRows = getRows(testingTable);
  const launchItemsRows = getRows(launchTable);

  const testingParagraphs = getRichTextParagraphs(testingSection);
  const launchParagraphs = getRichTextParagraphs(launchSection);
  const whyParagraphs = getRichTextParagraphs(whySection);

  const cta = findSection(safeSections, 'ctaSection', 'Not sure yet?');

  const mappedTestingItems = testingItemsRows
    .map((row) => getCellValue(row, 0))
    .filter(Boolean);
  const mappedLaunchItems = launchItemsRows
    .map((row) => getCellValue(row, 0))
    .filter(Boolean);

  return {
    ...SERVICES_PAGE_DEFAULTS,
    heroLabel:
      asTrimmedString(hero?.eyebrow) ||
      asTrimmedString(hero?.sectionLabel) ||
      SERVICES_PAGE_DEFAULTS.heroLabel,
    heroHeading: asTrimmedString(hero?.heading) || SERVICES_PAGE_DEFAULTS.heroHeading,
    heroSubtext:
      asTrimmedString(hero?.subheading) || SERVICES_PAGE_DEFAULTS.heroSubtext,
    testingStageLabel:
      asTrimmedString(testingSection?.sectionLabel) || SERVICES_PAGE_DEFAULTS.testingStageLabel,
    testingHeading: asTrimmedString(testingSection?.heading) || SERVICES_PAGE_DEFAULTS.testingHeading,
    testingCoverageHeading:
      asTrimmedString(testingTable?.heading) || SERVICES_PAGE_DEFAULTS.testingCoverageHeading,
    testingWhoHeading: SERVICES_PAGE_DEFAULTS.testingWhoHeading,
    testingBody: testingParagraphs[0] || SERVICES_PAGE_DEFAULTS.testingBody,
    testingWhoFor: testingParagraphs[1]
      ? removeWhoForPrefix(testingParagraphs[1])
      : SERVICES_PAGE_DEFAULTS.testingWhoFor,
    testingItems: mappedTestingItems.length
      ? mappedTestingItems
      : SERVICES_PAGE_DEFAULTS.testingItems,
    launchStageLabel:
      asTrimmedString(launchSection?.sectionLabel) || SERVICES_PAGE_DEFAULTS.launchStageLabel,
    launchHeading: asTrimmedString(launchSection?.heading) || SERVICES_PAGE_DEFAULTS.launchHeading,
    launchCoverageHeading:
      asTrimmedString(launchTable?.heading) || SERVICES_PAGE_DEFAULTS.launchCoverageHeading,
    launchWhoHeading: SERVICES_PAGE_DEFAULTS.launchWhoHeading,
    launchBody: launchParagraphs[0] || SERVICES_PAGE_DEFAULTS.launchBody,
    launchWhoFor: launchParagraphs[1]
      ? removeWhoForPrefix(launchParagraphs[1])
      : SERVICES_PAGE_DEFAULTS.launchWhoFor,
    launchItems: mappedLaunchItems.length ? mappedLaunchItems : SERVICES_PAGE_DEFAULTS.launchItems,
    approachLabel:
      asTrimmedString(whySection?.sectionLabel) || SERVICES_PAGE_DEFAULTS.approachLabel,
    whyFrameworkHeading:
      asTrimmedString(whySection?.heading) || SERVICES_PAGE_DEFAULTS.whyFrameworkHeading,
    whyFrameworkBody1: whyParagraphs[0] || SERVICES_PAGE_DEFAULTS.whyFrameworkBody1,
    whyFrameworkBody2: whyParagraphs[1] || SERVICES_PAGE_DEFAULTS.whyFrameworkBody2,
    whyFrameworkBody3: whyParagraphs[2] || SERVICES_PAGE_DEFAULTS.whyFrameworkBody3,
    ctaHeading: asTrimmedString(cta?.heading) || SERVICES_PAGE_DEFAULTS.ctaHeading,
    ctaBody: asTrimmedString(cta?.body) || SERVICES_PAGE_DEFAULTS.ctaBody,
    ctaButtonLabel: asTrimmedString(cta?.buttonLabel) || SERVICES_PAGE_DEFAULTS.ctaButtonLabel,
    ctaButtonHref: asTrimmedString(cta?.buttonHref) || SERVICES_PAGE_DEFAULTS.ctaButtonHref,
  };
}
