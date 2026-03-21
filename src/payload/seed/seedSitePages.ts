import { getPayload } from '@/payload/client';

type SeedPage = {
  slug: string;
  title: string;
  sections: Record<string, unknown>[];
};

type SeedResultItem = {
  slug: string;
  title: string;
  action: 'created' | 'hydrated' | 'exists';
  id: string;
};

export type SeedSitePagesResult = {
  created: number;
  existing: number;
  items: SeedResultItem[];
};

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

const DEFAULT_SITE_PAGES: SeedPage[] = [
  {
    slug: 'home',
    title: 'Home',
    sections: [
      {
        blockType: 'heroSection',
        theme: 'navy',
        eyebrow: 'Product Development Framework',
        heading:
          'Plenor Systems brings structure to the two most failure-prone stages of product development.',
        subheading: 'Testing & QA and Launch & Go-to-Market, done right.',
        primaryCtaLabel: 'Get the Free Guide',
        primaryCtaHref: '/contact#guide',
      },
      {
        blockType: 'richTextSection',
        theme: 'white',
        heading: 'Most product failures happen at the end, not the beginning.',
        content: richTextFromParagraphs([
          "Teams spend months building a product, then rush testing, skip structured QA, and launch without a clear go-to-market plan. The result: bugs found by customers, positioning that misses the market, and launches that don't generate expected traction.",
          "These aren't execution failures — they're structural ones. The final stages of product development are consistently underprepared. Plenor Systems is built specifically to fix that.",
        ]),
      },
      {
        blockType: 'ctaSection',
        theme: 'light',
        heading: 'Two stages. Both critical.',
        body: 'Plenor Systems focuses on Testing & QA and Launch & Go-to-Market, where product outcomes are won or lost.',
        buttonLabel: 'How it works',
        buttonHref: '/services',
      },
      {
        blockType: 'simpleTableSection',
        theme: 'light',
        heading: 'What We Do',
        columns: [
          { label: 'Stage' },
          { label: 'Title' },
          { label: 'Description' },
        ],
        rows: [
          {
            cells: [
              { value: 'Stage 1' },
              { value: 'Testing & QA that catches what matters before release.' },
              {
                value:
                  'A structured approach to verification, quality criteria, and release readiness. Designed to reduce rework and give your team confidence before shipping.',
              },
            ],
          },
          {
            cells: [
              { value: 'Stage 2' },
              { value: 'Launch & Go-to-Market with a plan that holds up on launch day.' },
              {
                value:
                  'From positioning and channel selection to operational readiness, the framework keeps go-to-market work structured rather than reactive.',
              },
            ],
          },
        ],
      },
      {
        blockType: 'simpleTableSection',
        theme: 'white',
        heading: 'Built for teams at every stage',
        columns: [
          { label: 'Team' },
          { label: 'How it helps' },
        ],
        rows: [
          {
            cells: [
              { value: 'Startups' },
              {
                value:
                  'Moving fast but need a reliable process for the final stretch — before a launch defines your reputation.',
              },
            ],
          },
          {
            cells: [
              { value: 'SMEs' },
              {
                value:
                  'Growing teams that have outpaced informal processes and need structure without slowing down delivery.',
              },
            ],
          },
          {
            cells: [
              { value: 'Enterprises' },
              {
                value:
                  'Larger organisations that need a rigorous, repeatable framework that scales across products and teams.',
              },
            ],
          },
        ],
      },
      {
        blockType: 'guideFormSection',
        theme: 'navy',
        anchorId: 'guide',
        label: 'Free resource',
        heading: 'Get the free guide',
        highlightText:
          'The 7 Most Common Product Development Mistakes — and How to Avoid Them.',
        body:
          'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent to your inbox automatically.',
      },
    ],
  },
  {
    slug: 'about',
    title: 'About',
    sections: [
      {
        blockType: 'heroSection',
        theme: 'navy',
        eyebrow: 'About',
        heading: 'Who we are',
        subheading:
          'Plenor Systems is a product development framework built around a specific observation: the stages most likely to cause a launch to fail are Testing & QA and Go-to-Market — and they’re consistently the least structured.',
      },
      {
        blockType: 'richTextSection',
        theme: 'white',
        heading: 'Who we are',
        content: richTextFromParagraphs([
          'Most frameworks cover the full development lifecycle. Plenor Systems covers only the final two stages — not because the others don’t matter, but because these two are where structure is most absent and most needed.',
          'The framework is used by teams ranging from early-stage startups to enterprise product groups that need a repeatable process between build completion and successful launch.',
        ]),
      },
      {
        blockType: 'richTextSection',
        theme: 'white',
        heading: 'Narrow by design. Deep by necessity.',
        content: richTextFromParagraphs([
          'Plenor Systems covers two stages: Testing & QA and Launch & Go-to-Market. That scope is intentional.',
          'Narrowing to two stages means the framework goes deep rather than broad. Each module is specific — built from observed patterns of what goes wrong and why. It is not a general project management tool dressed as a product framework.',
          'The narrow focus is a strength, not a limitation. Teams get a framework that is immediately applicable to real launch work.',
        ]),
      },
      {
        blockType: 'ctaSection',
        theme: 'light',
        heading: 'What we believe',
        body:
          'A well-built product deserves a structured path to market — and consistent quality standards before it gets there.',
      },
      {
        blockType: 'ctaSection',
        theme: 'navy',
        heading: 'Want to work together?',
        body:
          'Get in touch to discuss your product and team, or start with the free guide.',
        buttonLabel: 'Get in touch',
        buttonHref: '/contact',
      },
    ],
  },
  {
    slug: 'services',
    title: 'Services',
    sections: [
      {
        blockType: 'heroSection',
        theme: 'navy',
        eyebrow: 'Framework Overview',
        heading:
          'Two framework stages. The two that decide whether a product succeeds.',
        subheading:
          'Testing & QA and Launch & Go-to-Market are where most product failures originate — not in design or development. Plenor Systems is built specifically for these stages.',
      },
      {
        blockType: 'richTextSection',
        theme: 'white',
        heading: 'Testing & QA',
        content: richTextFromParagraphs([
          'Shipping without a structured quality process means issues surface after release — when they’re most expensive to fix. The Testing & QA module establishes clear quality criteria, verification steps, and release gates before code reaches users.',
          'Who it’s for: teams that are shipping frequently and catching issues too late, or organisations preparing for a significant launch that cannot afford post-release rework.',
        ]),
      },
      {
        blockType: 'simpleTableSection',
        theme: 'white',
        heading: 'What it covers',
        columns: [{ label: 'What it covers' }],
        rows: [
          { cells: [{ value: 'Defining quality criteria and acceptance standards before development completes' }] },
          { cells: [{ value: 'Structured test planning: functional, regression, performance, and edge-case coverage' }] },
          { cells: [{ value: 'Release readiness checklists and sign-off processes.' }] },
          { cells: [{ value: 'Defect triage and prioritisation so teams know what must be fixed before launch' }] },
        ],
      },
      {
        blockType: 'richTextSection',
        theme: 'light',
        heading: 'Launch & Go-to-Market',
        content: richTextFromParagraphs([
          'A product can pass QA and still underperform at launch. Go-to-market failures are often structural — unclear positioning, undefined channels, or a launch day without operational readiness. The Launch & GTM module addresses each of these.',
          'Who it’s for: startups preparing for a first launch, product teams at SMEs rolling out a new offering, and enterprise groups managing a significant market entry.',
        ]),
      },
      {
        blockType: 'simpleTableSection',
        theme: 'light',
        heading: 'What it covers',
        columns: [{ label: 'What it covers' }],
        rows: [
          { cells: [{ value: 'Market positioning and messaging that reflects what the product actually does' }] },
          { cells: [{ value: 'Channel selection grounded in where your target audience can be reached' }] },
          { cells: [{ value: 'Launch sequencing and operational readiness — support, onboarding, and infrastructure' }] },
          { cells: [{ value: 'Post-launch review process to capture what worked and what to adjust' }] },
        ],
      },
      {
        blockType: 'richTextSection',
        theme: 'white',
        heading: 'Why a framework, not a one-off engagement',
        content: richTextFromParagraphs([
          'Ad-hoc approaches to testing and go-to-market work in isolation but don’t build repeatable capability. Each launch starts from scratch, and teams re-learn the same lessons.',
          'A structured framework means your team builds consistent habits — clear criteria before testing begins, defined channels before launch planning starts. It works for startups moving fast and for enterprises that need process rigour across multiple products.',
          'The framework is not prescriptive. It sets the structure; your team fills in the specifics.',
        ]),
      },
      {
        blockType: 'ctaSection',
        theme: 'navy',
        heading: 'Not sure yet?',
        body: 'Start with the guide — see the kinds of mistakes the framework is designed to prevent.',
        buttonLabel: 'Get the Free Guide',
        buttonHref: '/contact#guide',
      },
    ],
  },
  {
    slug: 'pricing',
    title: 'Pricing',
    sections: [
      {
        blockType: 'heroSection',
        theme: 'navy',
        eyebrow: 'Pricing',
        heading: "Let's find the right fit for your team.",
        subheading:
          "Pricing is tailored based on your team size and scope. Get in touch and we'll come back with a proposal.",
      },
      {
        blockType: 'simpleTableSection',
        theme: 'white',
        heading: 'Everything you need to ship with confidence.',
        columns: [
          { label: 'Included' },
          { label: 'Details' },
        ],
        rows: [
          {
            cells: [
              { value: 'Testing & QA Module' },
              { value: 'Quality criteria, structured test planning, release readiness checklists, and defect triage.' },
            ],
          },
          {
            cells: [
              { value: 'Launch & Go-to-Market Module' },
              { value: 'Positioning and messaging, channel strategy, launch sequencing, and operational readiness.' },
            ],
          },
          {
            cells: [
              { value: 'Onboarding support' },
              { value: 'Help your team adopt the framework from day one.' },
            ],
          },
        ],
      },
      {
        blockType: 'richTextSection',
        theme: 'white',
        content: richTextFromParagraphs([
          'Engagement is straightforward to start. The framework is accessible to teams of any size — no minimum headcount or project scale required.',
        ]),
      },
      {
        blockType: 'simpleTableSection',
        theme: 'light',
        heading: 'No minimum team size. Any stage.',
        columns: [
          { label: 'Team' },
          { label: 'Best fit' },
        ],
        rows: [
          {
            cells: [
              { value: 'Startups' },
              { value: 'Early-stage teams preparing for a first or major launch who need process without overhead.' },
            ],
          },
          {
            cells: [
              { value: 'SMEs' },
              { value: 'Mid-sized teams with established products moving into new markets or scaling delivery cadence.' },
            ],
          },
          {
            cells: [
              { value: 'Enterprises' },
              { value: 'Organizations that need repeatable launch quality and GTM structure across multiple teams.' },
            ],
          },
        ],
      },
      {
        blockType: 'ctaSection',
        theme: 'white',
        heading: 'Ready to talk?',
        body: "Tell us about your product and team and we'll come back with a proposal.",
        buttonLabel: 'Get in touch',
        buttonHref: '/contact',
      },
      {
        blockType: 'ctaSection',
        theme: 'light',
        heading: 'Not ready to talk yet?',
        body: 'Start with the free guide to get a sense of the problems the framework addresses.',
        buttonLabel: 'Get the free guide',
        buttonHref: '/contact#guide',
      },
    ],
  },
  {
    slug: 'contact',
    title: 'Contact',
    sections: [
      {
        blockType: 'heroSection',
        theme: 'navy',
        eyebrow: 'Contact',
        heading: 'Let’s talk.',
        subheading:
          'Tell us about your product and team and we’ll get back to you within 2 business days.',
      },
      {
        blockType: 'guideFormSection',
        theme: 'light',
        anchorId: 'guide',
        label: 'Free resource',
        heading: 'Get the free guide',
        highlightText:
          'The 7 Most Common Product Development Mistakes — and How to Avoid Them.',
        body:
          'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent to your inbox automatically.',
      },
      {
        blockType: 'inquiryFormSection',
        theme: 'white',
        label: 'Send an inquiry',
        heading: 'Send a direct inquiry',
        subtext:
          'Tell us about your product, your team, and the challenge you’re working through. We’ll respond within 2 business days.',
      },
      {
        blockType: 'privacyNoteSection',
        theme: 'light',
        label: 'By submitting this form, you agree to our',
        policyLinkLabel: 'Privacy Policy',
        policyLinkHref: '/privacy',
      },
    ],
  },
];

export async function seedSitePages(): Promise<SeedSitePagesResult> {
  const payload = await getPayload();

  const items: SeedResultItem[] = [];
  let created = 0;
  let existing = 0;

  for (const page of DEFAULT_SITE_PAGES) {
    const found = await payload.find({
      collection: 'site-pages',
      where: { slug: { equals: page.slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });

    const current = found.docs[0] as { id?: string; sections?: unknown } | undefined;
    if (current?.id) {
      const hasSections = Array.isArray(current.sections) && current.sections.length > 0;
      if (!hasSections) {
        await payload.update({
          collection: 'site-pages',
          id: String(current.id),
          data: {
            pageMode: 'builder',
            isActive: true,
            sections: page.sections,
          },
          overrideAccess: true,
        });
        existing += 1;
        items.push({
          slug: page.slug,
          title: page.title,
          action: 'hydrated',
          id: String(current.id),
        });
      } else {
        existing += 1;
        items.push({
          slug: page.slug,
          title: page.title,
          action: 'exists',
          id: String(current.id),
        });
      }
      continue;
    }

    const createdDoc = await payload.create({
      collection: 'site-pages',
      data: {
        title: page.title,
        slug: page.slug,
        pageMode: 'builder',
        isActive: true,
        sections: page.sections,
      },
      overrideAccess: true,
    });

    created += 1;
    items.push({
      slug: page.slug,
      title: page.title,
      action: 'created',
      id: String((createdDoc as { id?: string })?.id ?? ''),
    });
  }

  return { created, existing, items };
}
