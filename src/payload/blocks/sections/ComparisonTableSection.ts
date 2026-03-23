import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon';

export const ComparisonTableSection: Block = {
  slug: 'comparisonTableSection',
  dbName: 'cmp_table',
  labels: { singular: 'Comparison Table', plural: 'Comparison Tables' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    {
      name: 'planColumns',
      type: 'array',
      dbName: 'cmp_plan_cols',
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'features',
      type: 'array',
      dbName: 'cmp_features',
      fields: [
        { name: 'label', type: 'text', required: true },
        {
          name: 'values',
          type: 'array',
          dbName: 'cmp_feat_vals',
          fields: [{ name: 'value', type: 'text' }],
        },
      ],
    },
  ],
};
