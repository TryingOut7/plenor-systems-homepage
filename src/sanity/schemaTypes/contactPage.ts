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

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact Page',
  type: 'document',
  initialValue: {
    sections: [
      {
        _type: 'contactHeroSection',
        label: 'Contact',
        heading: 'Let’s talk.',
        subtext: 'Tell us about your product and team and we’ll get back to you within 2 business days.',
        theme: 'navy',
        size: 'regular',
      },
      {
        _type: 'contactGuideSection',
        label: 'Free resource',
        heading: 'Get the free guide',
        highlightText:
          'The 7 Most Common Product Development Mistakes — and How to Avoid Them.',
        body:
          'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent to your inbox automatically.',
        theme: 'light',
        size: 'regular',
      },
      {
        _type: 'contactInquirySection',
        label: 'Send an inquiry',
        heading: 'Send a direct inquiry',
        subtext:
          'Tell us about your product, your team, and the challenge you’re working through. We’ll respond within 2 business days.',
        nextStepsLabel: 'What happens next',
        nextStepsBody:
          'We review every inquiry and respond within 2 business days with initial thoughts or a proposal request.',
        directEmailLabel: 'Prefer email directly?',
        emailAddress: 'hello@plenor.ai',
        linkedinLabel: 'LinkedIn →',
        linkedinHref: 'https://www.linkedin.com/company/plenor-ai',
        theme: 'white',
        size: 'regular',
      },
      {
        _type: 'contactPrivacySection',
        label: 'By submitting this form, you agree to our',
        policyLinkLabel: 'Privacy Policy',
        policyLinkHref: '/privacy',
        theme: 'light',
        size: 'compact',
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
            defineField({ name: 'label', title: 'Section Label', type: 'string', initialValue: 'Contact' }),
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
            prepare: ({ title }) => ({ title: title || 'Contact Hero', subtitle: 'Hero section' }),
          },
        }),
        defineArrayMember({
          name: 'contactGuideSection',
          title: 'Guide Section',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Section Label', type: 'string', initialValue: 'Free resource' }),
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({
              name: 'highlightText',
              title: 'Highlighted Intro Text',
              type: 'string',
              initialValue: 'The 7 Most Common Product Development Mistakes — and How to Avoid Them.',
            }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 4 }),
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
            select: { title: 'heading' },
            prepare: ({ title }) => ({ title: title || 'Guide Section', subtitle: 'Guide form section' }),
          },
        }),
        defineArrayMember({
          name: 'contactInquirySection',
          title: 'Inquiry Section',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Section Label', type: 'string', initialValue: 'Send an inquiry' }),
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({ name: 'subtext', title: 'Subtext', type: 'text', rows: 3 }),
            defineField({ name: 'nextStepsLabel', title: 'Info Box Heading', type: 'string', initialValue: 'What happens next' }),
            defineField({
              name: 'nextStepsBody',
              title: 'Info Box Body',
              type: 'text',
              rows: 2,
              initialValue:
                'We review every inquiry and respond within 2 business days with initial thoughts or a proposal request.',
            }),
            defineField({ name: 'directEmailLabel', title: 'Direct Email Label', type: 'string', initialValue: 'Prefer email directly?' }),
            defineField({ name: 'emailAddress', title: 'Email Address', type: 'string', initialValue: 'hello@plenor.ai' }),
            defineField({ name: 'linkedinLabel', title: 'LinkedIn Label', type: 'string', initialValue: 'LinkedIn →' }),
            defineField({ name: 'linkedinHref', title: 'LinkedIn URL', type: 'string', initialValue: 'https://www.linkedin.com/company/plenor-ai' }),
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
            defineField({
              name: 'policyLinkLabel',
              title: 'Privacy Link Label',
              type: 'string',
              initialValue: 'Privacy Policy',
            }),
            defineField({
              name: 'policyLinkHref',
              title: 'Privacy Link URL',
              type: 'string',
              initialValue: '/privacy',
            }),
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
