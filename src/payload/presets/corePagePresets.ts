export type CorePresetKey = 'custom' | 'home' | 'services' | 'about' | 'pricing' | 'contact';

type PresetContent = Record<string, unknown>;
type TableAudience = { label: string; copy: string };
type IncludedItem = { title: string; desc: string };

const HOME_AUDIENCES_DEFAULT: TableAudience[] = [
  {
    label: 'Startup Founders',
    copy: 'Move beyond an idea without immediately assembling a complete definition team.',
  },
  {
    label: 'Growing Businesses',
    copy: 'Create a stronger starting point for a new product or internal system.',
  },
  {
    label: 'Business-Led Teams',
    copy: 'Turn domain knowledge into direction that AI tools and engineering resources can use.',
  },
];

const SERVICES_TESTING_ITEMS_DEFAULT = [
  'Product purpose and business value',
  'Customer and user needs',
  'Major capabilities and boundaries',
  'Decisions requiring business judgment',
];

const SERVICES_LAUNCH_ITEMS_DEFAULT = [
  'User journeys and workflows',
  'Experience expectations',
  'System direction',
  'Constraints and dependencies',
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
    'Turn Your Business Idea into a Definition Ready to Build',
  );
  const heroSubtext = asString(
    content.heroSubtext,
    'Plenor helps founders and growing businesses create product definitions, experience direction, and system specifications that AI tools and engineering teams can use.\n\nSystem-driven. Human-validated. Ready for implementation.',
  );
  const audiences = asAudienceArray(content.audiences, HOME_AUDIENCES_DEFAULT);

  return [
    {
      blockType: 'heroSection',
      structuralKey: 'home-hero',
      theme: 'navy',
      eyebrow: 'GOVERNED DEFINITION PLATFORM',
      heading: heroHeading,
      subheading: heroSubtext,
      primaryCtaLabel: 'Discuss Your Product',
      primaryCtaHref: '/contact',
    },
    {
      blockType: 'richTextSection',
      structuralKey: 'home-problem',
      theme: 'white',
      heading: 'Focus on the Business You Want to Build',
      content: richTextFromParagraphs([
        'You bring the vision, customer understanding, and business decisions. Plenor provides the structured definition needed to move toward implementation.',
        'Focus on the Business: Concentrate on the market, customer problem, and decisions that only you can make.',
        'Reduce Early Overhead: Move forward without first building a complete internal product and system-definition capability.',
        'Guide Development Clearly: Give AI tools, internal engineers, or external development partners a stronger starting point.',
      ]),
    },
    {
      blockType: 'ctaSection',
      structuralKey: 'home-cta',
      theme: 'navy',
      heading: 'AI Can Generate Code. It Still Needs Clear Direction.',
      body: 'A business idea may still be too incomplete or ambiguous to guide software development. Plenor turns business knowledge into a clearer product and system definition that AI tools, internal engineers, and external development partners can act on.\n\nClearer Intent: Define what the product should achieve and who it should serve.\n\nGreater Consistency: Connect important product, experience, and system decisions.\n\nEarlier Visibility: Surface unresolved questions and risks before implementation.\n\nExecution-ready means clear, coherent, and complete enough to guide implementation—not perfect or final.',
    },
    {
      blockType: 'simpleTableSection',
      structuralKey: 'home-table-stages',
      theme: 'light',
      heading: 'A Governed Platform, Professionally Validated',
      columns: [{ label: 'Principle' }, { label: 'What it means' }],
      rows: [
        {
          cells: [{ value: 'System-Driven' }, { value: 'A governed platform provides structure and consistency.' }],
        },
        {
          cells: [{ value: 'Human-Validated' }, { value: 'Experienced professionals review and refine the definition where judgment matters.' }],
        },
        {
          cells: [{ value: 'Ready for Implementation' }, { value: 'Use the result with AI tools, internal engineers, or an external development partner.' }],
        },
      ],
    },
    {
      blockType: 'simpleTableSection',
      structuralKey: 'home-table-audiences',
      theme: 'white',
      heading: 'Who Plenor Is Built For',
      columns: [{ label: 'Audience' }, { label: 'How Plenor helps' }],
      rows: audiences.map((audience) => ({
        cells: [{ value: audience.label }, { value: audience.copy }],
      })),
    },
    {
      blockType: 'formSection',
      structuralKey: 'home-guide-form',
      theme: 'navy',
      heading: 'Give Your Product a Stronger Starting Point',
      subheading: 'Turn your business idea into a definition ready to guide implementation.',
      buttonLabel: 'Discuss Your Product',
      buttonHref: '/contact',
    },
  ];
}

function buildServicesSections(content: PresetContent): Record<string, unknown>[] {
  const heroHeading = asString(content.heroHeading, 'Create a Stronger Foundation for Software Development');
  const heroSubtext = asString(
    content.heroSubtext,
    'Turn business ideas and domain knowledge into clear product definitions, experience direction, and system specifications that AI tools and engineering teams can use.',
  );
  const testingBody = asString(
    content.testingBody,
    'Plenor helps turn the business vision into a focused product definition that reflects the opportunity, the people it must serve, and the outcomes it should support.',
  );
  const testingItems = asStringArray(content.testingItems, SERVICES_TESTING_ITEMS_DEFAULT);
  const launchBody = asString(
    content.launchBody,
    'Plenor connects the product vision to how the product should work and what the supporting system must provide.',
  );
  const launchItems = asStringArray(content.launchItems, SERVICES_LAUNCH_ITEMS_DEFAULT);
  const whyFrameworkHeading = asString(content.whyFrameworkHeading, 'Why a Governed Definition Platform');
  const whyFrameworkBody1 = asString(
    content.whyFrameworkBody1,
    'Prompts, documents, and conversations can each provide useful input, but they do not automatically create one coherent basis for implementation. Plenor uses a governed approach to organize important product and system decisions consistently, make unresolved issues visible, and apply professional review where judgment is needed.',
  );
  const whyFrameworkBody2 = asString(
    content.whyFrameworkBody2,
    'More Than a Prompt: Create coherent direction across product, experience, and system decisions.',
  );
  const whyFrameworkBody3 = asString(
    content.whyFrameworkBody3,
    'More Than Documents: Produce a connected definition that can guide real implementation work.\n\nLower Overhead: Avoid building every foundational definition capability internally before development can begin.',
  );
  const ctaHeading = asString(content.ctaHeading, 'Use the Definition Your Way');
  const ctaBody = asString(content.ctaBody, 'Use the Plenor definition with AI code-generation tools, your own engineers, or an external development partner. Plenor does not require a particular technology, vendor, or implementation model.');

  return [
    {
      blockType: 'heroSection',
      structuralKey: 'services-hero',
      theme: 'navy',
      eyebrow: 'PLENOR SERVICES',
      heading: heroHeading,
      subheading: heroSubtext,
      primaryCtaLabel: 'Discuss Your Product',
      primaryCtaHref: '/contact',
    },
    {
      blockType: 'richTextSection',
      structuralKey: 'services-testing-body',
      theme: 'white',
      heading: 'Define the Product',
      content: richTextFromParagraphs([testingBody, 'Outcome: A clearer product direction for further design and implementation.']),
    },
    {
      blockType: 'simpleTableSection',
      structuralKey: 'services-testing-coverage',
      theme: 'white',
      heading: 'What the Definition Addresses',
      columns: [{ label: 'Definition area' }],
      rows: testingItems.map((item) => ({ cells: [{ value: item }] })),
    },
    {
      blockType: 'richTextSection',
      structuralKey: 'services-launch-body',
      theme: 'light',
      heading: 'Define the Experience and System',
      content: richTextFromParagraphs([launchBody, 'Outcome: A coherent definition for AI tools, internal engineers, or external development partners.']),
    },
    {
      blockType: 'simpleTableSection',
      structuralKey: 'services-launch-coverage',
      theme: 'light',
      heading: 'What the Definition Addresses',
      columns: [{ label: 'Definition area' }],
      rows: launchItems.map((item) => ({ cells: [{ value: item }] })),
    },
    {
      blockType: 'richTextSection',
      structuralKey: 'services-why-framework',
      theme: 'white',
      heading: whyFrameworkHeading,
      content: richTextFromParagraphs([whyFrameworkBody1, whyFrameworkBody2, whyFrameworkBody3]),
    },
    {
      blockType: 'ctaSection',
      structuralKey: 'services-cta',
      theme: 'navy',
      heading: ctaHeading,
      body: ctaBody,
      buttonLabel: 'Discuss Your Product',
      buttonHref: '/contact',
    },
  ];
}

function buildAboutSections(content: PresetContent): Record<string, unknown>[] {
  const heroParagraph1 = asString(
    content.heroParagraph1,
    'Plenor helps founders and growing businesses create the product and system definition needed to move toward implementation.',
  );
  const heroParagraph2 = asString(
    content.heroParagraph2,
    'Founders and business leaders often understand the opportunity, customer problem, and business they want to build.',
  );
  const heroParagraph3 = asString(
    content.heroParagraph3,
    'What they may not have is the product and system-definition capability needed to turn that knowledge into reliable software development. Building that capability internally can require significant time, expertise, and overhead.\n\nPlenor provides a more accessible and disciplined alternative.',
  );
  const focusParagraph1 = asString(
    content.focusParagraph1,
    'Plenor is led by professionals with extensive experience turning business ideas into products, user experiences, and software systems.',
  );
  const focusParagraph2 = asString(
    content.focusParagraph2,
    'That experience showed that strong software requires more than a strong idea. It also requires clear product direction, coherent system definition, and informed professional judgment.',
  );
  const focusParagraph3 = asString(
    content.focusParagraph3,
    '',
  );
  const missionQuote = asString(
    content.missionQuote,
    'Founders Should Focus on the Business: Their highest-value contribution is the vision, customer understanding, and key business decisions.\n\nAI Still Needs Direction: AI tools depend on the quality of the product and system definition they receive.\n\nSystem-Driven Is Not Human-Free: The platform provides structure; professional review provides judgment.',
  );
  const ctaHeading = asString(content.ctaHeading, 'System-Driven. Human-Validated. Ready for Implementation.');
  const ctaBody = asString(content.ctaBody, 'Move forward with a clearer product and system definition.');

  return [
    {
      blockType: 'heroSection',
      structuralKey: 'about-hero',
      theme: 'navy',
      eyebrow: 'ABOUT PLENOR',
      heading: 'Closing the Gap Between Business Ideas and Software Development',
      subheading: heroParagraph1,
    },
    {
      blockType: 'richTextSection',
      structuralKey: 'about-who',
      theme: 'white',
      heading: 'Why Plenor Exists',
      content: richTextFromParagraphs([heroParagraph2, heroParagraph3]),
    },
    {
      blockType: 'richTextSection',
      structuralKey: 'about-focus',
      theme: 'white',
      heading: 'Experience Behind the Platform',
      content: richTextFromParagraphs([focusParagraph1, focusParagraph2, focusParagraph3]),
    },
    {
      blockType: 'ctaSection',
      structuralKey: 'about-mission',
      theme: 'light',
      heading: 'What Guides Plenor',
      body: missionQuote,
    },
    {
      blockType: 'ctaSection',
      structuralKey: 'about-cta',
      theme: 'navy',
      heading: ctaHeading,
      body: ctaBody,
      buttonLabel: 'Discuss Your Product',
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
      structuralKey: 'pricing-hero',
      theme: 'navy',
      eyebrow: 'Pricing',
      heading: heroHeading,
      subheading: heroSubtext,
    },
    {
      blockType: 'simpleTableSection',
      structuralKey: 'pricing-table-included',
      theme: 'white',
      heading: 'Everything you need to ship with confidence.',
      columns: [{ label: 'Included' }, { label: 'Details' }],
      rows: includedItems.map((item) => ({
        cells: [{ value: item.title }, { value: item.desc }],
      })),
    },
    {
      blockType: 'richTextSection',
      structuralKey: 'pricing-included-body',
      theme: 'white',
      content: richTextFromParagraphs([includedBody]),
    },
    {
      blockType: 'simpleTableSection',
      structuralKey: 'pricing-table-audiences',
      theme: 'light',
      heading: 'No minimum team size. Any stage.',
      columns: [{ label: 'Team' }, { label: 'Best fit' }],
      rows: audiences.map((audience) => ({
        cells: [{ value: audience.label }, { value: audience.copy }],
      })),
    },
    {
      blockType: 'ctaSection',
      structuralKey: 'pricing-cta-ready',
      theme: 'white',
      heading: ctaHeading,
      body: ctaBody,
      buttonLabel: 'Get in touch',
      buttonHref: '/contact',
    },
    {
      blockType: 'ctaSection',
      structuralKey: 'pricing-cta-not-ready',
      theme: 'light',
      heading: notReadyHeading,
      body: notReadyBody,
      buttonLabel: 'Get the free guide',
      buttonHref: '/contact#guide',
    },
  ];
}

function buildContactSections(content: PresetContent): Record<string, unknown>[] {
  const heroHeading = asString(content.heroHeading, 'Discuss Your Product');
  const heroSubtext = asString(
    content.heroSubtext,
    'Tell us about the business idea, product, or system you are trying to define.',
  );
  const inquiryHeading = asString(content.inquiryHeading, 'Start the Conversation');
  const inquirySubtext = asString(
    content.inquirySubtext,
    'An initial discussion will help determine whether Plenor is appropriate for your initiative.',
  );

  return [
    {
      blockType: 'heroSection',
      structuralKey: 'contact-hero',
      theme: 'navy',
      eyebrow: 'CONTACT',
      heading: heroHeading,
      subheading: heroSubtext,
    },
    {
      blockType: 'formSection',
      structuralKey: 'contact-guide-form',
      theme: 'light',
      isHidden: true,
    },
    {
      blockType: 'formSection',
      structuralKey: 'contact-inquiry-form',
      theme: 'white',
      heading: inquiryHeading,
      subheading: inquirySubtext,
      contactEmail: 'contact@plenor.ai',
      form: 'inquiry',
      formAlias: 'inquiry',
    },
    {
      blockType: 'privacyNoteSection',
      structuralKey: 'contact-privacy-note',
      isHidden: true,
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
