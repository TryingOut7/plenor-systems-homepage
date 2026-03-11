import { defineField, defineType } from 'sanity';

export const pricingPage = defineType({
  name: 'pricingPage',
  title: 'Pricing Page',
  type: 'document',
  fields: [
    defineField({ name: 'heroHeading', title: 'Hero Heading', type: 'string' }),
    defineField({ name: 'heroSubtext', title: 'Hero Subtext', type: 'text', rows: 2 }),
    defineField({
      name: 'includedItems',
      title: 'What\'s Included (bullet points)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({ name: 'includedBody', title: 'What\'s Included — Additional text', type: 'text', rows: 2 }),
    defineField({
      name: 'audiences',
      title: 'Who We Work With',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'copy', title: 'Copy', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'label' } },
        },
      ],
    }),
    defineField({ name: 'ctaHeading', title: 'Ready to Talk — Heading', type: 'string' }),
    defineField({ name: 'ctaBody', title: 'Ready to Talk — Body', type: 'text', rows: 2 }),
    defineField({ name: 'notReadyHeading', title: 'Not Ready — Heading', type: 'string' }),
    defineField({ name: 'notReadyBody', title: 'Not Ready — Body', type: 'text', rows: 2 }),
  ],
  preview: { prepare: () => ({ title: 'Pricing Page' }) },
});
