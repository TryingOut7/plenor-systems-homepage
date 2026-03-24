import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon';

export const LegacyAudienceGridSection: Block = {
  slug: 'legacyAudienceGridSection',
  dbName: 'legacy_audience',
  labels: { singular: 'Legacy Audience Grid', plural: 'Legacy Audience Grids' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    {
      name: 'audiences',
      type: 'array',
      dbName: 'lga_auds',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'copy', type: 'textarea', required: true },
      ],
    },
    { name: 'footerText', type: 'text' },
  ],
};
