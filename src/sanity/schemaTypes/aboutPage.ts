import { defineArrayMember, defineField, defineType } from 'sanity';

const hideLegacyFields = ({ document }: { document?: unknown }) => {
  const sections =
    document && typeof document === 'object' ? (document as { sections?: unknown[] }).sections : undefined;
  return Array.isArray(sections) && sections.length > 0;
};

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  initialValue: {
    sections: [
      {
        _type: 'aboutHeroSection',
        label: 'About',
        heading: 'Who we are',
        paragraphs: [
          'Plenor Systems is a product development framework built around a specific observation: the stages most likely to cause a launch to fail are Testing & QA and Go-to-Market - and they are consistently the least structured.',
          'Most frameworks cover the full development lifecycle. Plenor Systems covers only the final two stages - not because the others do not matter, but because these two are where structure is most absent and most needed.',
          'The framework is used by teams ranging from early-stage startups to enterprise product groups who need a repeatable, structured process for the stretch of work between build completion and a successful launch.',
        ],
      },
      {
        _type: 'aboutFocusSection',
        label: 'Our Focus',
        heading: 'Narrow by design. Deep by necessity.',
        paragraphs: [
          'Plenor Systems covers two stages: Testing & QA and Launch & Go-to-Market. That scope is intentional.',
          'Narrowing to two stages means the framework goes deep rather than broad. Each module is specific - built from observed patterns of what goes wrong and why. It is not a general project management tool dressed as a product framework.',
          'The narrow focus is a strength, not a limitation. Teams get a framework that is actually applicable to the work at hand, not a set of generic principles that need extensive interpretation.',
        ],
        linkLabel: 'See how the two stages work ->',
        linkHref: '/services',
      },
      {
        _type: 'aboutMissionSection',
        label: 'What we believe',
        quote:
          'A well-built product deserves a structured path to market - and consistent quality standards before it gets there.',
      },
      {
        _type: 'aboutFounderSection',
        label: 'The Team',
        heading: 'The people behind the framework.',
        founderName: '',
        founderRole: '',
        founderBio: '',
      },
      {
        _type: 'aboutCtaSection',
        heading: 'Want to work together?',
        body: 'Get in touch to discuss your product and team, or start with the free guide.',
        primaryButtonLabel: 'Get in touch',
        primaryButtonHref: '/contact',
        secondaryButtonLabel: 'Get the free guide',
        secondaryButtonHref: '/contact#guide',
      },
    ],
  },
  fieldsets: [
    {
      name: 'legacy',
      title: 'Legacy Fields (Deprecated)',
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
          name: 'aboutHeroSection',
          title: 'Hero Section',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Section Label',
              type: 'string',
              initialValue: 'About',
            }),
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
              initialValue: 'Who we are',
            }),
            defineField({
              name: 'paragraphs',
              title: 'Paragraphs',
              type: 'array',
              of: [defineArrayMember({ type: 'text', rows: 3 })],
              validation: (Rule) => Rule.required().min(1).max(3),
            }),
          ],
          preview: {
            select: { title: 'heading' },
            prepare: ({ title }) => ({
              title: title || 'Who we are',
              subtitle: 'Hero section',
            }),
          },
        }),
        defineArrayMember({
          name: 'aboutFocusSection',
          title: 'Focus Section',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Section Label',
              type: 'string',
              initialValue: 'Our Focus',
            }),
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
              initialValue: 'Narrow by design. Deep by necessity.',
            }),
            defineField({
              name: 'paragraphs',
              title: 'Paragraphs',
              type: 'array',
              of: [defineArrayMember({ type: 'text', rows: 3 })],
              validation: (Rule) => Rule.required().min(1).max(3),
            }),
            defineField({
              name: 'linkLabel',
              title: 'Link Label',
              type: 'string',
              initialValue: 'See how the two stages work ->',
            }),
            defineField({
              name: 'linkHref',
              title: 'Link URL',
              type: 'string',
              initialValue: '/services',
            }),
          ],
          preview: {
            select: { title: 'heading' },
            prepare: ({ title }) => ({
              title: title || 'Our focus',
              subtitle: 'Focus section',
            }),
          },
        }),
        defineArrayMember({
          name: 'aboutMissionSection',
          title: 'Mission Section',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Section Label',
              type: 'string',
              initialValue: 'What we believe',
            }),
            defineField({
              name: 'quote',
              title: 'Mission Quote',
              type: 'text',
              rows: 3,
            }),
          ],
          preview: {
            select: { title: 'label' },
            prepare: ({ title }) => ({
              title: title || 'Mission',
              subtitle: 'Mission section',
            }),
          },
        }),
        defineArrayMember({
          name: 'aboutFounderSection',
          title: 'Founder Section',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Section Label',
              type: 'string',
              initialValue: 'The Team',
            }),
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
              initialValue: 'The people behind the framework.',
            }),
            defineField({ name: 'founderName', title: 'Founder Name', type: 'string' }),
            defineField({ name: 'founderRole', title: 'Founder Role', type: 'string' }),
            defineField({ name: 'founderBio', title: 'Founder Bio', type: 'text', rows: 3 }),
          ],
          preview: {
            select: {
              founderName: 'founderName',
              title: 'heading',
            },
            prepare: ({ founderName, title }) => ({
              title: founderName || title || 'Founder section',
              subtitle: 'Founder section',
            }),
          },
        }),
        defineArrayMember({
          name: 'aboutCtaSection',
          title: 'CTA Section',
          type: 'object',
          fields: [
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
              initialValue: 'Want to work together?',
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 2,
            }),
            defineField({
              name: 'primaryButtonLabel',
              title: 'Primary Button Label',
              type: 'string',
              initialValue: 'Get in touch',
            }),
            defineField({
              name: 'primaryButtonHref',
              title: 'Primary Button URL',
              type: 'string',
              initialValue: '/contact',
            }),
            defineField({
              name: 'secondaryButtonLabel',
              title: 'Secondary Button Label',
              type: 'string',
              initialValue: 'Get the free guide',
            }),
            defineField({
              name: 'secondaryButtonHref',
              title: 'Secondary Button URL',
              type: 'string',
              initialValue: '/contact#guide',
            }),
          ],
          preview: {
            select: { title: 'heading' },
            prepare: ({ title }) => ({
              title: title || 'CTA section',
              subtitle: 'CTA section',
            }),
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'heroParagraph1',
      title: 'Legacy: Who We Are — Paragraph 1',
      type: 'text',
      rows: 3,
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'heroParagraph2',
      title: 'Legacy: Who We Are — Paragraph 2',
      type: 'text',
      rows: 3,
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'heroParagraph3',
      title: 'Legacy: Who We Are — Paragraph 3',
      type: 'text',
      rows: 3,
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'focusParagraph1',
      title: 'Legacy: Our Focus — Paragraph 1',
      type: 'text',
      rows: 3,
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'focusParagraph2',
      title: 'Legacy: Our Focus — Paragraph 2',
      type: 'text',
      rows: 3,
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'focusParagraph3',
      title: 'Legacy: Our Focus — Paragraph 3',
      type: 'text',
      rows: 3,
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'missionQuote',
      title: 'Legacy: Mission Quote',
      type: 'text',
      rows: 2,
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'founderName',
      title: 'Legacy: Founder Name',
      type: 'string',
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'founderRole',
      title: 'Legacy: Founder Role',
      type: 'string',
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'founderBio',
      title: 'Legacy: Founder Bio',
      type: 'text',
      rows: 3,
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'ctaHeading',
      title: 'Legacy: CTA Heading',
      type: 'string',
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'ctaBody',
      title: 'Legacy: CTA Body',
      type: 'text',
      rows: 2,
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
  ],
  preview: { prepare: () => ({ title: 'About Page' }) },
});
