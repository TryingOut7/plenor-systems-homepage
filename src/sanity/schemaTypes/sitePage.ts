import { defineField, defineType } from 'sanity';
import { DocumentsIcon } from '@sanity/icons';
import { createSiteSectionMembers, siteSectionsInsertMenu } from './shared/siteSections';
import { isSlugUniqueAcrossTypes } from './shared/slugValidation';

export const sitePage = defineType({
  name: 'sitePage',
  title: 'Site Page',
  type: 'document',
  icon: DocumentsIcon,
  description: 'Build pages using drag-and-drop sections.',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
    { name: 'advanced', title: 'Advanced' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      group: 'content',
      description: 'The display name for this page.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL Path',
      type: 'slug',
      group: 'content',
      description: 'The URL-friendly path for this page (auto-generated from title).',
      options: { source: 'title', isUnique: isSlugUniqueAcrossTypes },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sections',
      title: 'Page Sections',
      type: 'array',
      group: 'content',
      description: 'Add, reorder, and configure sections to build your page layout.',
      of: createSiteSectionMembers(),
      options: {
        insertMenu: siteSectionsInsertMenu,
      },
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seoFields',
      group: 'seo',
    }),
    defineField({
      name: 'isActive',
      title: 'Page Active',
      description: 'Turn off to hide this page from your site without deleting it.',
      type: 'boolean',
      group: 'advanced',
      initialValue: true,
    }),
    defineField({
      name: 'pageMode',
      title: 'Page Mode',
      type: 'string',
      group: 'advanced',
      description: '"Builder" lets you compose with sections. "Template" uses a predefined layout.',
      options: {
        list: [
          { title: 'Builder', value: 'builder' },
          { title: 'Template', value: 'template' },
        ],
        layout: 'radio',
      },
      initialValue: 'builder',
    }),
    defineField({
      name: 'templateKey',
      title: 'Template Key',
      type: 'string',
      group: 'advanced',
      description: 'Only applies when Page Mode is "Template".',
      options: {
        list: [
          { title: 'Default', value: 'default' },
          { title: 'Landing', value: 'landing' },
          { title: 'Article', value: 'article' },
          { title: 'Product', value: 'product' },
        ],
      },
      initialValue: 'default',
      hidden: ({ parent }) => parent?.pageMode !== 'template',
    }),
  ],
  initialValue: {
    pageMode: 'builder',
    templateKey: 'default',
    isActive: true,
    sections: [
      {
        _type: 'heroSection',
        heading: 'New CMS Page',
        subheading: 'Edit this page fully from Studio without code changes.',
        theme: 'navy',
      },
    ],
  },
  orderings: [
    {
      title: 'Title (A-Z)',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
    {
      title: 'Newest Updated',
      name: 'updatedDesc',
      by: [{ field: '_updatedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      active: 'isActive',
    },
    prepare: ({ title, slug, active }) => ({
      title: title || 'Untitled Page',
      subtitle: `${active === false ? '(Inactive) ' : ''}/${slug || ''}`,
    }),
  },
});
