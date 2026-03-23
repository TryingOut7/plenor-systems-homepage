import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon';

export const LegacyHeroSection: Block = {
  slug: 'legacyHeroSection',
  dbName: 'legacy_hero',
  labels: { singular: 'Legacy Hero', plural: 'Legacy Heroes' },
  fields: [
    ...sectionCommonFields,
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'textarea', required: true },
    { name: 'subheading', type: 'textarea' },
    { name: 'primaryCtaLabel', type: 'text' },
    { name: 'primaryCtaHref', type: 'text' },
    { name: 'secondaryCtaLabel', type: 'text' },
    { name: 'secondaryCtaHref', type: 'text' },
  ],
};
