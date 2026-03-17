import { defineArrayMember, defineField } from 'sanity';

const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'yourProjectId';
const globalResourceId = `${projectId}.${dataset}`;

const referenceTargets = [
  { type: 'homePage' },
  { type: 'aboutPage' },
  { type: 'servicesPage' },
  { type: 'pricingPage' },
  { type: 'contactPage' },
];

const schemaTypePlaygroundMembers = [
  defineArrayMember({
    name: 'stringTypeItem',
    title: 'String Type',
    type: 'object',
    fields: [defineField({ name: 'value', title: 'Value', type: 'string' })],
    preview: {
      select: { title: 'value' },
      prepare: ({ title }) => ({ title: title || 'String Type', subtitle: 'Type: string' }),
    },
  }),
  defineArrayMember({
    name: 'textTypeItem',
    title: 'Text Type',
    type: 'object',
    fields: [defineField({ name: 'value', title: 'Value', type: 'text', rows: 4 })],
    preview: {
      select: { title: 'value' },
      prepare: ({ title }) => ({ title: title || 'Text Type', subtitle: 'Type: text' }),
    },
  }),
  defineArrayMember({
    name: 'numberTypeItem',
    title: 'Number Type',
    type: 'object',
    fields: [defineField({ name: 'value', title: 'Value', type: 'number' })],
    preview: {
      select: { title: 'value' },
      prepare: ({ title }) => ({ title: title || 'Number Type', subtitle: 'Type: number' }),
    },
  }),
  defineArrayMember({
    name: 'booleanTypeItem',
    title: 'Boolean Type',
    type: 'object',
    fields: [defineField({ name: 'value', title: 'Value', type: 'boolean' })],
    preview: {
      select: { title: 'value' },
      prepare: ({ title }) => ({
        title: typeof title === 'boolean' ? (title ? 'True' : 'False') : 'Boolean Type',
        subtitle: 'Type: boolean',
      }),
    },
  }),
  defineArrayMember({
    name: 'dateTypeItem',
    title: 'Date Type',
    type: 'object',
    fields: [defineField({ name: 'value', title: 'Value', type: 'date' })],
    preview: {
      select: { title: 'value' },
      prepare: ({ title }) => ({ title: title || 'Date Type', subtitle: 'Type: date' }),
    },
  }),
  defineArrayMember({
    name: 'datetimeTypeItem',
    title: 'Datetime Type',
    type: 'object',
    fields: [defineField({ name: 'value', title: 'Value', type: 'datetime' })],
    preview: {
      select: { title: 'value' },
      prepare: ({ title }) => ({ title: title || 'Datetime Type', subtitle: 'Type: datetime' }),
    },
  }),
  defineArrayMember({
    name: 'urlTypeItem',
    title: 'URL Type',
    type: 'object',
    fields: [defineField({ name: 'value', title: 'Value', type: 'url' })],
    preview: {
      select: { title: 'value' },
      prepare: ({ title }) => ({ title: title || 'URL Type', subtitle: 'Type: url' }),
    },
  }),
  defineArrayMember({
    name: 'slugTypeItem',
    title: 'Slug Type',
    type: 'object',
    fields: [
      defineField({ name: 'source', title: 'Source', type: 'string' }),
      defineField({
        name: 'value',
        title: 'Value',
        type: 'slug',
        options: { source: 'source' },
      }),
    ],
    preview: {
      select: { title: 'value.current' },
      prepare: ({ title }) => ({ title: title || 'Slug Type', subtitle: 'Type: slug' }),
    },
  }),
  defineArrayMember({
    name: 'arrayTypeItem',
    title: 'Array Type',
    type: 'object',
    fields: [
      defineField({
        name: 'value',
        title: 'Value',
        type: 'array',
        of: [defineArrayMember({ type: 'string' })],
      }),
    ],
    preview: {
      select: { value: 'value' },
      prepare: ({ value }) => ({
        title: Array.isArray(value) ? `Array Type (${value.length} items)` : 'Array Type',
        subtitle: 'Type: array',
      }),
    },
  }),
  defineArrayMember({
    name: 'objectTypeItem',
    title: 'Object Type',
    type: 'object',
    fields: [
      defineField({
        name: 'value',
        title: 'Value',
        type: 'object',
        fields: [
          defineField({ name: 'title', title: 'Title', type: 'string' }),
          defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
        ],
      }),
    ],
    preview: {
      select: { title: 'value.title' },
      prepare: ({ title }) => ({ title: title || 'Object Type', subtitle: 'Type: object' }),
    },
  }),
  defineArrayMember({
    name: 'referenceTypeItem',
    title: 'Reference Type',
    type: 'object',
    fields: [
      defineField({
        name: 'value',
        title: 'Value',
        type: 'reference',
        to: referenceTargets,
      }),
    ],
    preview: {
      prepare: () => ({ title: 'Reference Type', subtitle: 'Type: reference' }),
    },
  }),
  defineArrayMember({
    name: 'crossDatasetReferenceTypeItem',
    title: 'Cross Dataset Reference Type',
    type: 'object',
    fields: [
      defineField({
        name: 'value',
        title: 'Value',
        type: 'crossDatasetReference',
        dataset,
        to: referenceTargets,
      }),
    ],
    preview: {
      prepare: () => ({ title: 'Cross Dataset Reference Type', subtitle: 'Type: crossDatasetReference' }),
    },
  }),
  defineArrayMember({
    name: 'globalDocumentReferenceTypeItem',
    title: 'Global Document Reference Type',
    type: 'object',
    fields: [
      defineField({
        name: 'value',
        title: 'Value',
        type: 'globalDocumentReference',
        resourceType: 'dataset',
        resourceId: globalResourceId,
        to: referenceTargets,
      }),
    ],
    preview: {
      prepare: () => ({ title: 'Global Document Reference Type', subtitle: 'Type: globalDocumentReference' }),
    },
  }),
  defineArrayMember({
    name: 'imageTypeItem',
    title: 'Image Type',
    type: 'object',
    fields: [
      defineField({
        name: 'value',
        title: 'Value',
        type: 'image',
        options: { hotspot: true },
        fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
      }),
    ],
    preview: {
      select: { media: 'value', subtitle: 'value.alt' },
      prepare: ({ media, subtitle }) => ({
        title: 'Image Type',
        subtitle: subtitle || 'Type: image',
        media,
      }),
    },
  }),
  defineArrayMember({
    name: 'fileTypeItem',
    title: 'File Type',
    type: 'object',
    fields: [
      defineField({
        name: 'value',
        title: 'Value',
        type: 'file',
      }),
    ],
    preview: {
      prepare: () => ({ title: 'File Type', subtitle: 'Type: file' }),
    },
  }),
  defineArrayMember({
    name: 'geopointTypeItem',
    title: 'Geopoint Type',
    type: 'object',
    fields: [
      defineField({
        name: 'value',
        title: 'Value',
        type: 'geopoint',
      }),
    ],
    preview: {
      prepare: () => ({ title: 'Geopoint Type', subtitle: 'Type: geopoint' }),
    },
  }),
  defineArrayMember({
    name: 'blockTypeItem',
    title: 'Block Type',
    type: 'object',
    fields: [
      defineField({
        name: 'value',
        title: 'Value',
        type: 'array',
        of: [defineArrayMember({ type: 'block' })],
      }),
    ],
    preview: {
      prepare: () => ({ title: 'Block Type', subtitle: 'Type: block (Portable Text)' }),
    },
  }),
  defineArrayMember({
    name: 'spanTypeItem',
    title: 'Span Type',
    type: 'object',
    fields: [
      defineField({
        name: 'note',
        title: 'Note',
        type: 'string',
        readOnly: true,
        initialValue: 'Span is created inside Block content. Edit the block below to create spans.',
      }),
      defineField({
        name: 'value',
        title: 'Block Content',
        type: 'array',
        of: [defineArrayMember({ type: 'block' })],
      }),
    ],
    preview: {
      prepare: () => ({ title: 'Span Type', subtitle: 'Type: span (inside block)' }),
    },
  }),
];

export function createSchemaTypePlaygroundField() {
  return defineField({
    name: 'schemaTypePlayground',
    title: 'Schema Type Playground',
    description:
      'Use "Add item" to test all schema type examples in one place. This field is for Studio exploration only.',
    type: 'array',
    of: schemaTypePlaygroundMembers,
    fieldset: 'playground',
  });
}
