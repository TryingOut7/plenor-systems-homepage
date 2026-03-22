import type { CollectionConfig, Field } from 'payload';
import { seoFields } from '../fields/seo';
import { workflowStatusField, workflowApprovalFields } from '../fields/workflow';
import { pageSectionBlocks } from '../blocks/pageSections';
import { auditAfterChange, auditAfterDelete } from '../hooks/auditLog';
import { workflowBeforeChange, workflowAfterChange } from '../hooks/workflow';
import { applyCorePresetSections } from '../hooks/sitePagePreset';

const corePresetValues = ['home', 'services', 'about', 'pricing', 'contact'] as const;

function readPresetKey(data: unknown): string {
  if (!data || typeof data !== 'object') return 'custom';
  const key = (data as Record<string, unknown>).presetKey;
  return typeof key === 'string' ? key : 'custom';
}

function isCorePreset(data: unknown): boolean {
  const key = readPresetKey(data);
  return corePresetValues.includes(key as (typeof corePresetValues)[number]);
}

const audienceArrayFields: Field[] = [
  { name: 'label', type: 'text', required: true },
  { name: 'copy', type: 'textarea', required: true },
];

const includedItemsFields: Field[] = [
  { name: 'title', type: 'text', required: true },
  { name: 'desc', type: 'textarea', required: true },
];

const homePresetFields: Field[] = [
  { name: 'heroHeading', type: 'textarea', defaultValue: 'Plenor Systems brings structure to the two most failure-prone stages of product development.' },
  { name: 'heroSubtext', type: 'textarea', defaultValue: 'Testing & QA and Launch & Go-to-Market, done right.' },
  { name: 'problemHeading', type: 'textarea', defaultValue: 'Most product failures happen at the end, not the beginning.' },
  {
    name: 'problemBody1',
    type: 'textarea',
    defaultValue:
      "Teams spend months building a product, then rush testing, skip structured QA, and launch without a clear go-to-market plan. The result: bugs found by customers, positioning that misses the market, and launches that don't generate expected traction.",
  },
  {
    name: 'problemBody2',
    type: 'textarea',
    defaultValue:
      "These aren't execution failures — they're structural ones. The final stages of product development are consistently underprepared. Plenor Systems is built specifically to fix that.",
  },
  { name: 'testingCardTitle', type: 'text', defaultValue: 'Testing & QA that catches what matters before release.' },
  {
    name: 'testingCardBody',
    type: 'textarea',
    defaultValue:
      'A structured approach to verification, quality criteria, and release readiness. Designed to reduce rework and give your team confidence before shipping.',
  },
  { name: 'launchCardTitle', type: 'text', defaultValue: 'Launch & Go-to-Market with a plan that holds up on launch day.' },
  {
    name: 'launchCardBody',
    type: 'textarea',
    defaultValue:
      'From positioning and channel selection to operational readiness, the framework keeps go-to-market work structured rather than reactive.',
  },
  {
    name: 'audiences',
    type: 'array',
    defaultValue: [
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
    fields: audienceArrayFields,
  },
  { name: 'guideCTAHeading', type: 'text', defaultValue: 'Get the free guide' },
  {
    name: 'guideHighlightText',
    type: 'textarea',
    defaultValue: 'The 7 Most Common Product Development Mistakes — and How to Avoid Them.',
  },
  {
    name: 'guideCTABody',
    type: 'textarea',
    defaultValue:
      'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent to your inbox automatically.',
  },
];

const servicesPresetFields: Field[] = [
  { name: 'heroHeading', type: 'textarea', defaultValue: 'Two framework stages. The two that decide whether a product succeeds.' },
  {
    name: 'heroSubtext',
    type: 'textarea',
    defaultValue:
      'Testing & QA and Launch & Go-to-Market are where most product failures originate — not in design or development. Plenor Systems is built specifically for these stages.',
  },
  {
    name: 'testingBody',
    type: 'textarea',
    defaultValue:
      'Shipping without a structured quality process means issues surface after release — when they’re most expensive to fix. The Testing & QA module establishes clear quality criteria, verification steps, and release gates before code reaches users.',
  },
  {
    name: 'testingItems',
    type: 'array',
    defaultValue: [
      { item: 'Defining quality criteria and acceptance standards before development completes' },
      { item: 'Structured test planning: functional, regression, performance, and edge-case coverage' },
      { item: 'Release readiness checklists and sign-off processes' },
      { item: 'Defect triage and prioritisation so teams know what must be fixed before launch' },
    ],
    fields: [{ name: 'item', type: 'textarea', required: true }],
  },
  {
    name: 'testingWhoFor',
    type: 'textarea',
    defaultValue:
      'Teams that are shipping frequently and catching issues too late, or organisations preparing for a significant launch that cannot afford post-release rework.',
  },
  {
    name: 'launchBody',
    type: 'textarea',
    defaultValue:
      'A product can pass QA and still underperform at launch. Go-to-market failures are often structural — unclear positioning, undefined channels, or a launch day without operational readiness. The Launch & GTM module addresses each of these.',
  },
  {
    name: 'launchItems',
    type: 'array',
    defaultValue: [
      { item: 'Market positioning and messaging that reflects what the product actually does' },
      { item: 'Channel selection grounded in where your target audience can be reached' },
      { item: 'Launch sequencing and operational readiness — support, onboarding, and infrastructure' },
      { item: 'Post-launch review process to capture what worked and what to adjust' },
    ],
    fields: [{ name: 'item', type: 'textarea', required: true }],
  },
  {
    name: 'launchWhoFor',
    type: 'textarea',
    defaultValue:
      'Startups preparing for a first launch, product teams at SMEs rolling out a new offering, and enterprise groups managing a significant market entry.',
  },
  { name: 'whyFrameworkHeading', type: 'text', defaultValue: 'Why a framework, not a one-off engagement' },
  {
    name: 'whyFrameworkBody1',
    type: 'textarea',
    defaultValue:
      'Ad-hoc approaches to testing and go-to-market work in isolation but don’t build repeatable capability. Each launch starts from scratch, and teams re-learn the same lessons.',
  },
  {
    name: 'whyFrameworkBody2',
    type: 'textarea',
    defaultValue:
      'A structured framework means your team builds consistent habits — clear criteria before testing begins, defined channels before launch planning starts. It works for startups moving fast and for enterprises that need process rigour across multiple products.',
  },
  {
    name: 'whyFrameworkBody3',
    type: 'textarea',
    defaultValue:
      'The framework is not prescriptive. It sets the structure; your team fills in the specifics.',
  },
  { name: 'ctaHeading', type: 'text', defaultValue: 'Not sure yet?' },
  {
    name: 'ctaBody',
    type: 'textarea',
    defaultValue: 'Start with the guide — see the kinds of mistakes the framework is designed to prevent.',
  },
];

const aboutPresetFields: Field[] = [
  {
    name: 'heroParagraph1',
    type: 'textarea',
    defaultValue:
      'Plenor Systems is a product development framework built around a specific observation: the stages most likely to cause a launch to fail are Testing & QA and Go-to-Market — and they’re consistently the least structured.',
  },
  {
    name: 'heroParagraph2',
    type: 'textarea',
    defaultValue:
      'Most frameworks cover the full development lifecycle. Plenor Systems covers only the final two stages — not because the others don’t matter, but because these two are where structure is most absent and most needed.',
  },
  {
    name: 'heroParagraph3',
    type: 'textarea',
    defaultValue:
      'The framework is used by teams ranging from early-stage startups to enterprise product groups who need a repeatable, structured process for the stretch of work between build completion and a successful launch.',
  },
  {
    name: 'focusParagraph1',
    type: 'textarea',
    defaultValue:
      'Plenor Systems covers two stages: Testing & QA and Launch & Go-to-Market. That scope is intentional.',
  },
  {
    name: 'focusParagraph2',
    type: 'textarea',
    defaultValue:
      'Narrowing to two stages means the framework goes deep rather than broad. Each module is specific — built from observed patterns of what goes wrong and why. It is not a general project management tool dressed as a product framework.',
  },
  {
    name: 'focusParagraph3',
    type: 'textarea',
    defaultValue:
      'The narrow focus is a strength, not a limitation. Teams get a framework that is actually applicable to the work at hand, not a set of generic principles that need extensive interpretation.',
  },
  {
    name: 'missionQuote',
    type: 'textarea',
    defaultValue:
      'A well-built product deserves a structured path to market — and consistent quality standards before it gets there.',
  },
  { name: 'ctaHeading', type: 'text', defaultValue: 'Want to work together?' },
  {
    name: 'ctaBody',
    type: 'textarea',
    defaultValue: 'Get in touch to discuss your product and team, or start with the free guide.',
  },
];

const pricingPresetFields: Field[] = [
  { name: 'heroHeading', type: 'textarea', defaultValue: 'Let’s find the right fit for your team.' },
  {
    name: 'heroSubtext',
    type: 'textarea',
    defaultValue:
      'Pricing is tailored based on your team size and scope. Get in touch and we’ll come back with a proposal.',
  },
  {
    name: 'includedItems',
    type: 'array',
    defaultValue: [
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
    fields: includedItemsFields,
  },
  {
    name: 'includedBody',
    type: 'textarea',
    defaultValue:
      'Engagement is straightforward to start. The framework is accessible to teams of any size — no minimum headcount or project scale required.',
  },
  {
    name: 'audiences',
    type: 'array',
    defaultValue: [
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
    fields: audienceArrayFields,
  },
  { name: 'ctaHeading', type: 'text', defaultValue: 'Ready to talk?' },
  { name: 'ctaBody', type: 'textarea', defaultValue: 'Tell us about your product and team — we’ll come back with a proposal.' },
  { name: 'notReadyHeading', type: 'text', defaultValue: 'Not ready to talk yet?' },
  {
    name: 'notReadyBody',
    type: 'textarea',
    defaultValue: 'Start with the free guide to get a sense of the problems the framework addresses.',
  },
];

const contactPresetFields: Field[] = [
  { name: 'heroHeading', type: 'text', defaultValue: 'Let’s talk.' },
  {
    name: 'heroSubtext',
    type: 'textarea',
    defaultValue:
      'Tell us about your product and team and we’ll get back to you within 2 business days.',
  },
  {
    name: 'guideHighlightText',
    type: 'textarea',
    defaultValue:
      'The 7 Most Common Product Development Mistakes — and How to Avoid Them.',
  },
  {
    name: 'guideBody',
    type: 'textarea',
    defaultValue:
      'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent to your inbox automatically.',
  },
  { name: 'inquiryHeading', type: 'text', defaultValue: 'Send a direct inquiry' },
  {
    name: 'inquirySubtext',
    type: 'textarea',
    defaultValue:
      'Tell us about your product, your team, and the challenge you’re working through. We’ll respond within 2 business days.',
  },
  { name: 'nextStepsLabel', type: 'text', defaultValue: 'What happens next' },
  {
    name: 'nextStepsBody',
    type: 'textarea',
    defaultValue:
      'We review every inquiry and respond within 2 business days with initial thoughts or a proposal request.',
  },
  { name: 'directEmailLabel', type: 'text', defaultValue: 'Prefer email directly?' },
  { name: 'emailAddress', type: 'email', defaultValue: 'hello@plenor.ai' },
  { name: 'linkedinLabel', type: 'text', defaultValue: 'LinkedIn →' },
  { name: 'linkedinHref', type: 'text', defaultValue: 'https://www.linkedin.com/company/plenor-ai' },
];

export const SitePages: CollectionConfig = {
  slug: 'site-pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'presetKey', 'workflowStatus', 'isActive'],
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return { workflowStatus: { equals: 'published' }, isActive: { equals: true } };
    },
    create: ({ req }) => !!req.user && ['admin', 'editor', 'author'].includes((req.user as Record<string, unknown>).role as string),
    update: ({ req }) => !!req.user && ['admin', 'editor', 'author'].includes((req.user as Record<string, unknown>).role as string),
    delete: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
  },
  hooks: {
    beforeChange: [workflowBeforeChange, applyCorePresetSections],
    afterChange: [workflowAfterChange, auditAfterChange],
    afterDelete: [auditAfterDelete],
  },
  trash: true,
  enableQueryPresets: true,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'pageMode',
      type: 'select',
      defaultValue: 'builder',
      options: [
        { label: 'Builder', value: 'builder' },
        { label: 'Template', value: 'template' },
      ],
      admin: {
        position: 'sidebar',
        condition: (data) => !isCorePreset(data),
      },
    },
    {
      name: 'templateKey',
      type: 'select',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Landing', value: 'landing' },
        { label: 'Article', value: 'article' },
        { label: 'Product', value: 'product' },
      ],
      admin: {
        position: 'sidebar',
        condition: (data, siblingData) => !isCorePreset(data) && siblingData?.pageMode === 'template',
      },
    },
    {
      name: 'presetKey',
      type: 'select',
      defaultValue: 'custom',
      options: [
        { label: 'Custom (Section Builder)', value: 'custom' },
        { label: 'Home Preset', value: 'home' },
        { label: 'Services Preset', value: 'services' },
        { label: 'About Preset', value: 'about' },
        { label: 'Pricing Preset', value: 'pricing' },
        { label: 'Contact Preset', value: 'contact' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Use a core preset to lock page structure and edit text only.',
      },
    },
    {
      name: 'presetContent',
      type: 'group',
      admin: {
        condition: (data) => isCorePreset(data),
        description: 'Editable text for the selected preset. Layout stays fixed.',
      },
      fields: [
        {
          name: 'home',
          type: 'group',
          label: 'Home Text',
          admin: { condition: (data) => readPresetKey(data) === 'home' },
          fields: homePresetFields,
        },
        {
          name: 'services',
          type: 'group',
          label: 'Services Text',
          admin: { condition: (data) => readPresetKey(data) === 'services' },
          fields: servicesPresetFields,
        },
        {
          name: 'about',
          type: 'group',
          label: 'About Text',
          admin: { condition: (data) => readPresetKey(data) === 'about' },
          fields: aboutPresetFields,
        },
        {
          name: 'pricing',
          type: 'group',
          label: 'Pricing Text',
          admin: { condition: (data) => readPresetKey(data) === 'pricing' },
          fields: pricingPresetFields,
        },
        {
          name: 'contact',
          type: 'group',
          label: 'Contact Text',
          admin: { condition: (data) => readPresetKey(data) === 'contact' },
          fields: contactPresetFields,
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'sections',
      type: 'blocks',
      blocks: pageSectionBlocks,
      admin: {
        condition: (data) => !isCorePreset(data),
        description:
          'Section builder is available for custom pages only. Core preset pages keep fixed structure.',
      },
    },
    workflowStatusField,
    ...workflowApprovalFields,
    ...seoFields,
  ],
};
