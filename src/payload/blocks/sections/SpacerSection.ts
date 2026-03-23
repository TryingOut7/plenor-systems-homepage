import type { Block } from 'payload';

export const SpacerSection: Block = {
  slug: 'spacerSection',
  dbName: 'spacer',
  labels: { singular: 'Spacer', plural: 'Spacers' },
  fields: [
    { name: 'height', type: 'number', defaultValue: 40 },
  ],
};
