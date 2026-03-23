import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon';

export const LegacyQuoteSection: Block = {
  slug: 'legacyQuoteSection',
  dbName: 'legacy_quote',
  labels: { singular: 'Legacy Quote', plural: 'Legacy Quotes' },
  fields: [
    ...sectionCommonFields,
    { name: 'sectionLabel', type: 'text' },
    { name: 'quote', type: 'textarea', required: true },
  ],
};
