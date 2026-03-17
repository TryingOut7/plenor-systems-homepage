import { defineField, defineType } from 'sanity';

export const seoFields = defineType({
  name: 'seoFields',
  title: 'SEO Fields',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      validation: (Rule) => Rule.max(70),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(180),
    }),
    defineField({ name: 'ogTitle', title: 'Open Graph Title', type: 'string' }),
    defineField({
      name: 'ogDescription',
      title: 'Open Graph Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
    }),
    defineField({
      name: 'noindex',
      title: 'Noindex',
      description: 'If enabled, search engines should not index this page.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'nofollow',
      title: 'Nofollow',
      description: 'If enabled, search engines should not follow links on this page.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'includeInSitemap',
      title: 'Include In Sitemap',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'metaTitle',
      subtitle: 'canonicalUrl',
    },
    prepare: ({ title, subtitle }) => ({
      title: title || 'SEO Fields',
      subtitle: subtitle || 'SEO configuration',
    }),
  },
});
