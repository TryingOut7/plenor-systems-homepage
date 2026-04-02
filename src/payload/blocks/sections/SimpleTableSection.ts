import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon.ts';

export const SimpleTableSection: Block = {
  slug: 'simpleTableSection',
  dbName: 'simple_table',
  labels: { singular: 'Simple Table', plural: 'Simple Tables' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    {
      name: 'columns',
      type: 'array',
      dbName: 'stbl_cols',
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'rows',
      type: 'array',
      dbName: 'stbl_rows',
      fields: [
        {
          name: 'cells',
          type: 'array',
          dbName: 'stbl_cells',
          fields: [{ name: 'value', type: 'text' }],
        },
      ],
    },
  ],
};
