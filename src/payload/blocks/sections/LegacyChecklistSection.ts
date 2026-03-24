import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon';

export const LegacyChecklistSection: Block = {
  slug: 'legacyChecklistSection',
  dbName: 'legacy_checklist',
  labels: { singular: 'Legacy Checklist', plural: 'Legacy Checklists' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    {
      name: 'items',
      type: 'array',
      dbName: 'lgc_items',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    { name: 'footerBody', type: 'textarea' },
  ],
};
