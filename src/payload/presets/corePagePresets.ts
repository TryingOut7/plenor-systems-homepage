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
    'Turn Your Business Idea into Ready-to-Build Product and System Specifications',
  );
  const heroSubtext = asString(
    content.heroSubtext,
    'Plenor helps startup founders, growing businesses, and business-led teams:',
  );

  return [
    {
      blockType: 'heroSection',
      structuralKey: 'home-hero',
      theme: 'navy',
      size: 'compact',
      customClassName: 'marketing-hero',
      textAlignment: 'left',
      eyebrow: 'GOVERNED DEFINITION PLATFORM',
      heading: heroHeading,
      subheading: heroSubtext,
      bullets: [
        'Articulate the business need',
        'Design the product experience',
        'Create the system specifications',
      ],
      supportingStatement: 'System-driven. Human-validated. Ready for implementation.',
    },
    {
      blockType: 'featureGridSection',
      structuralKey: 'home-roles',
      theme: 'white',
      size: 'regular',
      customClassName: 'home-roles-section',
      heading: 'AI Can Build Fast. Building Well Still Requires Clear Direction.',
      subheading:
        'AI code-generation tools can produce software quickly. But reliable, consistent, and maintainable systems still require clear product direction, experience design, business analysis, system specifications, and practical engineering guardrails.\n\nFounders should focus their limited resources on the business problem, customer, and key decisions—not on building all of those capabilities internally before development can begin.',
      columns: '2',
      features: [
        {
          title: 'You Bring the Business Vision',
          description: 'Founders and business leaders bring:',
          items: [
            'the business problem',
            'customer understanding',
            'domain knowledge',
            'business priorities',
            'decisions requiring business judgment',
          ],
        },
        {
          title: 'Plenor Provides the Platform and Builds the Definition',
          description: 'Plenor:',
          items: [
            'articulates the business need',
            'designs the product experience',
            'creates the system specifications',
            'applies professional review and refinement',
          ],
        },
      ],
      closingCopy:
        'The resulting definition gives AI code-generation tools and engineering teams clear direction for implementation.',
    },
    {
      blockType: 'featureGridSection',
      structuralKey: 'home-platform-capabilities',
      theme: 'light',
      size: 'regular',
      customClassName: 'platform-capabilities-section',
      heading: 'Platform Capabilities',
      columns: '3',
      features: [
        {
          title: 'Articulate the Business Need',
          description:
            'Define the business problem, intended users, priorities, value, and desired outcomes.',
        },
        {
          title: 'Design the Product Experience',
          description:
            'Define the journeys, workflows, interactions, and experience expectations that shape how the product should work.',
        },
        {
          title: 'Create the System Specifications',
          description:
            'Create the requirements, system behavior, constraints, dependencies, and technical direction needed to guide implementation.',
        },
      ],
    },
    {
      blockType: 'richTextSection',
      structuralKey: 'home-use-definition',
      theme: 'white',
      size: 'compact',
      customClassName: 'use-definition-section',
      heading: 'Use the Definition Your Way',
      content: richTextFromParagraphs([
        'Use the resulting product and system specifications with:',
      ]),
      items: [
        'AI code-generation tools',
        'Your internal engineering team',
        'An external development partner',
      ],
      closingCopy:
        'Plenor provides the definition and direction. You retain control over the technology, implementation team, and delivery model.',
    },
  ];
}

function buildServicesSections(content: PresetContent): Record<string, unknown>[] {
  const heroHeading = asString(
    content.heroHeading,
    'Define the Product, Experience, and System Before You Build',
  );
  const heroSubtext = asString(
    content.heroSubtext,
    'Plenor provides a governed platform for creating ready-to-build product and system specifications, supported by experienced professionals where judgment and refinement are required.',
  );

  return [
    {
      blockType: 'heroSection',
      structuralKey: 'services-hero',
      theme: 'navy',
      size: 'compact',
      customClassName: 'marketing-hero',
      textAlignment: 'left',
      eyebrow: 'PLENOR SERVICES',
      heading: heroHeading,
      subheading: heroSubtext,
      supportingStatement: 'System-driven. Human-validated. Ready for implementation.',
    },
    {
      blockType: 'featureGridSection',
      structuralKey: 'services-platform-capabilities',
      theme: 'light',
      size: 'regular',
      customClassName: 'platform-capabilities-section',
      heading: 'One Platform for Defining What Will Be Built',
      subheading:
        'Software development requires more than a business idea or a collection of prompts. Product decisions, user experience, workflows, and system requirements must work together as one coherent definition.',
      columns: '3',
      features: [
        {
          title: 'Product Definition',
          description:
            'Define the business need, intended users, product purpose, value, priorities, capabilities, and boundaries.',
          result: 'A clear understanding of what should be built and why.',
        },
        {
          title: 'User Experience and Workflow Definition',
          description:
            'Design the user journeys, workflows, interactions, and experience expectations that determine how the product should work.',
          result:
            'A clear view of how users and business processes interact with the product.',
        },
        {
          title: 'System Specifications',
          description:
            'Create the requirements, system behavior, integrations, constraints, dependencies, quality expectations, and technical direction needed to guide implementation.',
          result: 'Clear specifications for AI code-generation tools and engineering teams.',
        },
      ],
    },
    {
      blockType: 'featureGridSection',
      structuralKey: 'services-professional-support',
      theme: 'white',
      size: 'compact',
      customClassName: 'professional-support-section',
      heading: 'Access Professional Expertise Where It Adds Value',
      subheading:
        'The platform provides structure and consistency. Experienced professionals provide judgment, review, and refinement where deeper expertise is required.',
      columns: '2',
      features: [
        {
          title: 'Product Direction',
          description:
            'Refine priorities, capabilities, boundaries, and decisions requiring business judgment.',
        },
        {
          title: 'User Experience',
          description: 'Strengthen journeys, workflows, interactions, and usability.',
        },
        {
          title: 'Business Analysis',
          description:
            'Clarify requirements, business rules, dependencies, and unresolved decisions.',
        },
        {
          title: 'Software Engineering',
          description:
            'Review system behavior, architecture direction, quality requirements, and implementation readiness.',
        },
      ],
      closingCopy: [
        'Professional review and refinement are part of the standard engagement. Additional support may be scoped where deeper involvement is required.',
        'The completed specifications may be used with AI code-generation tools, internal engineers, or external development partners. The customer retains control over implementation technology, team, and delivery model.',
      ],
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
      size: 'compact',
      customClassName: 'marketing-hero',
      textAlignment: 'left',
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
      size: 'compact',
      customClassName: 'marketing-hero',
      textAlignment: 'left',
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
