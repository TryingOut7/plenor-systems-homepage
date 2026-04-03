import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon.ts';

export const FormSection: Block = {
  slug: 'formSection',
  dbName: 'form_sec',
  labels: { singular: 'Form Embed', plural: 'Form Embeds' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'text' },
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
      admin: {
        description: 'Create and manage forms in the Forms collection, then select one here.',
      },
    },
    {
      name: 'successMessage',
      type: 'textarea',
      admin: { description: 'Message shown after successful submission (overrides form default)' },
    },
  ],
};
