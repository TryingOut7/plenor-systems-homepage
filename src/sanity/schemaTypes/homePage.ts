import { defineArrayMember, defineField, defineType } from 'sanity';
import { createSchemaTypePlaygroundField } from './shared/schemaTypePlayground';

const hideLegacyFields = ({ document }: { document?: unknown }) => {
  const sections =
    document && typeof document === 'object' ? (document as { sections?: unknown[] }).sections : undefined;
  return Array.isArray(sections) && sections.length > 0;
};

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  initialValue: {
    sections: [
      {
        _type: 'homeHeroSection',
        heading: 'Plenor Systems brings structure to the two most failure-prone stages of product development.',
        subtext: 'Testing & QA and Launch & Go-to-Market, done right.',
      },
      {
        _type: 'homeProblemSection',
        heading: 'Most product failures happen at the end, not the beginning.',
        body1:
          "Teams spend months building a product, then rush testing, skip structured QA, and launch without a clear go-to-market plan. The result: bugs found by customers, positioning that misses the market, and launches that don't generate expected traction.",
        body2:
          "These aren't execution failures — they're structural ones. The final stages of product development are consistently underprepared. Plenor Systems is built specifically to fix that.",
      },
      {
        _type: 'homeWhatWeDoSection',
        heading: 'Two stages. Both critical.',
        testingCardTitle: 'Testing & QA that catches what matters before release.',
        testingCardBody:
          'A structured approach to verification, quality criteria, and release readiness. Designed to reduce rework and give your team confidence before shipping.',
        launchCardTitle: 'Launch & Go-to-Market with a plan that holds up on launch day.',
        launchCardBody:
          'From positioning and channel selection to operational readiness, the framework keeps go-to-market work structured rather than reactive.',
      },
      {
        _type: 'homeAudienceSection',
        heading: 'Built for teams at every stage.',
        audiences: [
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
      },
      {
        _type: 'homeGuideSection',
        heading: 'Get the free guide',
        body:
          'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent to your inbox automatically.',
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
          name: 'homeHeroSection',
          title: 'Hero Section',
          type: 'object',
          fields: [
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
              initialValue:
                'Plenor Systems brings structure to the two most failure-prone stages of product development.',
            }),
            defineField({
              name: 'subtext',
              title: 'Subtext',
              type: 'string',
              initialValue: 'Testing & QA and Launch & Go-to-Market, done right.',
            }),
          ],
          preview: {
            select: { title: 'heading' },
            prepare: ({ title }) => ({ title: title || 'Home Hero', subtitle: 'Hero section' }),
          },
        }),
        defineArrayMember({
          name: 'homeProblemSection',
          title: 'Problem Section',
          type: 'object',
          fields: [
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
              initialValue: 'Most product failures happen at the end, not the beginning.',
            }),
            defineField({ name: 'body1', title: 'Body Paragraph 1', type: 'text', rows: 4 }),
            defineField({ name: 'body2', title: 'Body Paragraph 2', type: 'text', rows: 4 }),
          ],
          preview: {
            select: { title: 'heading' },
            prepare: ({ title }) => ({ title: title || 'Problem', subtitle: 'Problem section' }),
          },
        }),
        defineArrayMember({
          name: 'homeWhatWeDoSection',
          title: 'What We Do Section',
          type: 'object',
          fields: [
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
              initialValue: 'Two stages. Both critical.',
            }),
            defineField({ name: 'testingCardTitle', title: 'Stage 1 Title', type: 'string' }),
            defineField({ name: 'testingCardBody', title: 'Stage 1 Body', type: 'text', rows: 3 }),
            defineField({ name: 'launchCardTitle', title: 'Stage 2 Title', type: 'string' }),
            defineField({ name: 'launchCardBody', title: 'Stage 2 Body', type: 'text', rows: 3 }),
          ],
          preview: {
            select: { title: 'heading' },
            prepare: ({ title }) => ({ title: title || 'What We Do', subtitle: 'Cards section' }),
          },
        }),
        defineArrayMember({
          name: 'homeAudienceSection',
          title: 'Audience Section',
          type: 'object',
          fields: [
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
              initialValue: 'Built for teams at every stage.',
            }),
            defineField({
              name: 'audiences',
              title: 'Audiences',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({ name: 'label', title: 'Label', type: 'string' }),
                    defineField({ name: 'copy', title: 'Copy', type: 'text', rows: 3 }),
                  ],
                  preview: { select: { title: 'label' } },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: 'heading' },
            prepare: ({ title }) => ({ title: title || 'Audience', subtitle: 'Audience section' }),
          },
        }),
        defineArrayMember({
          name: 'homeGuideSection',
          title: 'Guide CTA Section',
          type: 'object',
          fields: [
            defineField({ name: 'heading', title: 'Heading', type: 'string', initialValue: 'Get the free guide' }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 4 }),
          ],
          preview: {
            select: { title: 'heading' },
            prepare: ({ title }) => ({ title: title || 'Guide CTA', subtitle: 'Guide section' }),
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'heroHeading',
      title: 'Legacy: Hero Heading',
      type: 'string',
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'heroSubtext',
      title: 'Legacy: Hero Subtext',
      type: 'string',
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'problemHeading',
      title: 'Legacy: Problem Heading',
      type: 'string',
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'problemBody1',
      title: 'Legacy: Problem Body (Paragraph 1)',
      type: 'text',
      rows: 3,
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'problemBody2',
      title: 'Legacy: Problem Body (Paragraph 2)',
      type: 'text',
      rows: 3,
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'whatWeDoHeading',
      title: 'Legacy: What We Do Heading',
      type: 'string',
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'testingCardTitle',
      title: 'Legacy: Testing Card Title',
      type: 'string',
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'testingCardBody',
      title: 'Legacy: Testing Card Body',
      type: 'text',
      rows: 3,
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'launchCardTitle',
      title: 'Legacy: Launch Card Title',
      type: 'string',
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'launchCardBody',
      title: 'Legacy: Launch Card Body',
      type: 'text',
      rows: 3,
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'whoForHeading',
      title: 'Legacy: Who It\'s For Heading',
      type: 'string',
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'audiences',
      title: 'Legacy: Audiences',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'copy', title: 'Copy', type: 'text', rows: 3 }),
          ],
          preview: { select: { title: 'label' } },
        }),
      ],
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'guideCTAHeading',
      title: 'Legacy: Guide CTA Heading',
      type: 'string',
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'guideCTABody',
      title: 'Legacy: Guide CTA Body',
      type: 'text',
      rows: 4,
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    createSchemaTypePlaygroundField(),
  ],
  preview: { prepare: () => ({ title: 'Home Page' }) },
});
