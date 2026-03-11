import { defineField, defineType } from 'sanity';

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({ name: 'heroHeading', title: 'Hero Heading', type: 'string' }),
    defineField({ name: 'heroSubtext', title: 'Hero Subtext', type: 'string' }),
    defineField({ name: 'problemHeading', title: 'Problem Heading', type: 'string' }),
    defineField({ name: 'problemBody1', title: 'Problem Body (paragraph 1)', type: 'text', rows: 3 }),
    defineField({ name: 'problemBody2', title: 'Problem Body (paragraph 2)', type: 'text', rows: 3 }),
    defineField({ name: 'whatWeDoHeading', title: 'What We Do Heading', type: 'string' }),
    defineField({ name: 'testingCardTitle', title: 'Testing Card Title', type: 'string' }),
    defineField({ name: 'testingCardBody', title: 'Testing Card Body', type: 'text', rows: 3 }),
    defineField({ name: 'launchCardTitle', title: 'Launch Card Title', type: 'string' }),
    defineField({ name: 'launchCardBody', title: 'Launch Card Body', type: 'text', rows: 3 }),
    defineField({ name: 'whoForHeading', title: 'Who It\'s For Heading', type: 'string' }),
    defineField({
      name: 'audiences',
      title: 'Audiences',
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
    defineField({ name: 'guideCTAHeading', title: 'Guide CTA Heading', type: 'string' }),
    defineField({ name: 'guideCTABody', title: 'Guide CTA Body', type: 'text', rows: 3 }),
  ],
  preview: { prepare: () => ({ title: 'Home Page' }) },
});
