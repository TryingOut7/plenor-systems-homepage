import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon.ts';

export const HeroSection: Block = {
  slug: 'heroSection',
  dbName: 'hero',
  labels: { singular: 'Hero Section', plural: 'Hero Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    { name: 'subheading', type: 'textarea' },
    { name: 'primaryCtaLabel', type: 'text' },
    { name: 'primaryCtaHref', type: 'text' },
    { name: 'secondaryCtaLabel', type: 'text' },
    { name: 'secondaryCtaHref', type: 'text' },
    { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
    { name: 'backgroundVideo', type: 'text', admin: { description: 'Video URL (mp4) for background video' } },
    {
      name: 'textAlignment',
      type: 'select',
      defaultValue: 'center',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
    { name: 'minHeight', type: 'number', admin: { description: 'Minimum hero height in pixels (e.g. 600)' } },
  ],
};
