import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon.ts';

export const FeatureGridSection: Block = {
  slug: 'featureGridSection',
  dbName: 'feat_grid',
  labels: { singular: 'Feature Grid', plural: 'Feature Grids' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'text' },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
    {
      name: 'features',
      type: 'array',
      dbName: 'feat_items',
      fields: [
        { name: 'icon', type: 'text', admin: { description: 'Emoji or short icon label' } },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
        { name: 'linkLabel', type: 'text' },
        { name: 'linkHref', type: 'text' },
      ],
    },
  ],
};
