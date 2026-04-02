import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon.ts';

export const CtaSection: Block = {
  slug: 'ctaSection',
  dbName: 'cta',
  labels: { singular: 'CTA Section', plural: 'CTA Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    { name: 'body', type: 'textarea' },
    { name: 'buttonLabel', type: 'text' },
    { name: 'buttonHref', type: 'text' },
  ],
};
