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
    { name: 'design', title: 'Appearance', options: { collapsible: true, collapsed: false } },
    { name: 'advanced', title: 'Advanced', options: { collapsible: true, collapsed: true } },
  ];
}

function getCommonDesignFields(defaultTheme = 'white', defaultSize = 'regular') {
  return [
    defineField({
      name: 'theme',
      title: 'Color Theme',
      type: 'string',
      fieldset: 'design',
      description: 'Background colour scheme for this section.',
      initialValue: defaultTheme,
      options: { list: sectionThemeOptions, layout: 'radio' },
    }),
    defineField({
      name: 'size',
      title: 'Spacing',
      type: 'string',
      fieldset: 'design',
      description: 'Vertical padding around this section.',
      initialValue: defaultSize,
      options: { list: sectionSizeOptions, layout: 'radio' },
    }),
    defineField({
      name: 'anchorId',
      title: 'Anchor ID',
      type: 'string',
      description: 'Lets you link directly to this section, e.g. /page#pricing-table',
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
  views: [{ name: 'grid' }, { name: 'list' }],
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
      title: 'Data & Lists',
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
    // ── Layout ──────────────────────────────────────
    defineArrayMember({
      name: siteSectionTypeNames.hero,
      title: 'Hero Banner',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({
          name: 'eyebrow',
          title: 'Eyebrow Text',
          description: 'Small text shown above the heading.',
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
          title: 'Button Text',
          type: 'string',
          fieldset: 'content',
        }),
        defineField({
          name: 'primaryCtaHref',
          title: 'Button Link',
          type: 'string',
          fieldset: 'content',
          description: 'URL or path the button links to.',
        }),
        ...getCommonDesignFields('navy', 'regular'),
      ],
      preview: {
        select: { title: 'heading', theme: 'theme' },
        prepare: ({ title, theme }) => ({
          title: title || 'Hero Banner',
          subtitle: `Hero \u00B7 ${theme || 'navy'}`,
        }),
      },
    }),
    defineArrayMember({
      name: siteSectionTypeNames.spacer,
      title: 'Spacer',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({
          name: 'height',
          title: 'Height (px)',
          type: 'number',
          fieldset: 'content',
          description: 'Vertical space in pixels (8\u2013240).',
          initialValue: 40,
          validation: (Rule) => Rule.required().min(8).max(240),
        }),
        ...getCommonDesignFields('white', 'compact'),
      ],
      preview: {
        select: { height: 'height' },
        prepare: ({ height }) => ({ title: `Spacer \u00B7 ${height || 40}px`, subtitle: 'Layout' }),
      },
    }),
    defineArrayMember({
      name: siteSectionTypeNames.divider,
      title: 'Divider Line',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({
          name: 'label',
          title: 'Label',
          type: 'string',
          fieldset: 'content',
          description: 'Optional text shown on the divider line.',
        }),
        ...getCommonDesignFields('light', 'compact'),
      ],
      preview: {
        select: { title: 'label' },
        prepare: ({ title }) => ({ title: title || 'Divider', subtitle: 'Layout' }),
      },
    }),

    // ── Content ─────────────────────────────────────
    defineArrayMember({
      name: siteSectionTypeNames.richText,
      title: 'Rich Text',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string', fieldset: 'content' }),
        defineField({
          name: 'content',
          title: 'Body',
          type: 'array',
          fieldset: 'content',
          of: [defineArrayMember({ type: 'block' })],
          validation: (Rule) => Rule.required().min(1),
        }),
        ...getCommonDesignFields('white', 'regular'),
      ],
      preview: {
        select: { title: 'heading' },
        prepare: ({ title }) => ({ title: title || 'Rich Text', subtitle: 'Content' }),
      },
    }),
    defineArrayMember({
      name: siteSectionTypeNames.cta,
      title: 'Call to Action',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string', fieldset: 'content' }),
        defineField({ name: 'body', title: 'Body', type: 'text', rows: 3, fieldset: 'content' }),
        defineField({ name: 'buttonLabel', title: 'Button Text', type: 'string', fieldset: 'content' }),
        defineField({
          name: 'buttonHref',
          title: 'Button Link',
          type: 'string',
          fieldset: 'content',
          description: 'URL or path the button links to.',
        }),
        ...getCommonDesignFields('light', 'regular'),
      ],
      preview: {
        select: { title: 'heading' },
        prepare: ({ title }) => ({ title: title || 'Call to Action', subtitle: 'Content' }),
      },
    }),
    defineArrayMember({
      name: siteSectionTypeNames.reusableRef,
      title: 'Reusable Block',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({
          name: 'reusableSection',
          title: 'Choose Reusable Section',
          type: 'reference',
          to: [{ type: 'reusableSection' }],
          fieldset: 'content',
          description: 'Pick a reusable section to embed here.',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'overrideHeading',
          title: 'Override Heading',
          type: 'string',
          fieldset: 'content',
          description: 'Optionally replace the reusable section\u2019s heading.',
        }),
        ...getCommonDesignFields('white', 'regular'),
      ],
      preview: {
        select: { title: 'overrideHeading', refTitle: 'reusableSection.title' },
        prepare: ({ title, refTitle }) => ({
          title: title || refTitle || 'Reusable Block',
          subtitle: 'Embedded content',
        }),
      },
    }),

    // ── Media ───────────────────────────────────────
    defineArrayMember({
      name: siteSectionTypeNames.image,
      title: 'Image / Gallery',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string', fieldset: 'content' }),
        defineField({
          name: 'images',
          title: 'Images',
          type: 'array',
          fieldset: 'content',
          description: 'Upload one or more images. Multiple images show as a gallery.',
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
        prepare: ({ title, media }) => ({ title: title || 'Image / Gallery', subtitle: 'Media', media }),
      },
    }),
    defineArrayMember({
      name: siteSectionTypeNames.video,
      title: 'Video',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string', fieldset: 'content' }),
        defineField({
          name: 'embedUrl',
          title: 'Video URL',
          description: 'Paste a YouTube or Vimeo link.',
          type: 'url',
          fieldset: 'content',
        }),
        defineField({
          name: 'videoFile',
          title: 'Or Upload a Video',
          type: 'file',
          fieldset: 'content',
          description: 'Upload a video file instead of using an embed URL.',
        }),
        defineField({
          name: 'posterImage',
          title: 'Poster / Thumbnail',
          type: 'image',
          options: { hotspot: true },
          fieldset: 'content',
          description: 'Shown before the video plays.',
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
        prepare: ({ title, url }) => ({ title: title || 'Video', subtitle: url || 'Media' }),
      },
    }),

    // ── Data & Lists ────────────────────────────────
    defineArrayMember({
      name: siteSectionTypeNames.simpleTable,
      title: 'Table',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string', fieldset: 'content' }),
        defineField({
          name: 'columns',
          title: 'Column Headers',
          type: 'array',
          of: [defineArrayMember({ type: 'string' })],
          fieldset: 'content',
          description: 'Define your table columns first.',
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
                  title: 'Cell Values',
                  type: 'array',
                  of: [defineArrayMember({ type: 'string' })],
                  description: 'One value per column, in order.',
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
        prepare: ({ title }) => ({ title: title || 'Table', subtitle: 'Data' }),
      },
    }),
    defineArrayMember({
      name: siteSectionTypeNames.comparisonTable,
      title: 'Comparison / Pricing Table',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string', fieldset: 'content' }),
        defineField({
          name: 'planColumns',
          title: 'Plan / Column Names',
          type: 'array',
          of: [defineArrayMember({ type: 'string' })],
          fieldset: 'content',
          description: 'e.g. "Starter", "Pro", "Enterprise"',
          validation: (Rule) => Rule.required().min(2),
        }),
        defineField({
          name: 'features',
          title: 'Features',
          type: 'array',
          fieldset: 'content',
          description: 'Each feature row shows a label and a value per plan.',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({ name: 'label', title: 'Feature Name', type: 'string', validation: (Rule) => Rule.required() }),
                defineField({
                  name: 'values',
                  title: 'Values per Plan',
                  type: 'array',
                  of: [defineArrayMember({ type: 'string' })],
                  description: 'One value for each plan column, in order. Use \u2713 / \u2717 for yes/no.',
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
        prepare: ({ title }) => ({ title: title || 'Comparison Table', subtitle: 'Data' }),
      },
    }),
    defineArrayMember({
      name: siteSectionTypeNames.dynamicList,
      title: 'Auto-Generated List',
      type: 'object',
      fieldsets: getCommonFieldsets(),
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string', fieldset: 'content' }),
        defineField({
          name: 'source',
          title: 'Content Source',
          type: 'string',
          fieldset: 'content',
          description: 'Which collection to pull items from.',
          options: {
            list: [
              { title: 'Blog Posts', value: 'blogPost' },
              { title: 'Services', value: 'serviceItem' },
              { title: 'Testimonials', value: 'testimonial' },
            ],
            layout: 'radio',
          },
          initialValue: 'blogPost',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'viewMode',
          title: 'Display Style',
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
          name: 'limit',
          title: 'Items to Show',
          type: 'number',
          fieldset: 'content',
          description: 'Maximum number of items per page.',
          initialValue: 6,
          validation: (Rule) => Rule.required().min(1).max(50),
        }),
        defineField({
          name: 'enablePagination',
          title: 'Show Pagination',
          type: 'boolean',
          fieldset: 'content',
          description: 'Show next/previous controls when there are more items.',
          initialValue: true,
        }),
        defineField({
          name: 'sortField',
          title: 'Sort By',
          type: 'string',
          fieldset: 'content',
          description: 'Field name to sort results by (e.g. publishedAt, title).',
          initialValue: 'publishedAt',
        }),
        defineField({
          name: 'sortDirection',
          title: 'Sort Order',
          type: 'string',
          fieldset: 'content',
          options: {
            list: [
              { title: 'Newest First', value: 'desc' },
              { title: 'Oldest First', value: 'asc' },
            ],
            layout: 'radio',
          },
          initialValue: 'desc',
        }),
        defineField({
          name: 'filterField',
          title: 'Filter Field',
          type: 'string',
          fieldset: 'advanced',
          description: 'Optional: field name to filter by (e.g. "tags" or "isFeatured").',
        }),
        defineField({
          name: 'filterValue',
          title: 'Filter Value',
          type: 'string',
          fieldset: 'advanced',
          description: 'Value to match against the filter field.',
        }),
        ...getCommonDesignFields('white', 'regular'),
      ],
      preview: {
        select: {
          title: 'heading',
          source: 'source',
          mode: 'viewMode',
        },
        prepare: ({ title, source, mode }) => {
          const sourceLabel = { blogPost: 'Blog', serviceItem: 'Services', testimonial: 'Testimonials' }[source as string] || source;
          return {
            title: title || 'Auto-Generated List',
            subtitle: `${sourceLabel} \u00B7 ${mode || 'cards'}`,
          };
        },
      },
    }),

    // ── Advanced ────────────────────────────────────
    defineArrayMember({
      name: siteSectionTypeNames.advanced,
      title: 'Data Types Playground',
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
        prepare: ({ title }) => ({ title: title || 'Advanced Data', subtitle: 'Playground' }),
      },
    }),
  ];
}
