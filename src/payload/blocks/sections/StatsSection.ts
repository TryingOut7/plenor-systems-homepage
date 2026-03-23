import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon';

export const StatsSection: Block = {
  slug: 'statsSection',
  dbName: 'stats_sec',
  labels: { singular: 'Stats Section', plural: 'Stats Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'text' },
    {
      name: 'stats',
      type: 'array',
      dbName: 'stats_items',
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
        { name: 'description', type: 'text' },
      ],
    },
  ],
};
