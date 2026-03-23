import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon';

export const LegacyNumberedStageSection: Block = {
  slug: 'legacyNumberedStageSection',
  dbName: 'legacy_stage',
  labels: { singular: 'Legacy Numbered Stage', plural: 'Legacy Numbered Stages' },
  fields: [
    ...sectionCommonFields,
    { name: 'stageNumber', type: 'text', defaultValue: '01' },
    { name: 'stageLabel', type: 'text', defaultValue: 'Stage' },
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'textarea' },
    {
      name: 'items',
      type: 'array',
      dbName: 'lgs_items',
      fields: [{ name: 'item', type: 'textarea', required: true }],
    },
    { name: 'whoForHeading', type: 'text', defaultValue: 'Who it is for' },
    { name: 'whoForBody', type: 'textarea' },
  ],
};
