import { defineField, defineType } from 'sanity';
import { ComponentIcon } from '@sanity/icons';
import { createSiteSectionMembers, siteSectionsInsertMenu } from './shared/siteSections';
import { isSlugUniqueAcrossTypes } from './shared/slugValidation';

export const reusableSection = defineType({
  name: 'reusableSection',
  title: 'Reusable Section',
  type: 'document',
  icon: ComponentIcon,
  description: 'Content blocks you can embed in multiple pages.',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Section Name',
      type: 'string',
      group: 'content',
      description: 'Internal name to identify this reusable block.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title', isUnique: isSlugUniqueAcrossTypes },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      group: 'content',
      description: 'The content blocks that make up this reusable section.',
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
  ],
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
    },
    prepare: ({ title, slug }) => ({
      title: title || 'Reusable Section',
      subtitle: slug ? `/${slug}` : 'Reusable content block',
    }),
  },
});
