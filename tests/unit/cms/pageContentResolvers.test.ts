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

