import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon';

export const SplitSection: Block = {
  slug: 'splitSection',
  dbName: 'split_sec',
  labels: { singular: 'Split / Two-Column Section', plural: 'Split Sections' },
  fields: [
    ...sectionCommonFields,
    {
      name: 'layout',
      type: 'select',
      defaultValue: '50-50',
      options: [
        { label: 'Left Heavy (60/40)', value: '60-40' },
        { label: 'Equal (50/50)', value: '50-50' },
        { label: 'Right Heavy (40/60)', value: '40-60' },
      ],
    },
    {
      name: 'reverseOnMobile',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Reverse column order on mobile (right column shown first)' },
    },
    {
      name: 'verticalAlign',
      type: 'select',
      defaultValue: 'center',
      options: [
        { label: 'Top', value: 'top' },
        { label: 'Center', value: 'center' },
        { label: 'Bottom', value: 'bottom' },
      ],
    },
    {
      name: 'leftType',
      type: 'select',
      defaultValue: 'richText',
      options: [
        { label: 'Rich Text', value: 'richText' },
        { label: 'Image', value: 'image' },
        { label: 'Video Embed', value: 'video' },
      ],
    },
    { name: 'leftHeading', type: 'text' },
    { name: 'leftContent', type: 'richText', admin: { condition: (_, siblingData) => siblingData?.leftType === 'richText' } },
    { name: 'leftImage', type: 'upload', relationTo: 'media', admin: { condition: (_, siblingData) => siblingData?.leftType === 'image' } },
    { name: 'leftVideoUrl', type: 'text', admin: { description: 'YouTube or Vimeo embed URL', condition: (_, siblingData) => siblingData?.leftType === 'video' } },
    { name: 'leftCtaLabel', type: 'text', admin: { description: 'Optional CTA button' } },
    { name: 'leftCtaHref', type: 'text' },
    {
      name: 'rightType',
      type: 'select',
      defaultValue: 'image',
      options: [
        { label: 'Rich Text', value: 'richText' },
        { label: 'Image', value: 'image' },
        { label: 'Video Embed', value: 'video' },
      ],
    },
    { name: 'rightHeading', type: 'text' },
    { name: 'rightContent', type: 'richText', admin: { condition: (_, siblingData) => siblingData?.rightType === 'richText' } },
    { name: 'rightImage', type: 'upload', relationTo: 'media', admin: { condition: (_, siblingData) => siblingData?.rightType === 'image' } },
    { name: 'rightVideoUrl', type: 'text', admin: { description: 'YouTube or Vimeo embed URL', condition: (_, siblingData) => siblingData?.rightType === 'video' } },
    { name: 'rightCtaLabel', type: 'text', admin: { description: 'Optional CTA button' } },
    { name: 'rightCtaHref', type: 'text' },
  ],
};
