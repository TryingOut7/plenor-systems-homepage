import { defineArrayMember, defineField, defineType } from 'sanity';
import { createSchemaTypePlaygroundField } from './shared/schemaTypePlayground';

const hideLegacyFields = ({ document }: { document?: unknown }) => {
  const sections =
    document && typeof document === 'object' ? (document as { sections?: unknown[] }).sections : undefined;
  return Array.isArray(sections) && sections.length > 0;
};

export const servicesPage = defineType({
  name: 'servicesPage',
  title: 'Services Page',
  type: 'document',
  initialValue: {
    sections: [
      {
        _type: 'servicesHeroSection',
        heading: 'Two framework stages. The two that decide whether a product succeeds.',
        subtext:
          'Testing & QA and Launch & Go-to-Market are where most product failures originate — not in design or development. Plenor Systems is built specifically for these stages.',
      },
      {
        _type: 'servicesTestingSection',
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
      },
      {
        _type: 'servicesLaunchSection',
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
      },
      {
        _type: 'servicesWhySection',
        heading: 'Why a framework, not a one-off engagement',
        body1:
          'Ad-hoc approaches to testing and go-to-market work in isolation but don’t build repeatable capability. Each launch starts from scratch, and teams re-learn the same lessons.',
        body2:
          'A structured framework means your team builds consistent habits — clear criteria before testing begins, defined channels before launch planning starts. It works for startups moving fast and for enterprises that need process rigour across multiple products.',
        body3: 'The framework is not prescriptive. It sets the structure; your team fills in the specifics.',
      },
      {
        _type: 'servicesLinksSection',
        label: 'Internal links',
      },
      {
        _type: 'servicesCtaSection',
        heading: 'Not sure yet?',
        body: 'Start with the guide — see the kinds of mistakes the framework is designed to prevent.',
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
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({ name: 'subtext', title: 'Subtext', type: 'text', rows: 3 }),
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
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 4 }),
            defineField({ name: 'items', title: 'Items', type: 'array', of: [defineArrayMember({ type: 'string' })] }),
            defineField({ name: 'whoFor', title: 'Who It\'s For', type: 'text', rows: 3 }),
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
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 4 }),
            defineField({ name: 'items', title: 'Items', type: 'array', of: [defineArrayMember({ type: 'string' })] }),
            defineField({ name: 'whoFor', title: 'Who It\'s For', type: 'text', rows: 3 }),
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
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({ name: 'body1', title: 'Paragraph 1', type: 'text', rows: 3 }),
            defineField({ name: 'body2', title: 'Paragraph 2', type: 'text', rows: 3 }),
            defineField({ name: 'body3', title: 'Paragraph 3', type: 'text', rows: 3 }),
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
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              initialValue: 'Internal links',
              readOnly: true,
            }),
          ],
          preview: {
            select: { title: 'label' },
            prepare: ({ title }) => ({ title: title || 'Internal links', subtitle: 'Navigation section' }),
          },
        }),
        defineArrayMember({
          name: 'servicesCtaSection',
          title: 'CTA Section',
          type: 'object',
          fields: [
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
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
