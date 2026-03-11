import { defineField, defineType } from 'sanity';

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  fields: [
    defineField({ name: 'heroParagraph1', title: 'Who We Are — Paragraph 1', type: 'text', rows: 3 }),
    defineField({ name: 'heroParagraph2', title: 'Who We Are — Paragraph 2', type: 'text', rows: 3 }),
    defineField({ name: 'heroParagraph3', title: 'Who We Are — Paragraph 3', type: 'text', rows: 3 }),
    defineField({ name: 'focusParagraph1', title: 'Our Focus — Paragraph 1', type: 'text', rows: 3 }),
    defineField({ name: 'focusParagraph2', title: 'Our Focus — Paragraph 2', type: 'text', rows: 3 }),
    defineField({ name: 'focusParagraph3', title: 'Our Focus — Paragraph 3', type: 'text', rows: 3 }),
    defineField({ name: 'missionQuote', title: 'Mission Quote', type: 'text', rows: 2 }),
    defineField({ name: 'founderName', title: 'Founder Name', type: 'string' }),
    defineField({ name: 'founderRole', title: 'Founder Role', type: 'string' }),
    defineField({ name: 'founderBio', title: 'Founder Bio', type: 'text', rows: 3 }),
    defineField({ name: 'ctaHeading', title: 'CTA Heading', type: 'string' }),
    defineField({ name: 'ctaBody', title: 'CTA Body', type: 'text', rows: 2 }),
  ],
  preview: { prepare: () => ({ title: 'About Page' }) },
});
