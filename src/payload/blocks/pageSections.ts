import type { Block } from 'payload';
import { sectionCommonFields } from '../fields/sectionCommon';

const HeroSection: Block = {
  slug: 'heroSection',
  labels: { singular: 'Hero Section', plural: 'Hero Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    { name: 'subheading', type: 'textarea' },
    { name: 'primaryCtaLabel', type: 'text' },
    { name: 'primaryCtaHref', type: 'text' },
  ],
};

const RichTextSection: Block = {
  slug: 'richTextSection',
  labels: { singular: 'Rich Text Section', plural: 'Rich Text Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    { name: 'content', type: 'richText' },
  ],
};

const CtaSection: Block = {
  slug: 'ctaSection',
  labels: { singular: 'CTA Section', plural: 'CTA Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    { name: 'body', type: 'textarea' },
    { name: 'buttonLabel', type: 'text' },
    { name: 'buttonHref', type: 'text' },
  ],
};

const ImageSection: Block = {
  slug: 'imageSection',
  labels: { singular: 'Image Section', plural: 'Image Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    {
      name: 'images',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
      ],
    },
    { name: 'caption', type: 'text' },
  ],
};

const VideoSection: Block = {
  slug: 'videoSection',
  labels: { singular: 'Video Section', plural: 'Video Sections' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    {
      name: 'embedUrl',
      type: 'text',
      admin: { description: 'YouTube or Vimeo embed URL' },
    },
    {
      name: 'posterImage',
      type: 'upload',
      relationTo: 'media',
    },
  ],
};

const SimpleTableSection: Block = {
  slug: 'simpleTableSection',
  labels: { singular: 'Simple Table', plural: 'Simple Tables' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    {
      name: 'columns',
      type: 'array',
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'rows',
      type: 'array',
      fields: [
        {
          name: 'cells',
          type: 'array',
          fields: [{ name: 'value', type: 'text' }],
        },
      ],
    },
  ],
};

const ComparisonTableSection: Block = {
  slug: 'comparisonTableSection',
  labels: { singular: 'Comparison Table', plural: 'Comparison Tables' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    {
      name: 'planColumns',
      type: 'array',
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'features',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        {
          name: 'values',
          type: 'array',
          fields: [{ name: 'value', type: 'text' }],
        },
      ],
    },
  ],
};

const DynamicListSection: Block = {
  slug: 'dynamicListSection',
  labels: { singular: 'Dynamic List', plural: 'Dynamic Lists' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    {
      name: 'source',
      type: 'select',
      required: true,
      options: [
        { label: 'Blog Posts', value: 'blogPost' },
        { label: 'Services', value: 'serviceItem' },
        { label: 'Testimonials', value: 'testimonial' },
      ],
    },
    {
      name: 'viewMode',
      type: 'select',
      defaultValue: 'cards',
      options: [
        { label: 'Cards', value: 'cards' },
        { label: 'List', value: 'list' },
        { label: 'Table', value: 'table' },
      ],
    },
    { name: 'filterField', type: 'text' },
    { name: 'filterValue', type: 'text' },
    { name: 'sortField', type: 'text', defaultValue: 'publishedAt' },
    {
      name: 'sortDirection',
      type: 'select',
      defaultValue: 'desc',
      options: [
        { label: 'Ascending', value: 'asc' },
        { label: 'Descending', value: 'desc' },
      ],
    },
    { name: 'limit', type: 'number', defaultValue: 6 },
    { name: 'enablePagination', type: 'checkbox', defaultValue: true },
  ],
};

const ReusableSectionReference: Block = {
  slug: 'reusableSectionReference',
  labels: { singular: 'Reusable Section', plural: 'Reusable Sections' },
  fields: [
    ...sectionCommonFields,
    {
      name: 'reusableSection',
      type: 'relationship',
      relationTo: 'reusable-sections',
      required: true,
    },
    {
      name: 'overrideHeading',
      type: 'text',
      admin: { description: 'Override the reusable section heading' },
    },
  ],
};

const SpacerSection: Block = {
  slug: 'spacerSection',
  labels: { singular: 'Spacer', plural: 'Spacers' },
  fields: [
    { name: 'height', type: 'number', defaultValue: 40 },
  ],
};

const DividerSection: Block = {
  slug: 'dividerSection',
  labels: { singular: 'Divider', plural: 'Dividers' },
  fields: [
    ...sectionCommonFields,
    { name: 'label', type: 'text' },
  ],
};

export const pageSectionBlocks: Block[] = [
  HeroSection,
  RichTextSection,
  CtaSection,
  ImageSection,
  VideoSection,
  SimpleTableSection,
  ComparisonTableSection,
  DynamicListSection,
  ReusableSectionReference,
  SpacerSection,
  DividerSection,
];
