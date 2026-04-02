import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon.ts';

export const LegacyCenteredCtaSection: Block = {
  slug: 'legacyCenteredCtaSection',
  dbName: 'legacy_cta',
  labels: { singular: 'Legacy Centered CTA', plural: 'Legacy Centered CTAs' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'textarea' },
    { name: 'buttonLabel', type: 'text' },
    { name: 'buttonHref', type: 'text' },
    { name: 'secondaryLinkLabel', type: 'text' },
    { name: 'secondaryLinkHref', type: 'text' },
  ],
};
