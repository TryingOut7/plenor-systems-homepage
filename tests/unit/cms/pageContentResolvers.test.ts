import { describe, expect, it } from 'vitest';
import {
  HOME_PAGE_DEFAULTS,
  resolveHomePageData,
} from '@/lib/page-content/home';
import {
  CONTACT_PAGE_DEFAULTS,
  resolveContactPageData,
} from '@/lib/page-content/contact';
import {
  ABOUT_PAGE_DEFAULTS,
  resolveAboutPageData,
} from '@/lib/page-content/about';
import {
  SERVICES_PAGE_DEFAULTS,
  resolveServicesPageData,
} from '@/lib/page-content/services';
import {
  PRICING_PAGE_DEFAULTS,
  resolvePricingPageData,
} from '@/lib/page-content/pricing';
import {
  NOT_FOUND_PAGE_DEFAULTS,
  resolveNotFoundPageData,
} from '@/lib/page-content/not-found';

function richText(...paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        children: [{ type: 'text', text }],
      })),
    },
  };
}

describe('page content resolvers', () => {
  it('home resolver falls back to defaults when sections are missing', () => {
    const result = resolveHomePageData([]);
    expect(result).toEqual(HOME_PAGE_DEFAULTS);
  });

  it('home resolver prefers CMS section content when provided', () => {
    const result = resolveHomePageData([
      {
        blockType: 'heroSection',
        eyebrow: 'Builder Eyebrow',
        heading: 'Builder Hero',
        subheading: 'Builder Subtext',
        primaryCtaLabel: 'Start Here',
        primaryCtaHref: '/start',
      },
      {
        blockType: 'richTextSection',
        sectionLabel: 'The Real Problem',
        heading: 'Custom Problem Heading',
        content: richText('Custom body 1', 'Custom body 2'),
      },
      {
        blockType: 'ctaSection',
        heading: 'Custom what-we-do heading',
        buttonLabel: 'Read More',
        buttonHref: '/read-more',
      },
      {
        blockType: 'simpleTableSection',
        heading: 'What We Do',
        rows: [
          {
            cells: [
              { value: 'Phase 1' },
              { value: 'Card 1 title' },
              { value: 'Card 1 copy' },
            ],
          },
          {
            cells: [
              { value: 'Phase 2' },
              { value: 'Card 2 title' },
              { value: 'Card 2 copy' },
            ],
          },
        ],
      },
      {
        blockType: 'simpleTableSection',
        sectionLabel: 'Audience Label',
        heading: 'Audience Heading',
        rows: [
          { cells: [{ value: 'Team A' }, { value: 'Why it helps A' }] },
          { cells: [{ value: 'Team B' }, { value: 'Why it helps B' }] },
        ],
      },
      {
        blockType: 'guideFormSection',
        label: 'Guide Label',
        heading: 'Guide Heading',
        highlightText: 'Guide Highlight',
        body: 'Guide Body',
      },
    ] as never[]);

    expect(result.heroEyebrow).toBe('Builder Eyebrow');
    expect(result.heroHeading).toBe('Builder Hero');
    expect(result.heroSubtext).toBe('Builder Subtext');
    expect(result.heroCtaLabel).toBe('Start Here');
    expect(result.heroCtaHref).toBe('/start');
    expect(result.problemLabel).toBe('The Real Problem');
    expect(result.problemHeading).toBe('Custom Problem Heading');
    expect(result.problemBody1).toBe('Custom body 1');
    expect(result.problemBody2).toBe('Custom body 2');
    expect(result.whatWeDoHeading).toBe('Custom what-we-do heading');
    expect(result.whatWeDoLinkLabel).toBe('Read More');
    expect(result.whatWeDoLinkHref).toBe('/read-more');
    expect(result.testingStageLabel).toBe('Phase 1');
    expect(result.launchStageLabel).toBe('Phase 2');
    expect(result.whoLabel).toBe('Audience Label');
    expect(result.whoHeading).toBe('Audience Heading');
    expect(result.audiences).toEqual([
      { label: 'Team A', copy: 'Why it helps A' },
      { label: 'Team B', copy: 'Why it helps B' },
    ]);
    expect(result.guideLabel).toBe('Guide Label');
    expect(result.guideCTAHeading).toBe('Guide Heading');
    expect(result.guideHighlightText).toBe('Guide Highlight');
    expect(result.guideCTABody).toBe('Guide Body');
  });

  it('contact resolver falls back to defaults when sections are missing', () => {
    const result = resolveContactPageData([]);
    expect(result).toEqual(CONTACT_PAGE_DEFAULTS);
  });

  it('contact resolver prefers CMS section content including privacy note block', () => {
    const result = resolveContactPageData([
      {
        blockType: 'heroSection',
        eyebrow: 'Contact Label',
        heading: 'Contact Heading',
        subheading: 'Contact Subtext',
      },
      {
        blockType: 'guideFormSection',
        label: 'Guide Label',
        heading: 'Guide Heading',
        highlightText: 'Guide Highlight',
        body: 'Guide body text',
      },
      {
        blockType: 'inquiryFormSection',
        label: 'Inquiry Label',
        heading: 'Inquiry Heading',
        subtext: 'Inquiry Subtext',
        nextStepsLabel: 'Next Label',
        nextStepsBody: 'Next Body',
        directEmailLabel: 'Email Label',
        emailAddress: 'hello@example.com',
        linkedinLabel: 'LinkedIn profile',
        linkedinHref: 'https://example.com/linkedin',
      },
      {
        blockType: 'privacyNoteSection',
        label: 'Consent text',
        policyLinkLabel: 'Privacy page',
        policyLinkHref: '/legal/privacy',
      },
    ] as never[]);

    expect(result.heroLabel).toBe('Contact Label');
    expect(result.heroHeading).toBe('Contact Heading');
    expect(result.heroSubtext).toBe('Contact Subtext');
    expect(result.guideLabel).toBe('Guide Label');
    expect(result.inquiryLabel).toBe('Inquiry Label');
    expect(result.directEmailLabel).toBe('Email Label');
    expect(result.emailAddress).toBe('hello@example.com');
    expect(result.privacyNoteLabel).toBe('Consent text');
    expect(result.privacyPolicyLabel).toBe('Privacy page');
    expect(result.privacyPolicyHref).toBe('/legal/privacy');
  });

  it('about resolver falls back to defaults when sections are missing', () => {
    const result = resolveAboutPageData([]);
    expect(result).toEqual(ABOUT_PAGE_DEFAULTS);
  });

  it('about resolver prefers CMS section content when provided', () => {
    const result = resolveAboutPageData([
      {
        blockType: 'heroSection',
        eyebrow: 'About us',
        subheading: 'Custom hero paragraph',
      },
      {
        blockType: 'richTextSection',
        heading: 'Who we are',
        content: richText('Who paragraph 1', 'Who paragraph 2'),
      },
      {
        blockType: 'richTextSection',
        sectionLabel: 'Focus area',
        heading: 'Narrow by design. Deep by necessity.',
        content: richText('Focus 1', 'Focus 2', 'Focus 3'),
      },
      {
        blockType: 'ctaSection',
        heading: 'What we believe',
        body: 'Mission quote',
      },
      {
        blockType: 'ctaSection',
        heading: 'Want to work together?',
        body: 'Custom CTA body',
        buttonLabel: 'Talk to us',
        buttonHref: '/talk',
      },
    ] as never[]);

    expect(result.heroLabel).toBe('About us');
    expect(result.heroHeading).toBe('Who we are');
    expect(result.heroParagraph1).toBe('Custom hero paragraph');
    expect(result.focusLabel).toBe('Focus area');
    expect(result.focusHeading).toBe('Narrow by design. Deep by necessity.');
    expect(result.heroParagraph2).toBe('Who paragraph 1');
    expect(result.heroParagraph3).toBe('Who paragraph 2');
    expect(result.focusParagraph1).toBe('Focus 1');
    expect(result.focusParagraph2).toBe('Focus 2');
    expect(result.focusParagraph3).toBe('Focus 3');
    expect(result.missionLabel).toBe('What we believe');
    expect(result.missionQuote).toBe('Mission quote');
    expect(result.ctaHeading).toBe('Want to work together?');
    expect(result.ctaBody).toBe('Custom CTA body');
    expect(result.ctaPrimaryLabel).toBe('Talk to us');
    expect(result.ctaPrimaryHref).toBe('/talk');
  });

  it('services resolver falls back to defaults when sections are missing', () => {
    const result = resolveServicesPageData([]);
    expect(result).toEqual(SERVICES_PAGE_DEFAULTS);
  });

  it('services resolver prefers CMS section content when provided', () => {
    const result = resolveServicesPageData([
      {
        blockType: 'heroSection',
        eyebrow: 'Services overview',
        heading: 'Custom services heading',
        subheading: 'Custom services subheading',
      },
      {
        blockType: 'richTextSection',
        sectionLabel: 'Phase one',
        heading: 'Testing & QA',
        content: richText('Testing custom body', "Who it's for: Testing team"),
      },
      {
        blockType: 'richTextSection',
        sectionLabel: 'Phase two',
        heading: 'Launch & Go-to-Market',
        content: richText('Launch custom body', "Who it's for: Launch team"),
      },
      {
        blockType: 'richTextSection',
        sectionLabel: 'Method',
        heading: 'Why a framework, not a one-off engagement',
        content: richText('Why body 1', 'Why body 2', 'Why body 3'),
      },
      {
        blockType: 'simpleTableSection',
        heading: 'Testing scope',
        rows: [
          { cells: [{ value: 'Testing item 1' }] },
          { cells: [{ value: 'Testing item 2' }] },
        ],
      },
      {
        blockType: 'simpleTableSection',
        heading: 'Launch scope',
        rows: [
          { cells: [{ value: 'Launch item 1' }] },
          { cells: [{ value: 'Launch item 2' }] },
        ],
      },
      {
        blockType: 'ctaSection',
        heading: 'Not sure yet?',
        body: 'Custom services CTA body',
        buttonLabel: 'Start now',
        buttonHref: '/start',
      },
    ] as never[]);

    expect(result.heroLabel).toBe('Services overview');
    expect(result.heroHeading).toBe('Custom services heading');
    expect(result.heroSubtext).toBe('Custom services subheading');
    expect(result.testingStageLabel).toBe('Phase one');
    expect(result.testingHeading).toBe('Testing & QA');
    expect(result.testingCoverageHeading).toBe('Testing scope');
    expect(result.testingBody).toBe('Testing custom body');
    expect(result.testingWhoHeading).toBe("Who it's for");
    expect(result.testingWhoFor).toBe('Testing team');
    expect(result.testingItems).toEqual(['Testing item 1', 'Testing item 2']);
    expect(result.launchStageLabel).toBe('Phase two');
    expect(result.launchHeading).toBe('Launch & Go-to-Market');
    expect(result.launchCoverageHeading).toBe('Launch scope');
    expect(result.launchBody).toBe('Launch custom body');
    expect(result.launchWhoHeading).toBe("Who it's for");
    expect(result.launchWhoFor).toBe('Launch team');
    expect(result.launchItems).toEqual(['Launch item 1', 'Launch item 2']);
    expect(result.approachLabel).toBe('Method');
    expect(result.whyFrameworkBody1).toBe('Why body 1');
    expect(result.whyFrameworkBody2).toBe('Why body 2');
    expect(result.whyFrameworkBody3).toBe('Why body 3');
    expect(result.ctaHeading).toBe('Not sure yet?');
    expect(result.ctaBody).toBe('Custom services CTA body');
    expect(result.ctaButtonLabel).toBe('Start now');
    expect(result.ctaButtonHref).toBe('/start');
  });

  it('pricing resolver falls back to defaults when sections are missing', () => {
    const result = resolvePricingPageData([]);
    expect(result).toEqual(PRICING_PAGE_DEFAULTS);
  });

  it('pricing resolver prefers CMS section content when provided', () => {
    const result = resolvePricingPageData([
      {
        blockType: 'heroSection',
        eyebrow: 'Investment',
        heading: 'Custom pricing heading',
        subheading: 'Custom pricing subheading',
      },
      {
        blockType: 'simpleTableSection',
        sectionLabel: 'Included details',
        heading: 'Included heading',
        rows: [
          { cells: [{ value: 'Item 1' }, { value: 'Desc 1' }] },
          { cells: [{ value: 'Item 2' }, { value: 'Desc 2' }] },
        ],
      },
      {
        blockType: 'richTextSection',
        content: richText('Custom included body', 'Custom no-minimum note'),
      },
      {
        blockType: 'simpleTableSection',
        sectionLabel: 'Audience section',
        heading: 'Audience heading',
        rows: [
          { cells: [{ value: 'Audience 1' }, { value: 'Copy 1' }] },
          { cells: [{ value: 'Audience 2' }, { value: 'Copy 2' }] },
        ],
      },
      {
        blockType: 'ctaSection',
        heading: 'Ready to talk?',
        body: 'Custom ready body',
        buttonLabel: 'Contact sales',
        buttonHref: '/contact-sales',
      },
      {
        blockType: 'ctaSection',
        heading: 'Not ready to talk yet?',
        body: 'Custom not-ready body',
        buttonLabel: 'Download guide',
        buttonHref: '/guide',
      },
    ] as never[]);

    expect(result.heroLabel).toBe('Investment');
    expect(result.heroHeading).toBe('Custom pricing heading');
    expect(result.heroSubtext).toBe('Custom pricing subheading');
    expect(result.includedLabel).toBe('Included details');
    expect(result.includedHeading).toBe('Included heading');
    expect(result.includedItems).toEqual([
      { title: 'Item 1', desc: 'Desc 1' },
      { title: 'Item 2', desc: 'Desc 2' },
    ]);
    expect(result.includedBody).toBe('Custom included body');
    expect(result.audiencesLabel).toBe('Audience section');
    expect(result.audiencesHeading).toBe('Audience heading');
    expect(result.audiences).toEqual([
      { label: 'Audience 1', copy: 'Copy 1' },
      { label: 'Audience 2', copy: 'Copy 2' },
    ]);
    expect(result.noMinimumNote).toBe('Custom no-minimum note');
    expect(result.ctaHeading).toBe('Ready to talk?');
    expect(result.ctaBody).toBe('Custom ready body');
    expect(result.ctaButtonLabel).toBe('Contact sales');
    expect(result.ctaButtonHref).toBe('/contact-sales');
    expect(result.notReadyHeading).toBe('Not ready to talk yet?');
    expect(result.notReadyBody).toBe('Custom not-ready body');
    expect(result.notReadyButtonLabel).toBe('Download guide');
    expect(result.notReadyButtonHref).toBe('/guide');
  });

  it('not-found resolver uses defaults and supports CMS metadata overrides', () => {
    expect(resolveNotFoundPageData(undefined)).toEqual(NOT_FOUND_PAGE_DEFAULTS);

    const custom = resolveNotFoundPageData({
      notFoundPage: {
        metaTitle: 'Custom 404 Title',
        metaDescription: 'Custom 404 Description',
        heading: 'Custom heading',
        body: 'Custom body',
        buttonLabel: 'Back now',
        buttonHref: '/custom-home',
      },
    } as never);

    expect(custom.metaTitle).toBe('Custom 404 Title');
    expect(custom.metaDescription).toBe('Custom 404 Description');
    expect(custom.heading).toBe('Custom heading');
    expect(custom.body).toBe('Custom body');
    expect(custom.buttonLabel).toBe('Back now');
    expect(custom.buttonHref).toBe('/custom-home');
  });
});
