import { defineField, defineType } from 'sanity';

export const servicesPage = defineType({
  name: 'servicesPage',
  title: 'Services Page',
  type: 'document',
  fields: [
    defineField({ name: 'heroHeading', title: 'Hero Heading', type: 'string' }),
    defineField({ name: 'heroSubtext', title: 'Hero Subtext', type: 'text', rows: 2 }),
    defineField({ name: 'testingBody', title: 'Testing & QA Body', type: 'text', rows: 3 }),
    defineField({
      name: 'testingItems',
      title: 'Testing & QA — What it covers (bullet points)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({ name: 'testingWhoFor', title: 'Testing & QA — Who it\'s for', type: 'text', rows: 2 }),
    defineField({ name: 'launchBody', title: 'Launch & GTM Body', type: 'text', rows: 3 }),
    defineField({
      name: 'launchItems',
      title: 'Launch & GTM — What it covers (bullet points)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({ name: 'launchWhoFor', title: 'Launch & GTM — Who it\'s for', type: 'text', rows: 2 }),
    defineField({ name: 'whyFrameworkHeading', title: 'Why a Framework — Heading', type: 'string' }),
    defineField({ name: 'whyFrameworkBody1', title: 'Why a Framework — Paragraph 1', type: 'text', rows: 3 }),
    defineField({ name: 'whyFrameworkBody2', title: 'Why a Framework — Paragraph 2', type: 'text', rows: 3 }),
    defineField({ name: 'whyFrameworkBody3', title: 'Why a Framework — Paragraph 3', type: 'text', rows: 3 }),
    defineField({ name: 'ctaHeading', title: 'CTA Heading', type: 'string' }),
    defineField({ name: 'ctaBody', title: 'CTA Body', type: 'text', rows: 2 }),
  ],
  preview: { prepare: () => ({ title: 'Services Page' }) },
});
