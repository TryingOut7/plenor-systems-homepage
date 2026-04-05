import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon.ts';

export const QuoteSection: Block = {
  slug: 'quoteSection',
  dbName: 'quote_sec',
  labels: { singular: 'Quote Section', plural: 'Quote Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'quote', type: 'textarea', required: true, admin: { description: 'The quote text (without quotation marks)' } },
    { name: 'attribution', type: 'text', admin: { description: 'Author name, e.g. "Jane Smith"' } },
    { name: 'attributionRole', type: 'text', admin: { description: 'Author role/company, e.g. "CEO, Acme Inc."' } },
    { name: 'photo', type: 'upload', relationTo: 'media', admin: { description: 'Optional author photo' } },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'centered',
      options: [
        { label: 'Centered', value: 'centered' },
        { label: 'Left with border', value: 'left-border' },
        { label: 'Large pull quote', value: 'pull' },
      ],
    },
  ],
};
