import { defineArrayMember, defineField, defineType } from 'sanity';
import { createSchemaTypePlaygroundField } from './shared/schemaTypePlayground';

const hideLegacyFields = ({ document }: { document?: unknown }) => {
  const sections =
    document && typeof document === 'object' ? (document as { sections?: unknown[] }).sections : undefined;
  return Array.isArray(sections) && sections.length > 0;
};

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact Page',
  type: 'document',
  initialValue: {
    sections: [
      {
        _type: 'contactHeroSection',
        heading: 'Let’s talk.',
        subtext: 'Tell us about your product and team and we’ll get back to you within 2 business days.',
      },
      {
        _type: 'contactGuideSection',
        heading: 'Get the free guide',
        body:
          'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent to your inbox automatically.',
      },
      {
        _type: 'contactInquirySection',
        heading: 'Send a direct inquiry',
        subtext:
          'Tell us about your product, your team, and the challenge you’re working through. We’ll respond within 2 business days.',
      },
      {
        _type: 'contactPrivacySection',
        label: 'By submitting this form, you agree to our',
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
          name: 'contactHeroSection',
          title: 'Hero Section',
          type: 'object',
          fields: [
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({ name: 'subtext', title: 'Subtext', type: 'text', rows: 3 }),
          ],
          preview: {
            select: { title: 'heading' },
            prepare: ({ title }) => ({ title: title || 'Contact Hero', subtitle: 'Hero section' }),
          },
        }),
        defineArrayMember({
          name: 'contactGuideSection',
          title: 'Guide Section',
          type: 'object',
          fields: [
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 4 }),
          ],
          preview: {
            select: { title: 'heading' },
            prepare: ({ title }) => ({ title: title || 'Guide Section', subtitle: 'Guide form section' }),
          },
        }),
        defineArrayMember({
          name: 'contactInquirySection',
          title: 'Inquiry Section',
          type: 'object',
          fields: [
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({ name: 'subtext', title: 'Subtext', type: 'text', rows: 3 }),
          ],
          preview: {
            select: { title: 'heading' },
            prepare: ({ title }) => ({ title: title || 'Inquiry Section', subtitle: 'Inquiry form section' }),
          },
        }),
        defineArrayMember({
          name: 'contactPrivacySection',
          title: 'Privacy Note Section',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Privacy Note Label',
              type: 'string',
              initialValue: 'By submitting this form, you agree to our',
            }),
          ],
          preview: {
            select: { title: 'label' },
            prepare: ({ title }) => ({ title: title || 'Privacy note', subtitle: 'Footer note section' }),
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
      type: 'text',
      rows: 2,
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'inquiryHeading',
      title: 'Legacy: Inquiry Heading',
      type: 'string',
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'inquirySubtext',
      title: 'Legacy: Inquiry Subtext',
      type: 'text',
      rows: 2,
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    defineField({
      name: 'privacyLabel',
      title: 'Legacy: Privacy Note Label',
      type: 'string',
      fieldset: 'legacy',
      hidden: hideLegacyFields,
    }),
    createSchemaTypePlaygroundField(),
  ],
  preview: { prepare: () => ({ title: 'Contact Page' }) },
});
