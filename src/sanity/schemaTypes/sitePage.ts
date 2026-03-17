import { defineField, defineType } from 'sanity';
import { createSiteSectionMembers, siteSectionsInsertMenu } from './shared/siteSections';

export const sitePage = defineType({
  name: 'sitePage',
  title: 'Site Page',
  type: 'document',
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'pageMode',
      title: 'Page Mode',
      type: 'string',
      group: 'advanced',
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
      options: {
        list: [
          { title: 'Default', value: 'default' },
          { title: 'Landing', value: 'landing' },
          { title: 'Article', value: 'article' },
          { title: 'Product', value: 'product' },
        ],
      },
      initialValue: 'default',
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      group: 'content',
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
      description: 'Disable to hide this page from normal routing.',
      type: 'boolean',
      group: 'advanced',
      initialValue: true,
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
      subtitle: `${active === false ? 'Inactive · ' : ''}/${slug || ''}`,
    }),
  },
});
