import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon';

export const LegacyNarrativeSection: Block = {
  slug: 'legacyNarrativeSection',
  dbName: 'legacy_narrative',
  labels: { singular: 'Legacy Narrative', plural: 'Legacy Narratives' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    {
      name: 'paragraphs',
      type: 'array',
      dbName: 'lgn_paras',
      fields: [{ name: 'paragraph', type: 'textarea', required: true }],
    },
    { name: 'linkLabel', type: 'text' },
    { name: 'linkHref', type: 'text' },
  ],
};
