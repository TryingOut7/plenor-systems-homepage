import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon.ts';

export const DividerSection: Block = {
  slug: 'dividerSection',
  dbName: 'divider',
  labels: { singular: 'Divider', plural: 'Dividers' },
  fields: [
    ...sectionCommonFields,
    { name: 'label', type: 'text' },
  ],
};
