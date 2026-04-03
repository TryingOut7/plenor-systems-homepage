import type { Block } from 'payload';
import { structuralKeyField } from '../../fields/sectionCommon.ts';

export const SpacerSection: Block = {
  slug: 'spacerSection',
  dbName: 'spacer',
  labels: { singular: 'Spacer', plural: 'Spacers' },
  fields: [
    structuralKeyField,
    { name: 'height', type: 'number', defaultValue: 40 },
  ],
};
