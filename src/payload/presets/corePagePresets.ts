export type CorePresetKey = 'custom' | 'home' | 'services' | 'about' | 'pricing' | 'contact';

type PresetContent = Record<string, unknown>;
type TableAudience = { label: string; copy: string };
type IncludedItem = { title: string; desc: string };

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
    'AI can build fast. Plenor helps build the right thing, the right way.',
  );
  const heroSubtext = asString(
    content.heroSubtext,
    'Plenor helps develop your business idea into clear product definitions, workflows, and functional specifications before building begins.',
  );

  return [
    {
      blockType: 'heroSection',
      structuralKey: 'home-hero',
      theme: 'white',
      size: 'compact',
      customClassName: 'marketing-hero home-marketing-hero',
      textAlignment: 'left',
      eyebrow: 'From business idea to clear product definitions and specifications',
      heading: heroHeading,
      subheading: heroSubtext,
      primaryCtaLabel: 'Explore Services',
      primaryCtaHref: '/services',
      secondaryCtaLabel: 'Contact Plenor',
      secondaryCtaHref: '/contact',
    },
    { blockType: 'dividerSection', structuralKey: 'home-divider-1' },
    {
      blockType: 'richTextSection',
      structuralKey: 'home-problem',
      theme: 'white',
      size: 'regular',
      customClassName: 'narrative-section content-boundary-aligned-section home-problem-section',
      sectionLabel: 'The Problem',
      heading: 'AI is powerful, but it will build through ambiguity—even when it is wrong.',
      content: richTextFromParagraphs([
        'When definitions or requirements are unclear, Gen AI tools fill the gaps with assumptions. The result may look polished but still miss the business need.',
        'Strong product definitions and functional specifications require focused thinking and product management and business analysis expertise that many founders and startup teams may not have in-house.',
      ]),
    },
    { blockType: 'dividerSection', structuralKey: 'home-divider-2' },
    {
      blockType: 'featureGridSection',
      structuralKey: 'home-solution',
      theme: 'white',
      size: 'regular',
      customClassName: 'comparison-section',
      sectionLabel: 'The Solution',
      heading: 'You bring the product vision. Plenor helps turn it into a defined foundation.',
      subheading: 'You know your business, audience, and problem. The Plenor platform helps turn that knowledge into a defined product foundation.',
      columns: '2',
      features: [
        {
          title: 'You provide the product intent and direction',
          description: 'You define the product intent — the problem, audience, outcomes, priorities, and constraints.',
        },
        {
          title: 'Plenor helps you define the product foundations',
          description: 'The Plenor platform applies industry standards and best practices to help develop product definitions, workflows, and functional specifications.',
        },
      ],
    },
    { blockType: 'dividerSection', structuralKey: 'home-divider-3' },
    {
      blockType: 'featureGridSection',
      structuralKey: 'home-capabilities',
      theme: 'white',
      size: 'regular',
      customClassName: 'capability-card-section',
      sectionLabel: 'What Plenor Helps Define',
      heading: 'Product definition, product experience, and functional specifications',
      subheading: 'Plenor helps create clearer, more consistent definitions and requirements for AI-assisted or traditional implementation.',
      columns: '3',
      features: [
        { title: 'Business and Product Definition', description: 'Helps define what is being created, who it serves, and what it is intended to achieve.' },
        { title: 'Product Experience and Workflow Definition', description: 'Helps define how users move through the product and how the product should behave.' },
        { title: 'Functional Specifications', description: 'Helps define what the product must do to guide implementation.' },
      ],
      actionLabel: 'Explore Services',
      actionHref: '/services',
      actionVariant: 'link',
    },
  ];
}

function buildServicesSections(content: PresetContent): Record<string, unknown>[] {
  const heroHeading = asString(
    content.heroHeading,
    'Plenor accelerates the development of product definitions and functional specifications.',
  );
  const heroSubtext = asString(
    content.heroSubtext,
    'You bring the product intent. Plenor helps turn it into clear product definitions, workflows, and functional specifications for Gen AI tools and implementation teams.',
  );

  return [
    {
      blockType: 'heroSection',
      structuralKey: 'services-hero',
      theme: 'white',
      size: 'compact',
      customClassName: 'marketing-hero',
      textAlignment: 'left',
      eyebrow: 'PLENOR SERVICES',
      heading: heroHeading,
      subheading: heroSubtext,
      primaryCtaLabel: 'Discuss Your Product',
      primaryCtaHref: '/contact',
    },
    { blockType: 'dividerSection', structuralKey: 'services-divider-1' },
    {
      blockType: 'featureGridSection',
      structuralKey: 'services-definition-levels',
      theme: 'white',
      size: 'regular',
      customClassName: 'capability-card-section',
      heading: 'From Product Intent to Functional Specifications',
      subheading: 'Plenor supports three connected areas of product definition. They can be used individually or together based on what has already been defined and what needs greater clarity.',
      columns: '3',
      features: [
        {
          title: 'Business and Product Definition',
          description:
            'Helps define the product intent, audience, value, priorities, and boundaries.',
          resultLabel: 'RESULT',
          result: 'A clear definition of the product, its audience, and intended outcomes.',
        },
        {
          title: 'Product Experience and Workflow Definition',
          description:
            'Helps define workflows, interactions, product behavior, and outcomes.',
          resultLabel: 'RESULT',
          result: 'A connected definition of how users move through the product and how the product should behave.',
        },
        {
          title: 'Functional Specifications',
          description:
            'Helps define functional requirements, rules, system responses, and expected behavior.',
          resultLabel: 'RESULT',
          result: 'Clear functional specifications for Gen AI tools and implementation teams.',
        },
      ],
    },
    { blockType: 'dividerSection', structuralKey: 'services-divider-2' },
    {
      blockType: 'featureGridSection',
      structuralKey: 'services-work-development',
      theme: 'white',
      size: 'regular',
      customClassName: 'comparison-section services-work-section',
      heading: 'How You Work with Plenor',
      subheading: 'You provide the product direction. The Plenor platform helps develop the foundation.',
      columns: '2',
      features: [
        {
          title: 'Your team',
          description: 'You provide the product direction, business and domain knowledge, priorities, constraints, and key decisions.',
        },
        {
          title: 'Plenor',
          description: 'The Plenor platform structures the information, identifies gaps, and applies industry standards and best practices to help develop the definitions and specifications.',
        },
      ],
      supportingNote: {
        heading: 'Review and Use',
        copy: 'You, your team, Plenor, or a combination can review the work. The resulting definitions and specifications can guide Gen AI tools and implementation teams.',
      },
    },
  ];
}

function buildAboutSections(content: PresetContent): Record<string, unknown>[] {
  const heroParagraph1 = asString(
    content.heroParagraph1,
    'We created the Plenor platform to turn product ideas into clear definitions and functional specifications.',
  );
  const heroParagraph2 = asString(
    content.heroParagraph2,
    'Generative AI has made software faster to build, but unclear direction can produce the wrong result just as quickly.',
  );
  const heroParagraph3 = asString(
    content.heroParagraph3,
    'Strong products start with clarity about the problem, users, value, priorities, and constraints.',
  );
  const focusParagraph1 = asString(
    content.focusParagraph1,
    'We built Plenor to help founders and startup teams develop that foundation before implementation begins.',
  );
  return [
    {
      blockType: 'heroSection',
      structuralKey: 'about-hero',
      theme: 'white',
      size: 'compact',
      customClassName: 'marketing-hero about-marketing-hero',
      textAlignment: 'left',
      eyebrow: 'About Plenor Systems',
      heading: 'We help founders and startup teams lay a strong foundation for their products.',
      subheading: heroParagraph1,
    },
    { blockType: 'dividerSection', structuralKey: 'about-divider-1' },
    {
      blockType: 'richTextSection',
      structuralKey: 'about-why-built',
      theme: 'white',
      size: 'regular',
      customClassName: 'narrative-section about-narrative-section',
      heading: 'We built Plenor to turn business ideas into clearer direction for implementation.',
      content: richTextFromParagraphs([heroParagraph2, heroParagraph3, focusParagraph1]),
      subsections: [
        {
          heading: 'Gen AI applied purposefully',
          copy: 'Gen AI helps develop and organize product definitions, workflows, and functional requirements.',
        },
        {
          heading: 'Human judgment remains essential',
          copy: 'Business authority, professional judgment, key decisions, and final acceptance remain human responsibilities.',
        },
      ],
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
  const heroHeading = asString(content.heroHeading, 'Tell us what you are looking to build');
  const heroSubtext = asString(
    content.heroSubtext,
    'Share the product idea, business problem, or definition challenge you are working through. We will review the information and respond using the contact details you provide.',
  );

  return [
    {
      blockType: 'heroSection',
      structuralKey: 'contact-hero',
      theme: 'white',
      size: 'compact',
      customClassName: 'marketing-hero',
      textAlignment: 'left',
      heading: heroHeading,
      subheading: heroSubtext,
    },
    { blockType: 'dividerSection', structuralKey: 'contact-divider-1' },
    {
      blockType: 'formSection',
      structuralKey: 'contact-inquiry-form',
      theme: 'white',
      size: 'regular',
      customClassName: 'inquiry-form-section',
      accessibleLabel: 'Inquiry form',
      form: 'inquiry',
      formAlias: 'inquiry',
    },
    { blockType: 'dividerSection', structuralKey: 'contact-divider-2' },
    {
      blockType: 'richTextSection',
      structuralKey: 'contact-direct',
      theme: 'white',
      size: 'compact',
      customClassName: 'compact-note-section',
      heading: 'Prefer email?',
      inlineLink: {
        prefix: 'Contact us at ',
        label: 'contact@plenor.ai',
        href: 'mailto:contact@plenor.ai',
        suffix: '.',
      },
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
