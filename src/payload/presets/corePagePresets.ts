export type CorePresetKey = 'custom' | 'home' | 'services' | 'about' | 'pricing' | 'contact';

type PresetContent = Record<string, unknown>;
type TableAudience = { label: string; copy: string };
type IncludedItem = { title: string; desc: string };

const HOME_AUDIENCES_DEFAULT: TableAudience[] = [
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
];

const SERVICES_TESTING_ITEMS_DEFAULT = [
  'Defining quality criteria and acceptance standards before development completes',
  'Structured test planning: functional, regression, performance, and edge-case coverage',
  'Release readiness checklists and sign-off processes',
  'Defect triage and prioritisation so teams know what must be fixed before launch',
];

const SERVICES_LAUNCH_ITEMS_DEFAULT = [
  'Market positioning and messaging that reflects what the product actually does',
  'Channel selection grounded in where your target audience can be reached',
  'Launch sequencing and operational readiness — support, onboarding, and infrastructure',
  'Post-launch review process to capture what worked and what to adjust',
];

const PRICING_INCLUDED_ITEMS_DEFAULT: IncludedItem[] = [
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
];

const PRICING_AUDIENCES_DEFAULT: TableAudience[] = [
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
];

function asString(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const parsed = value
    .map((entry) => {
      if (typeof entry === 'string') return entry.trim();
      if (!entry || typeof entry !== 'object') return '';
      const record = entry as Record<string, unknown>;
      if (typeof record.text === 'string') return record.text.trim();
      if (typeof record.value === 'string') return record.value.trim();
      if (typeof record.item === 'string') return record.item.trim();
      return '';
    })
    .filter(Boolean);
  return parsed.length > 0 ? parsed : fallback;
}

function asAudienceArray(value: unknown, fallback: TableAudience[]): TableAudience[] {
  if (!Array.isArray(value)) return fallback;
  const parsed = value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const record = entry as Record<string, unknown>;
      const label = typeof record.label === 'string' ? record.label.trim() : '';
      const copy = typeof record.copy === 'string' ? record.copy.trim() : '';
      if (!label || !copy) return null;
      return { label, copy };
    })
    .filter((entry): entry is TableAudience => !!entry);
  return parsed.length > 0 ? parsed : fallback;
}

function asIncludedItems(value: unknown, fallback: IncludedItem[]): IncludedItem[] {
  if (!Array.isArray(value)) return fallback;
  const parsed = value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const record = entry as Record<string, unknown>;
      const title = typeof record.title === 'string' ? record.title.trim() : '';
      const desc = typeof record.desc === 'string' ? record.desc.trim() : '';
      if (!title || !desc) return null;
      return { title, desc };
    })
    .filter((entry): entry is IncludedItem => !!entry);
  return parsed.length > 0 ? parsed : fallback;
}

function richTextFromParagraphs(paragraphs: string[]): Record<string, unknown> {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: paragraphs
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph) => ({
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          textFormat: 0,
          textStyle: '',
          children: [
            {
              type: 'text',
              version: 1,
              text: paragraph,
              detail: 0,
              mode: 'normal',
              style: '',
              format: 0,
            },
          ],
        })),
    },
  };
}

function buildHomeSections(content: PresetContent): Record<string, unknown>[] {
  const heroHeading = asString(
    content.heroHeading,
    'This framework brings structure to the two most failure-prone stages of product development.',
  );
  const heroSubtext = asString(content.heroSubtext, 'Testing & QA and Launch & Go-to-Market, done right.');
  const problemHeading = asString(content.problemHeading, 'Most product failures happen at the end, not the beginning.');
  const problemBody1 = asString(
    content.problemBody1,
    "Teams spend months building a product, then rush testing, skip structured QA, and launch without a clear go-to-market plan. The result: bugs found by customers, positioning that misses the market, and launches that don't generate expected traction.",
  );
  const problemBody2 = asString(
    content.problemBody2,
    "These aren't execution failures — they're structural ones. The final stages of product development are consistently underprepared. This framework is built specifically to fix that.",
  );
  const testingCardTitle = asString(content.testingCardTitle, 'Testing & QA that catches what matters before release.');
  const testingCardBody = asString(
    content.testingCardBody,
    'A structured approach to verification, quality criteria, and release readiness. Designed to reduce rework and give your team confidence before shipping.',
  );
  const launchCardTitle = asString(content.launchCardTitle, 'Launch & Go-to-Market with a plan that holds up on launch day.');
  const launchCardBody = asString(
    content.launchCardBody,
    'From positioning and channel selection to operational readiness, the framework keeps go-to-market work structured rather than reactive.',
  );
  const audiences = asAudienceArray(content.audiences, HOME_AUDIENCES_DEFAULT);
  const guideCTAHeading = asString(content.guideCTAHeading, 'Get the free guide');
  const guideHighlightText = asString(
    content.guideHighlightText,
    'The 7 Most Common Product Development Mistakes — and How to Avoid Them.',
  );
  const guideCTABody = asString(
    content.guideCTABody,
    'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent to your inbox automatically.',
  );

  return [
    {
      blockType: 'heroSection',
      theme: 'navy',
      eyebrow: 'Product Development Framework',
      heading: heroHeading,
      subheading: heroSubtext,
      primaryCtaLabel: 'Get the Free Guide',
      primaryCtaHref: '/contact#guide',
    },
    {
      blockType: 'richTextSection',
      theme: 'white',
      sectionLabel: 'The Problem',
      heading: problemHeading,
      content: richTextFromParagraphs([problemBody1, problemBody2]),
    },
    {
      blockType: 'ctaSection',
      theme: 'light',
      heading: 'Two stages. Both critical.',
      body: 'This framework focuses on Testing & QA and Launch & Go-to-Market, where product outcomes are won or lost.',
      buttonLabel: 'How it works',
      buttonHref: '/services',
    },
    {
      blockType: 'simpleTableSection',
      theme: 'light',
      heading: 'What We Do',
      columns: [{ label: 'Stage' }, { label: 'Title' }, { label: 'Description' }],
      rows: [
        {
          cells: [
            { value: 'Stage 1' },
            { value: testingCardTitle },
            { value: testingCardBody },
          ],
        },
        {
          cells: [
            { value: 'Stage 2' },
            { value: launchCardTitle },
            { value: launchCardBody },
          ],
        },
      ],
    },
    {
      blockType: 'simpleTableSection',
      theme: 'white',
      sectionLabel: "Who It's For",
      heading: 'Built for teams at every stage',
      columns: [{ label: 'Team' }, { label: 'How it helps' }],
      rows: audiences.map((audience) => ({
        cells: [{ value: audience.label }, { value: audience.copy }],
      })),
    },
    {
      blockType: 'guideFormSection',
      theme: 'navy',
      anchorId: 'guide',
      label: 'Free resource',
      heading: guideCTAHeading,
      highlightText: guideHighlightText,
      body: guideCTABody,
    },
  ];
}

function buildServicesSections(content: PresetContent): Record<string, unknown>[] {
  const heroHeading = asString(content.heroHeading, 'Two framework stages. The two that decide whether a product succeeds.');
  const heroSubtext = asString(
    content.heroSubtext,
    'Testing & QA and Launch & Go-to-Market are where most product failures originate — not in design or development. This framework is built specifically for these stages.',
  );
  const testingBody = asString(
    content.testingBody,
    'Shipping without a structured quality process means issues surface after release — when they’re most expensive to fix. The Testing & QA module establishes clear quality criteria, verification steps, and release gates before code reaches users.',
  );
  const testingItems = asStringArray(content.testingItems, SERVICES_TESTING_ITEMS_DEFAULT);
  const testingWhoFor = asString(
    content.testingWhoFor,
    'Teams that are shipping frequently and catching issues too late, or organisations preparing for a significant launch that cannot afford post-release rework.',
  );
  const launchBody = asString(
    content.launchBody,
    'A product can pass QA and still underperform at launch. Go-to-market failures are often structural — unclear positioning, undefined channels, or a launch day without operational readiness. The Launch & GTM module addresses each of these.',
  );
  const launchItems = asStringArray(content.launchItems, SERVICES_LAUNCH_ITEMS_DEFAULT);
  const launchWhoFor = asString(
    content.launchWhoFor,
    'Startups preparing for a first launch, product teams at SMEs rolling out a new offering, and enterprise groups managing a significant market entry.',
  );
  const whyFrameworkHeading = asString(content.whyFrameworkHeading, 'Why a framework, not a one-off engagement');
  const whyFrameworkBody1 = asString(
    content.whyFrameworkBody1,
    'Ad-hoc approaches to testing and go-to-market work in isolation but don’t build repeatable capability. Each launch starts from scratch, and teams re-learn the same lessons.',
  );
  const whyFrameworkBody2 = asString(
    content.whyFrameworkBody2,
    'A structured framework means your team builds consistent habits — clear criteria before testing begins, defined channels before launch planning starts. It works for startups moving fast and for enterprises that need process rigour across multiple products.',
  );
  const whyFrameworkBody3 = asString(
    content.whyFrameworkBody3,
    'The framework is not prescriptive. It sets the structure; your team fills in the specifics.',
  );
  const ctaHeading = asString(content.ctaHeading, 'Not sure yet?');
  const ctaBody = asString(content.ctaBody, 'Start with the guide — see the kinds of mistakes the framework is designed to prevent.');

  return [
    {
      blockType: 'heroSection',
      theme: 'navy',
      eyebrow: 'Framework Overview',
      heading: heroHeading,
      subheading: heroSubtext,
    },
    {
      blockType: 'richTextSection',
      theme: 'white',
      heading: 'Testing & QA',
      content: richTextFromParagraphs([testingBody, `Who it’s for: ${testingWhoFor}`]),
    },
    {
      blockType: 'simpleTableSection',
      theme: 'white',
      heading: 'What it covers',
      columns: [{ label: 'What it covers' }],
      rows: testingItems.map((item) => ({ cells: [{ value: item }] })),
    },
    {
      blockType: 'richTextSection',
      theme: 'light',
      heading: 'Launch & Go-to-Market',
      content: richTextFromParagraphs([launchBody, `Who it’s for: ${launchWhoFor}`]),
    },
    {
      blockType: 'simpleTableSection',
      theme: 'light',
      heading: 'What it covers',
      columns: [{ label: 'What it covers' }],
      rows: launchItems.map((item) => ({ cells: [{ value: item }] })),
    },
    {
      blockType: 'richTextSection',
      theme: 'white',
      heading: whyFrameworkHeading,
      content: richTextFromParagraphs([whyFrameworkBody1, whyFrameworkBody2, whyFrameworkBody3]),
    },
    {
      blockType: 'ctaSection',
      theme: 'navy',
      heading: ctaHeading,
      body: ctaBody,
      buttonLabel: 'Get the Free Guide',
      buttonHref: '/contact#guide',
    },
  ];
}

function buildAboutSections(content: PresetContent): Record<string, unknown>[] {
  const heroParagraph1 = asString(
    content.heroParagraph1,
    'This product development framework is built around a specific observation: the stages most likely to cause a launch to fail are Testing & QA and Go-to-Market — and they’re consistently the least structured.',
  );
  const heroParagraph2 = asString(
    content.heroParagraph2,
    'Most frameworks cover the full development lifecycle. This framework covers only the final two stages — not because the others don’t matter, but because these two are where structure is most absent and most needed.',
  );
  const heroParagraph3 = asString(
    content.heroParagraph3,
    'The framework is used by teams ranging from early-stage startups to enterprise product groups who need a repeatable, structured process for the stretch of work between build completion and a successful launch.',
  );
  const focusParagraph1 = asString(
    content.focusParagraph1,
    'This framework covers two stages: Testing & QA and Launch & Go-to-Market. That scope is intentional.',
  );
  const focusParagraph2 = asString(
    content.focusParagraph2,
    'Narrowing to two stages means the framework goes deep rather than broad. Each module is specific — built from observed patterns of what goes wrong and why. It is not a general project management tool dressed as a product framework.',
  );
  const focusParagraph3 = asString(
    content.focusParagraph3,
    'The narrow focus is a strength, not a limitation. Teams get a framework that is actually applicable to the work at hand, not a set of generic principles that need extensive interpretation.',
  );
  const missionQuote = asString(
    content.missionQuote,
    'A well-built product deserves a structured path to market — and consistent quality standards before it gets there.',
  );
  const ctaHeading = asString(content.ctaHeading, 'Want to work together?');
  const ctaBody = asString(content.ctaBody, 'Get in touch to discuss your product and team, or start with the free guide.');

  return [
    {
      blockType: 'heroSection',
      theme: 'navy',
      eyebrow: 'About',
      heading: 'Who we are',
      subheading: heroParagraph1,
    },
    {
      blockType: 'richTextSection',
      theme: 'white',
      heading: 'Who we are',
      content: richTextFromParagraphs([heroParagraph2, heroParagraph3]),
    },
    {
      blockType: 'richTextSection',
      theme: 'white',
      heading: 'Narrow by design. Deep by necessity.',
      content: richTextFromParagraphs([focusParagraph1, focusParagraph2, focusParagraph3]),
    },
    {
      blockType: 'ctaSection',
      theme: 'light',
      heading: 'What we believe',
      body: missionQuote,
    },
    {
      blockType: 'ctaSection',
      theme: 'navy',
      heading: ctaHeading,
      body: ctaBody,
      buttonLabel: 'Get in touch',
      buttonHref: '/contact',
    },
  ];
}

function buildPricingSections(content: PresetContent): Record<string, unknown>[] {
  const heroHeading = asString(content.heroHeading, 'Let’s find the right fit for your team.');
  const heroSubtext = asString(
    content.heroSubtext,
    'Pricing is tailored based on your team size and scope. Get in touch and we’ll come back with a proposal.',
  );
  const includedItems = asIncludedItems(content.includedItems, PRICING_INCLUDED_ITEMS_DEFAULT);
  const includedBody = asString(
    content.includedBody,
    'Engagement is straightforward to start. The framework is accessible to teams of any size — no minimum headcount or project scale required.',
  );
  const audiences = asAudienceArray(content.audiences, PRICING_AUDIENCES_DEFAULT);
  const ctaHeading = asString(content.ctaHeading, 'Ready to talk?');
  const ctaBody = asString(content.ctaBody, 'Tell us about your product and team — we’ll come back with a proposal.');
  const notReadyHeading = asString(content.notReadyHeading, 'Not ready to talk yet?');
  const notReadyBody = asString(
    content.notReadyBody,
    'Start with the free guide to get a sense of the problems the framework addresses.',
  );

  return [
    {
      blockType: 'heroSection',
      theme: 'navy',
      eyebrow: 'Pricing',
      heading: heroHeading,
      subheading: heroSubtext,
    },
    {
      blockType: 'simpleTableSection',
      theme: 'white',
      heading: 'Everything you need to ship with confidence.',
      columns: [{ label: 'Included' }, { label: 'Details' }],
      rows: includedItems.map((item) => ({
        cells: [{ value: item.title }, { value: item.desc }],
      })),
    },
    {
      blockType: 'richTextSection',
      theme: 'white',
      content: richTextFromParagraphs([includedBody]),
    },
    {
      blockType: 'simpleTableSection',
      theme: 'light',
      heading: 'No minimum team size. Any stage.',
      columns: [{ label: 'Team' }, { label: 'Best fit' }],
      rows: audiences.map((audience) => ({
        cells: [{ value: audience.label }, { value: audience.copy }],
      })),
    },
    {
      blockType: 'ctaSection',
      theme: 'white',
      heading: ctaHeading,
      body: ctaBody,
      buttonLabel: 'Get in touch',
      buttonHref: '/contact',
    },
    {
      blockType: 'ctaSection',
      theme: 'light',
      heading: notReadyHeading,
      body: notReadyBody,
      buttonLabel: 'Get the free guide',
      buttonHref: '/contact#guide',
    },
  ];
}

function buildContactSections(content: PresetContent): Record<string, unknown>[] {
  const heroHeading = asString(content.heroHeading, 'Let’s talk.');
  const heroSubtext = asString(
    content.heroSubtext,
    'Tell us about your product and team and we’ll get back to you within 2 business days.',
  );
  const guideHighlightText = asString(
    content.guideHighlightText,
    'The 7 Most Common Product Development Mistakes — and How to Avoid Them.',
  );
  const guideBody = asString(
    content.guideBody,
    'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent to your inbox automatically.',
  );
  const inquiryHeading = asString(content.inquiryHeading, 'Send a direct inquiry');
  const inquirySubtext = asString(
    content.inquirySubtext,
    'Tell us about your product, your team, and the challenge you’re working through. We’ll respond within 2 business days.',
  );
  const nextStepsLabel = asString(content.nextStepsLabel, 'What happens next');
  const nextStepsBody = asString(
    content.nextStepsBody,
    'We review every inquiry and respond within 2 business days with initial thoughts or a proposal request.',
  );
  const directEmailLabel = asString(content.directEmailLabel, 'Prefer email directly?');
  const emailAddress = asString(content.emailAddress, 'contact@example.com');
  const linkedinLabel = asString(content.linkedinLabel, 'LinkedIn →');
  const linkedinHref = asString(content.linkedinHref, '');

  return [
    {
      blockType: 'heroSection',
      theme: 'navy',
      eyebrow: 'Contact',
      heading: heroHeading,
      subheading: heroSubtext,
    },
    {
      blockType: 'guideFormSection',
      theme: 'light',
      anchorId: 'guide',
      label: 'Free resource',
      heading: 'Get the free guide',
      highlightText: guideHighlightText,
      body: guideBody,
    },
    {
      blockType: 'inquiryFormSection',
      theme: 'white',
      label: 'Send an inquiry',
      heading: inquiryHeading,
      subtext: inquirySubtext,
      nextStepsLabel,
      nextStepsBody,
      directEmailLabel,
      emailAddress,
      linkedinLabel,
      linkedinHref,
    },
    {
      blockType: 'privacyNoteSection',
      theme: 'light',
      label: 'By submitting this form, you agree to our',
      policyLinkLabel: 'Privacy Policy',
      policyLinkHref: '/privacy',
    },
  ];
}

export function buildCorePresetSections(
  preset: CorePresetKey,
  presetContent: PresetContent,
): Record<string, unknown>[] {
  if (preset === 'home') return buildHomeSections(presetContent);
  if (preset === 'services') return buildServicesSections(presetContent);
  if (preset === 'about') return buildAboutSections(presetContent);
  if (preset === 'pricing') return buildPricingSections(presetContent);
  if (preset === 'contact') return buildContactSections(presetContent);
  return [];
}
