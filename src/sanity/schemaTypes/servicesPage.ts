import { defineArrayMember, defineField, defineType } from 'sanity';
import { createSchemaTypePlaygroundField } from './shared/schemaTypePlayground';

const hideLegacyFields = ({ document }: { document?: unknown }) => {
  const sections =
    document && typeof document === 'object' ? (document as { sections?: unknown[] }).sections : undefined;
  return Array.isArray(sections) && sections.length > 0;
};

const sectionSizeOptions = [
  { title: 'Compact', value: 'compact' },
  { title: 'Regular', value: 'regular' },
  { title: 'Spacious', value: 'spacious' },
];

const darkThemeOptions = [
  { title: 'Navy (Default)', value: 'navy' },
  { title: 'Charcoal', value: 'charcoal' },
  { title: 'Black', value: 'black' },
];

const lightThemeOptions = [
  { title: 'White', value: 'white' },
  { title: 'Light Gray', value: 'light' },
];

export const servicesPage = defineType({
  name: 'servicesPage',
  title: 'Services Page',
  type: 'document',
  initialValue: {
    sections: [
      {
        _type: 'servicesHeroSection',
        label: 'Framework Overview',
        heading: 'Two framework stages. The two that decide whether a product succeeds.',
        subtext:
          'Testing & QA and Launch & Go-to-Market are where most product failures originate — not in design or development. Plenor Systems is built specifically for these stages.',
        theme: 'navy',
        size: 'regular',
      },
      {
        _type: 'servicesTestingSection',
        label: 'Stage 1',
        stageNumber: '01',
        heading: 'Testing & QA',
        itemsHeading: 'What it covers',
        whoForHeading: "Who it's for",
        body:
          'Shipping without a structured quality process means issues surface after release — when they’re most expensive to fix. The Testing & QA module establishes clear quality criteria, verification steps, and release gates before code reaches users.',
        items: [
          'Defining quality criteria and acceptance standards before development completes',
          'Structured test planning: functional, regression, performance, and edge-case coverage',
          'Release readiness checklists and sign-off processes',
          'Defect triage and prioritisation so teams know what must be fixed before launch',
        ],
        whoFor:
          'Teams that are shipping frequently and catching issues too late, or organisations preparing for a significant launch that cannot afford post-release rework.',
        theme: 'white',
        size: 'regular',
      },
      {
        _type: 'servicesLaunchSection',
        label: 'Stage 2',
        stageNumber: '02',
        heading: 'Launch & Go-to-Market',
        itemsHeading: 'What it covers',
        whoForHeading: "Who it's for",
        body:
          'A product can pass QA and still underperform at launch. Go-to-market failures are often structural — unclear positioning, undefined channels, or a launch day without operational readiness. The Launch & GTM module addresses each of these.',
        items: [
          'Market positioning and messaging that reflects what the product actually does',
          'Channel selection grounded in where your target audience can be reached',
          'Launch sequencing and operational readiness — support, onboarding, and infrastructure',
          'Post-launch review process to capture what worked and what to adjust',
        ],
        whoFor:
          'Startups preparing for a first launch, product teams at SMEs rolling out a new offering, and enterprise groups managing a significant market entry.',
        theme: 'light',
        size: 'regular',
      },
      {
        _type: 'servicesWhySection',
        label: 'The Approach',
        heading: 'Why a framework, not a one-off engagement',
        body1:
          'Ad-hoc approaches to testing and go-to-market work in isolation but don’t build repeatable capability. Each launch starts from scratch, and teams re-learn the same lessons.',
        body2:
          'A structured framework means your team builds consistent habits — clear criteria before testing begins, defined channels before launch planning starts. It works for startups moving fast and for enterprises that need process rigour across multiple products.',
        body3: 'The framework is not prescriptive. It sets the structure; your team fills in the specifics.',
        theme: 'white',
        size: 'regular',
      },
      {
        _type: 'servicesLinksSection',
        leftLinkLabel: 'About Plenor Systems',
        leftLinkHref: '/about',
        rightLinkLabel: 'Pricing',
        rightLinkHref: '/pricing',
        theme: 'light',
        size: 'compact',
      },
      {
        _type: 'servicesCtaSection',
        heading: 'Not sure yet?',
        body: 'Start with the guide — see the kinds of mistakes the framework is designed to prevent.',
        ctaLabel: 'Get the Free Guide',
        ctaHref: '/contact#guide',
        theme: 'navy',
        size: 'regular',
      },
    ],
  },
  fieldsets: [
    {
      name: 'legacy',
      title: 'Legacy Fields (Deprecated)',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'playground',
      title: 'Schema Playground',
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'servicesHeroSection',
          title: 'Hero Section',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Section Label', type: 'string', initialValue: 'Framework Overview' }),
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({ name: 'subtext', title: 'Subtext', type: 'text', rows: 3 }),
            defineField({
              name: 'theme',
              title: 'Theme',
              type: 'string',
              initialValue: 'navy',
              options: { list: darkThemeOptions, layout: 'radio' },
            }),
            defineField({
              name: 'size',
              title: 'Section Size',
              type: 'string',
              initialValue: 'regular',
              options: { list: sectionSizeOptions, layout: 'radio' },
            }),
          ],
          preview: {
            select: { title: 'heading' },
            prepare: ({ title }) => ({ title: title || 'Services Hero', subtitle: 'Hero section' }),
          },
        }),
        defineArrayMember({
          name: 'servicesTestingSection',
          title: 'Testing Section',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Section Label', type: 'string', initialValue: 'Stage 1' }),
            defineField({ name: 'stageNumber', title: 'Stage Number', type: 'string', initialValue: '01' }),
            defineField({ name: 'heading', title: 'Heading', type: 'string', initialValue: 'Testing & QA' }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 4 }),
            defineField({ name: 'items', title: 'Items', type: 'array', of: [defineArrayMember({ type: 'string' })] }),
            defineField({ name: 'itemsHeading', title: 'Items Heading', type: 'string', initialValue: 'What it covers' }),
            defineField({ name: 'whoFor', title: 'Who It\'s For', type: 'text', rows: 3 }),
            defineField({ name: 'whoForHeading', title: 'Who It\'s For Heading', type: 'string', initialValue: "Who it's for" }),
            defineField({
              name: 'theme',
              title: 'Theme',
              type: 'string',
              initialValue: 'white',
              options: { list: lightThemeOptions, layout: 'radio' },
            }),
            defineField({
              name: 'size',
              title: 'Section Size',
              type: 'string',
              initialValue: 'regular',
              options: { list: sectionSizeOptions, layout: 'radio' },
            }),
          ],
          preview: {
            prepare: () => ({ title: 'Stage 1: Testing & QA', subtitle: 'Module section' }),
          },
        }),
        defineArrayMember({
          name: 'servicesLaunchSection',
          title: 'Launch Section',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Section Label', type: 'string', initialValue: 'Stage 2' }),
            defineField({ name: 'stageNumber', title: 'Stage Number', type: 'string', initialValue: '02' }),
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
              initialValue: 'Launch & Go-to-Market',
            }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 4 }),
            defineField({ name: 'items', title: 'Items', type: 'array', of: [defineArrayMember({ type: 'string' })] }),
            defineField({ name: 'itemsHeading', title: 'Items Heading', type: 'string', initialValue: 'What it covers' }),
            defineField({ name: 'whoFor', title: 'Who It\'s For', type: 'text', rows: 3 }),
            defineField({ name: 'whoForHeading', title: 'Who It\'s For Heading', type: 'string', initialValue: "Who it's for" }),
            defineField({
              name: 'theme',
              title: 'Theme',
              type: 'string',
              initialValue: 'light',
              options: { list: lightThemeOptions, layout: 'radio' },
            }),
            defineField({
              name: 'size',
              title: 'Section Size',
              type: 'string',
              initialValue: 'regular',
              options: { list: sectionSizeOptions, layout: 'radio' },
            }),
          ],
          preview: {
            prepare: () => ({ title: 'Stage 2: Launch & GTM', subtitle: 'Module section' }),
          },
        }),
        defineArrayMember({
          name: 'servicesWhySection',
          title: 'Why Framework Section',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Section Label', type: 'string', initialValue: 'The Approach' }),
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({ name: 'body1', title: 'Paragraph 1', type: 'text', rows: 3 }),
            defineField({ name: 'body2', title: 'Paragraph 2', type: 'text', rows: 3 }),
            defineField({ name: 'body3', title: 'Paragraph 3', type: 'text', rows: 3 }),
            defineField({
              name: 'theme',
              title: 'Theme',
              type: 'string',
              initialValue: 'white',
              options: { list: lightThemeOptions, layout: 'radio' },
            }),
            defineField({
              name: 'size',
              title: 'Section Size',
              type: 'string',
              initialValue: 'regular',
              options: { list: sectionSizeOptions, layout: 'radio' },
            }),
          ],
          preview: {
            select: { title: 'heading' },
            prepare: ({ title }) => ({ title: title || 'Why Framework', subtitle: 'Approach section' }),
          },
        }),
        defineArrayMember({
          name: 'servicesLinksSection',
          title: 'Internal Links Section',
          type: 'object',
          fields: [
            defineField({ name: 'leftLinkLabel', title: 'Left Link Label', type: 'string', initialValue: 'About Plenor Systems' }),
            defineField({ name: 'leftLinkHref', title: 'Left Link URL', type: 'string', initialValue: '/about' }),
            defineField({ name: 'rightLinkLabel', title: 'Right Link Label', type: 'string', initialValue: 'Pricing' }),
            defineField({ name: 'rightLinkHref', title: 'Right Link URL', type: 'string', initialValue: '/pricing' }),
            defineField({
              name: 'theme',
              title: 'Theme',
              type: 'string',
              initialValue: 'light',
              options: { list: lightThemeOptions, layout: 'radio' },
            }),
            defineField({
              name: 'size',
              title: 'Section Size',
              type: 'string',
              initialValue: 'compact',
              options: { list: sectionSizeOptions, layout: 'radio' },
            }),
          ],
          preview: {
            prepare: () => ({ title: 'Internal links', subtitle: 'Navigation section' }),
          },
        }),
        defineArrayMember({
          name: 'servicesCtaSection',
          title: 'CTA Section',
          type: 'object',
          fields: [
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
            defineField({ name: 'ctaLabel', title: 'CTA Button Label', type: 'string', initialValue: 'Get the Free Guide' }),
            defineField({ name: 'ctaHref', title: 'CTA Button URL', type: 'string', initialValue: '/contact#guide' }),
            defineField({
              name: 'theme',
              title: 'Theme',
              type: 'string',
              initialValue: 'navy',
              options: { list: darkThemeOptions, layout: 'radio' },
            }),
            defineField({
              name: 'size',
              title: 'Section Size',
              type: 'string',
              initialValue: 'regular',
              options: { list: sectionSizeOptions, layout: 'radio' },
            }),
          ],
          preview: {
            select: { title: 'heading' },
            prepare: ({ title }) => ({ title: title || 'Services CTA', subtitle: 'CTA section' }),
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({ name: 'heroHeading', title: 'Legacy: Hero Heading', type: 'string', fieldset: 'legacy', hidden: hideLegacyFields }),
    defineField({ name: 'heroSubtext', title: 'Legacy: Hero Subtext', type: 'text', rows: 2, fieldset: 'legacy', hidden: hideLegacyFields }),
    defineField({ name: 'testingBody', title: 'Legacy: Testing & QA Body', type: 'text', rows: 3, fieldset: 'legacy', hidden: hideLegacyFields }),
    defineField({
      name: 'testingItems',
      title: 'Legacy: Testing & QA Items',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({ name: 'testingWhoFor', title: 'Legacy: Testing & QA Who It\'s For', type: 'text', rows: 2, fieldset: 'legacy', hidden: hideLegacyFields }),
    defineField({ name: 'launchBody', title: 'Legacy: Launch & GTM Body', type: 'text', rows: 3, fieldset: 'legacy', hidden: hideLegacyFields }),
    defineField({
      name: 'launchItems',
      title: 'Legacy: Launch & GTM Items',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({ name: 'launchWhoFor', title: 'Legacy: Launch & GTM Who It\'s For', type: 'text', rows: 2, fieldset: 'legacy', hidden: hideLegacyFields }),
    defineField({ name: 'whyFrameworkHeading', title: 'Legacy: Why Framework Heading', type: 'string', fieldset: 'legacy', hidden: hideLegacyFields }),
    defineField({ name: 'whyFrameworkBody1', title: 'Legacy: Why Framework Paragraph 1', type: 'text', rows: 3, fieldset: 'legacy', hidden: hideLegacyFields }),
    defineField({ name: 'whyFrameworkBody2', title: 'Legacy: Why Framework Paragraph 2', type: 'text', rows: 3, fieldset: 'legacy', hidden: hideLegacyFields }),
    defineField({ name: 'whyFrameworkBody3', title: 'Legacy: Why Framework Paragraph 3', type: 'text', rows: 3, fieldset: 'legacy', hidden: hideLegacyFields }),
    defineField({ name: 'ctaHeading', title: 'Legacy: CTA Heading', type: 'string', fieldset: 'legacy', hidden: hideLegacyFields }),
    defineField({ name: 'ctaBody', title: 'Legacy: CTA Body', type: 'text', rows: 2, fieldset: 'legacy', hidden: hideLegacyFields }),
    createSchemaTypePlaygroundField(),
  ],
  preview: { prepare: () => ({ title: 'Services Page' }) },
});
