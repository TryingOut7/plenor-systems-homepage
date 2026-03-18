import { defineArrayMember, defineField } from 'sanity';
import type { InsertMenuOptions } from '@sanity/types';

type SanityUser = {
  roles?: Array<{ name?: string }>;
} | null;

const sectionSizeOptions = [
  { title: 'Compact', value: 'compact' },
  { title: 'Regular', value: 'regular' },
  { title: 'Spacious', value: 'spacious' },
];

const sectionThemeOptions = [
  { title: 'White', value: 'white' },
  { title: 'Light', value: 'light' },
  { title: 'Navy', value: 'navy' },
  { title: 'Charcoal', value: 'charcoal' },
  { title: 'Black', value: 'black' },
];

function isAdmin(currentUser?: SanityUser): boolean {
  return !!currentUser?.roles?.some((role) => role.name === 'administrator');
}

function hideForNonAdmins({ currentUser }: { currentUser?: SanityUser | null }): boolean {
  return !isAdmin(currentUser);
}

function getCommonFieldsets() {
  return [
    { name: 'content', title: 'Content' },
    { name: 'design', title: 'Design' },
    { name: 'advanced', title: 'Advanced', options: { collapsible: true, collapsed: true } },
  ];
}

function getCommonDesignFields(defaultTheme = 'white', defaultSize = 'regular') {
  return [
    defineField({
      name: 'theme',
      title: 'Theme',
      type: 'string',
      fieldset: 'design',
      initialValue: defaultTheme,
      options: { list: sectionThemeOptions, layout: 'radio' },
    }),
    defineField({
      name: 'size',
      title: 'Section Size',
      type: 'string',
      fieldset: 'design',
      initialValue: defaultSize,
      options: { list: sectionSizeOptions, layout: 'radio' },
    }),
    defineField({
      name: 'anchorId',
      title: 'Anchor ID',
      type: 'string',
      description: 'Optional anchor (without #), e.g. "pricing-table".',
      fieldset: 'advanced',
    }),
    defineField({
      name: 'customClassName',
      title: 'Custom CSS Class',
      type: 'string',
      fieldset: 'advanced',
      hidden: hideForNonAdmins,
    }),
  ];
}

export const siteSectionTypeNames = {
  hero: 'heroSection',
  richText: 'richTextSection',
  cta: 'ctaSection',
  image: 'imageSection',
  video: 'videoSection',
  simpleTable: 'simpleTableSection',
  comparisonTable: 'comparisonTableSection',
  dynamicList: 'dynamicListSection',
  reusableRef: 'reusableSectionReference',
  spacer: 'spacerSection',
  divider: 'dividerSection',
  advanced: 'advancedDataSection',
} as const;

export const siteSectionsInsertMenu: InsertMenuOptions = {
  views: [{ name: 'list' }],
  groups: [
    {
      name: 'layout',
      title: 'Layout',
      of: [siteSectionTypeNames.hero, siteSectionTypeNames.spacer, siteSectionTypeNames.divider],
    },
    {
      name: 'content',
      title: 'Content',
      of: [siteSectionTypeNames.richText, siteSectionTypeNames.cta, siteSectionTypeNames.reusableRef],
    },
    {
      name: 'media',
      title: 'Media',
      of: [siteSectionTypeNames.image, siteSectionTypeNames.video],
    },
    {
      name: 'data',
      title: 'Data',
      of: [siteSectionTypeNames.simpleTable, siteSectionTypeNames.comparisonTable, siteSectionTypeNames.dynamicList],
    },
    {
      name: 'advanced',
      title: 'Advanced',
      of: [siteSectionTypeNames.advanced],
    },
  ],
};

export function createSiteSectionMembers() {
  return [
    defineArrayMember({
      name: siteSectionTypeNames.hero,
      title: '[Layout] Hero',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({
          name: 'eyebrow',
          title: 'Eyebrow',
          type: 'string',
          fieldset: 'content',
        }),
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          fieldset: 'content',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'subheading',
          title: 'Subheading',
          type: 'text',
          rows: 3,
          fieldset: 'content',
        }),
        defineField({
          name: 'primaryCtaLabel',
          title: 'Primary CTA Label',
          type: 'string',
          fieldset: 'content',
        }),
        defineField({
          name: 'primaryCtaHref',
          title: 'Primary CTA URL',
          type: 'string',
          fieldset: 'content',
        }),
        ...getCommonDesignFields('navy', 'regular'),
      ],
      preview: {
        select: { title: 'heading' },
        prepare: ({ title }) => ({ title: title || 'Hero', subtitle: 'Layout section' }),
      },
    }),
    defineArrayMember({
      name: siteSectionTypeNames.richText,
      title: '[Content] Rich Text',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string', fieldset: 'content' }),
        defineField({
          name: 'content',
          title: 'Content',
          type: 'array',
          fieldset: 'content',
          of: [defineArrayMember({ type: 'block' })],
          validation: (Rule) => Rule.required().min(1),
        }),
        ...getCommonDesignFields('white', 'regular'),
      ],
      preview: {
        select: { title: 'heading' },
        prepare: ({ title }) => ({ title: title || 'Rich Text', subtitle: 'Content section' }),
      },
    }),
    defineArrayMember({
      name: siteSectionTypeNames.cta,
      title: '[Content] CTA',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string', fieldset: 'content' }),
        defineField({ name: 'body', title: 'Body', type: 'text', rows: 3, fieldset: 'content' }),
        defineField({ name: 'buttonLabel', title: 'Button Label', type: 'string', fieldset: 'content' }),
        defineField({ name: 'buttonHref', title: 'Button URL', type: 'string', fieldset: 'content' }),
        ...getCommonDesignFields('light', 'regular'),
      ],
      preview: {
        select: { title: 'heading' },
        prepare: ({ title }) => ({ title: title || 'CTA', subtitle: 'Content section' }),
      },
    }),
    defineArrayMember({
      name: siteSectionTypeNames.image,
      title: '[Media] Image / Gallery',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string', fieldset: 'content' }),
        defineField({
          name: 'images',
          title: 'Images',
          type: 'array',
          fieldset: 'content',
          of: [
            defineArrayMember({
              type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
            }),
          ],
          validation: (Rule) => Rule.required().min(1),
        }),
        defineField({ name: 'caption', title: 'Caption', type: 'text', rows: 2, fieldset: 'content' }),
        ...getCommonDesignFields('white', 'regular'),
      ],
      preview: {
        select: { title: 'heading', media: 'images.0' },
        prepare: ({ title, media }) => ({ title: title || 'Image / Gallery', subtitle: 'Media section', media }),
      },
    }),
    defineArrayMember({
      name: siteSectionTypeNames.video,
      title: '[Media] Video',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string', fieldset: 'content' }),
        defineField({
          name: 'embedUrl',
          title: 'Embed URL',
          description: 'YouTube/Vimeo URL or direct embed URL.',
          type: 'url',
          fieldset: 'content',
        }),
        defineField({
          name: 'videoFile',
          title: 'Uploaded Video File',
          type: 'file',
          fieldset: 'content',
        }),
        defineField({
          name: 'posterImage',
          title: 'Poster Image',
          type: 'image',
          options: { hotspot: true },
          fieldset: 'content',
          fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
        }),
        defineField({
          name: 'autoplay',
          title: 'Autoplay',
          type: 'boolean',
          initialValue: false,
          fieldset: 'advanced',
          hidden: hideForNonAdmins,
        }),
        ...getCommonDesignFields('black', 'regular'),
      ],
      preview: {
        select: { title: 'heading', url: 'embedUrl' },
        prepare: ({ title, url }) => ({ title: title || 'Video', subtitle: url || 'Media section' }),
      },
    }),
    defineArrayMember({
      name: siteSectionTypeNames.simpleTable,
      title: '[Data] Simple Table',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string', fieldset: 'content' }),
        defineField({
          name: 'columns',
          title: 'Columns',
          type: 'array',
          of: [defineArrayMember({ type: 'string' })],
          fieldset: 'content',
          validation: (Rule) => Rule.required().min(1),
        }),
        defineField({
          name: 'rows',
          title: 'Rows',
          type: 'array',
          fieldset: 'content',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({
                  name: 'cells',
                  title: 'Cells',
                  type: 'array',
                  of: [defineArrayMember({ type: 'string' })],
                  validation: (Rule) => Rule.required().min(1),
                }),
              ],
              preview: {
                select: { first: 'cells.0' },
                prepare: ({ first }) => ({ title: first || 'Row' }),
              },
            }),
          ],
          validation: (Rule) => Rule.required().min(1),
        }),
        ...getCommonDesignFields('white', 'regular'),
      ],
      preview: {
        select: { title: 'heading' },
        prepare: ({ title }) => ({ title: title || 'Simple Table', subtitle: 'Data section' }),
      },
    }),
    defineArrayMember({
      name: siteSectionTypeNames.comparisonTable,
      title: '[Data] Comparison Table',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string', fieldset: 'content' }),
        defineField({
          name: 'planColumns',
          title: 'Columns',
          type: 'array',
          of: [defineArrayMember({ type: 'string' })],
          fieldset: 'content',
          validation: (Rule) => Rule.required().min(2),
        }),
        defineField({
          name: 'features',
          title: 'Features',
          type: 'array',
          fieldset: 'content',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({ name: 'label', title: 'Feature Label', type: 'string', validation: (Rule) => Rule.required() }),
                defineField({
                  name: 'values',
                  title: 'Values',
                  type: 'array',
                  of: [defineArrayMember({ type: 'string' })],
                  validation: (Rule) => Rule.required().min(2),
                }),
              ],
              preview: {
                select: { title: 'label' },
              },
            }),
          ],
          validation: (Rule) => Rule.required().min(1),
        }),
        ...getCommonDesignFields('light', 'regular'),
      ],
      preview: {
        select: { title: 'heading' },
        prepare: ({ title }) => ({ title: title || 'Comparison Table', subtitle: 'Data section' }),
      },
    }),
    defineArrayMember({
      name: siteSectionTypeNames.dynamicList,
      title: '[Data] Dynamic List / Repeater',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string', fieldset: 'content' }),
        defineField({
          name: 'source',
          title: 'Source Collection',
          type: 'string',
          fieldset: 'content',
          options: {
            list: [
              { title: 'Blog Posts', value: 'blogPost' },
              { title: 'Service Items', value: 'serviceItem' },
              { title: 'Testimonials', value: 'testimonial' },
            ],
            layout: 'radio',
          },
          initialValue: 'blogPost',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'viewMode',
          title: 'View Mode',
          type: 'string',
          fieldset: 'content',
          options: {
            list: [
              { title: 'Cards', value: 'cards' },
              { title: 'List', value: 'list' },
              { title: 'Table', value: 'table' },
            ],
            layout: 'radio',
          },
          initialValue: 'cards',
        }),
        defineField({
          name: 'filterField',
          title: 'Filter Field',
          type: 'string',
          fieldset: 'content',
          description: 'Optional field name for equality filtering (example: "tags" or "isFeatured").',
        }),
        defineField({
          name: 'filterValue',
          title: 'Filter Value',
          type: 'string',
          fieldset: 'content',
          description: 'Optional filter value matched against filter field.',
        }),
        defineField({
          name: 'sortField',
          title: 'Sort Field',
          type: 'string',
          fieldset: 'content',
          initialValue: 'publishedAt',
        }),
        defineField({
          name: 'sortDirection',
          title: 'Sort Direction',
          type: 'string',
          fieldset: 'content',
          options: {
            list: [
              { title: 'Descending', value: 'desc' },
              { title: 'Ascending', value: 'asc' },
            ],
            layout: 'radio',
          },
          initialValue: 'desc',
        }),
        defineField({
          name: 'limit',
          title: 'Items Per Page',
          type: 'number',
          fieldset: 'content',
          initialValue: 6,
          validation: (Rule) => Rule.required().min(1).max(50),
        }),
        defineField({
          name: 'enablePagination',
          title: 'Enable Pagination',
          type: 'boolean',
          fieldset: 'content',
          initialValue: true,
        }),
        ...getCommonDesignFields('white', 'regular'),
      ],
      preview: {
        select: {
          title: 'heading',
          source: 'source',
          mode: 'viewMode',
        },
        prepare: ({ title, source, mode }) => ({
          title: title || 'Dynamic List',
          subtitle: `${source || 'unknown'} · ${mode || 'cards'}`,
        }),
      },
    }),
    defineArrayMember({
      name: siteSectionTypeNames.reusableRef,
      title: '[Content] Reusable Section Reference',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({
          name: 'reusableSection',
          title: 'Reusable Section',
          type: 'reference',
          to: [{ type: 'reusableSection' }],
          fieldset: 'content',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'overrideHeading',
          title: 'Override Heading',
          type: 'string',
          fieldset: 'content',
        }),
        ...getCommonDesignFields('white', 'regular'),
      ],
      preview: {
        select: { title: 'overrideHeading' },
        prepare: ({ title }) => ({ title: title || 'Reusable Section', subtitle: 'Content reference' }),
      },
    }),
    defineArrayMember({
      name: siteSectionTypeNames.spacer,
      title: '[Layout] Spacer',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({
          name: 'height',
          title: 'Height (px)',
          type: 'number',
          fieldset: 'content',
          initialValue: 40,
          validation: (Rule) => Rule.required().min(8).max(240),
        }),
        ...getCommonDesignFields('white', 'compact'),
      ],
      preview: {
        select: { height: 'height' },
        prepare: ({ height }) => ({ title: `Spacer (${height || 40}px)`, subtitle: 'Layout section' }),
      },
    }),
    defineArrayMember({
      name: siteSectionTypeNames.divider,
      title: '[Layout] Divider',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({
          name: 'label',
          title: 'Label',
          type: 'string',
          fieldset: 'content',
        }),
        ...getCommonDesignFields('light', 'compact'),
      ],
      preview: {
        select: { title: 'label' },
        prepare: ({ title }) => ({ title: title || 'Divider', subtitle: 'Layout section' }),
      },
    }),
    defineArrayMember({
      name: siteSectionTypeNames.advanced,
      title: '[Advanced] Data Types Playground',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
          fieldset: 'content',
        }),
        defineField({
          name: 'publishedDate',
          title: 'Date',
          type: 'date',
          fieldset: 'content',
        }),
        defineField({
          name: 'publishedAt',
          title: 'Datetime',
          type: 'datetime',
          fieldset: 'content',
        }),
        defineField({
          name: 'location',
          title: 'Geopoint',
          type: 'geopoint',
          fieldset: 'content',
        }),
        defineField({
          name: 'attachment',
          title: 'File',
          type: 'file',
          fieldset: 'content',
        }),
        defineField({
          name: 'pageReference',
          title: 'Reference',
          type: 'reference',
          to: [{ type: 'sitePage' }],
          fieldset: 'content',
        }),
        defineField({
          name: 'crossDatasetPageReference',
          title: 'Cross Dataset Reference',
          type: 'crossDatasetReference',
          dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
          to: [
            {
              type: 'sitePage',
              preview: {
                select: { title: 'title', subtitle: 'slug.current' },
                prepare: ({
                  title,
                  subtitle,
                }: {
                  title?: string;
                  subtitle?: string;
                }) => ({
                  title: title || 'Untitled page',
                  subtitle: subtitle ? `/${subtitle}` : '/',
                }),
              },
            },
          ],
          fieldset: 'content',
        }),
        defineField({
          name: 'globalDocumentPageReference',
          title: 'Global Document Reference',
          type: 'globalDocumentReference',
          resourceType: 'dataset',
          resourceId: `${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'project'}.${process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'}`,
          to: [
            {
              type: 'sitePage',
              preview: {
                select: { title: 'title', subtitle: 'slug.current' },
                prepare: ({
                  title,
                  subtitle,
                }: {
                  title?: string;
                  subtitle?: string;
                }) => ({
                  title: title || 'Untitled page',
                  subtitle: subtitle ? `/${subtitle}` : '/',
                }),
              },
            },
          ],
          fieldset: 'content',
        }),
        ...getCommonDesignFields('white', 'regular'),
      ],
      preview: {
        select: { title: 'title' },
        prepare: ({ title }) => ({ title: title || 'Advanced Data', subtitle: 'Advanced section' }),
      },
    }),
  ];
}
