import { defineArrayMember, defineField, defineType } from 'sanity';
import { createSchemaTypePlaygroundField } from './shared/schemaTypePlayground';

const hideLegacyFields = ({ document }: { document?: unknown }) => {
  const sections =
    document && typeof document === 'object' ? (document as { sections?: unknown[] }).sections : undefined;
  return Array.isArray(sections) && sections.length > 0;
};

export const pricingPage = defineType({
  name: 'pricingPage',
  title: 'Pricing Page',
  type: 'document',
  initialValue: {
    sections: [
      {
        _type: 'pricingHeroSection',
        heading: 'Let’s find the right fit for your team.',
        subtext:
          'Pricing is tailored based on your team size and scope. Get in touch and we’ll come back with a proposal.',
      },
      {
        _type: 'pricingIncludedSection',
        heading: 'Everything you need to ship with confidence.',
        items: [
          {
            title: 'Testing & QA Module',
            desc: 'Quality criteria, structured test planning, release readiness checklists, and defect triage.',
          },
          {
            title: 'Launch & Go-to-Market Module',
            desc: 'Positioning and messaging, channel strategy, launch sequencing, and operational readiness.',
          },
          { title: 'Onboarding support', desc: 'Get your team up and running with the framework from day one.' },
        ],
        body:
          'Engagement is straightforward to start. The framework is accessible to teams of any size — no minimum headcount or project scale required.',
      },
      {
        _type: 'pricingAudienceSection',
        heading: 'No minimum team size. Any stage.',
        audiences: [
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
      },
      {
        _type: 'pricingCtaSection',
        heading: 'Ready to talk?',
        body: 'Tell us about your product and team — we’ll come back with a proposal.',
      },
      {
        _type: 'pricingGuideSection',
        heading: 'Not ready to talk yet?',
        body: 'Start with the free guide to get a sense of the problems the framework addresses.',
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
          name: 'pricingHeroSection',
          title: 'Hero Section',
          type: 'object',
          fields: [
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({ name: 'subtext', title: 'Subtext', type: 'text', rows: 3 }),
          ],
          preview: {
            select: { title: 'heading' },
            prepare: ({ title }) => ({ title: title || 'Pricing Hero', subtitle: 'Hero section' }),
          },
        }),
        defineArrayMember({
          name: 'pricingIncludedSection',
          title: 'Included Section',
          type: 'object',
          fields: [
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({
              name: 'items',
              title: 'Items',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({ name: 'title', title: 'Title', type: 'string' }),
                    defineField({ name: 'desc', title: 'Description', type: 'text', rows: 3 }),
                  ],
                  preview: { select: { title: 'title' } },
                }),
              ],
            }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
          ],
          preview: {
            select: { title: 'heading' },
            prepare: ({ title }) => ({ title: title || 'What\'s Included', subtitle: 'Included section' }),
          },
        }),
        defineArrayMember({
          name: 'pricingAudienceSection',
          title: 'Audience Section',
          type: 'object',
          fields: [
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({
              name: 'audiences',
              title: 'Audiences',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({ name: 'label', title: 'Label', type: 'string' }),
                    defineField({ name: 'copy', title: 'Copy', type: 'text', rows: 2 }),
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
          name: 'pricingCtaSection',
          title: 'Contact CTA Section',
          type: 'object',
          fields: [
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 2 }),
          ],
          preview: {
            select: { title: 'heading' },
            prepare: ({ title }) => ({ title: title || 'Contact CTA', subtitle: 'CTA section' }),
          },
        }),
        defineArrayMember({
          name: 'pricingGuideSection',
          title: 'Guide Reminder Section',
          type: 'object',
          fields: [
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 2 }),
          ],
          preview: {
            select: { title: 'heading' },
            prepare: ({ title }) => ({ title: title || 'Guide Reminder', subtitle: 'Guide section' }),
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({ name: 'heroHeading', title: 'Legacy: Hero Heading', type: 'string', fieldset: 'legacy', hidden: hideLegacyFields }),
    defineField({ name: 'heroSubtext', title: 'Legacy: Hero Subtext', type: 'text', rows: 2, fieldset: 'legacy', hidden: hideLegacyFields }),
    defineField({
      name: 'includedItems',
      title: 'Legacy: Included Items',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string' }),
            defineField({ name: 'desc', title: 'Description', type: 'text', rows: 3 }),
          ],
          preview: { select: { title: 'title' } },
        }),
      ],
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({ name: 'includedBody', title: 'Legacy: Included Body', type: 'text', rows: 2, fieldset: 'legacy', hidden: hideLegacyFields }),
    defineField({
      name: 'audiences',
      title: 'Legacy: Audiences',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'copy', title: 'Copy', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'label' } },
        }),
      ],
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({ name: 'ctaHeading', title: 'Legacy: CTA Heading', type: 'string', fieldset: 'legacy', hidden: hideLegacyFields }),
    defineField({ name: 'ctaBody', title: 'Legacy: CTA Body', type: 'text', rows: 2, fieldset: 'legacy', hidden: hideLegacyFields }),
    defineField({ name: 'notReadyHeading', title: 'Legacy: Not Ready Heading', type: 'string', fieldset: 'legacy', hidden: hideLegacyFields }),
    defineField({ name: 'notReadyBody', title: 'Legacy: Not Ready Body', type: 'text', rows: 2, fieldset: 'legacy', hidden: hideLegacyFields }),
    createSchemaTypePlaygroundField(),
  ],
  preview: { prepare: () => ({ title: 'Pricing Page' }) },
});
