import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon';

export const FormSection: Block = {
  slug: 'formSection',
  dbName: 'form_sec',
  labels: { singular: 'Form Section', plural: 'Form Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'text' },
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
    },
    {
      name: 'successMessage',
      type: 'textarea',
      admin: { description: 'Message shown after successful submission (overrides form default)' },
    },
  ],
};
