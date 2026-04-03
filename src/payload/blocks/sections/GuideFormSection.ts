import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon.ts';

export const GuideFormSection: Block = {
  slug: 'guideFormSection',
  dbName: 'guide_form',
  labels: { singular: 'Guide Signup Form', plural: 'Guide Signup Forms' },
  fields: [
    ...sectionCommonFields,
    {
      name: 'label',
      type: 'text',
      defaultValue: 'Free resource',
      admin: {
        description: 'Global default labels are in Site Settings → Guide Form Defaults.',
      },
    },
    { name: 'heading', type: 'text', defaultValue: 'Get the free guide' },
    {
      name: 'highlightText',
      type: 'textarea',
      defaultValue: 'The 7 Most Common Product Development Mistakes — and How to Avoid Them.',
    },
    {
      name: 'body',
      type: 'textarea',
      defaultValue:
        'The guide covers common mistakes teams make in Testing & QA and Launch & Go-to-Market, and what to do instead.',
    },
    {
      name: 'emailTemplate',
      type: 'relationship',
      relationTo: 'email-templates',
      admin: {
        description: 'Pick which email template to send when someone submits this form. If left blank the default guide email is sent.',
        position: 'sidebar',
      },
    },
  ],
};
