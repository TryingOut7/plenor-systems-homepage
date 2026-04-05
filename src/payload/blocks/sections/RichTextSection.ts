import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon.ts';

export const RichTextSection: Block = {
  slug: 'richTextSection',
  dbName: 'richtext',
  labels: { singular: 'Rich Text Section', plural: 'Rich Text Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    { name: 'content', type: 'richText' },
  ],
};
