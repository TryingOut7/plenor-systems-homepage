import { defineField, defineType } from 'sanity';

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact Page',
  type: 'document',
  fields: [
    defineField({ name: 'heroHeading', title: 'Hero Heading', type: 'string' }),
    defineField({ name: 'heroSubtext', title: 'Hero Subtext', type: 'text', rows: 2 }),
    defineField({ name: 'inquiryHeading', title: 'Inquiry Form Heading', type: 'string' }),
    defineField({ name: 'inquirySubtext', title: 'Inquiry Form Subtext', type: 'text', rows: 2 }),
  ],
  preview: { prepare: () => ({ title: 'Contact Page' }) },
});
