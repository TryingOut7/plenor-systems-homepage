import { defineField, defineType } from 'sanity';

export const seoFields = defineType({
  name: 'seoFields',
  title: 'SEO Settings',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      description: 'Page title shown in search results and browser tabs. Keep under 70 characters.',
      validation: (Rule) => Rule.max(70).warning('Titles over 70 characters may be truncated in search results.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description: 'Summary shown in search results. Aim for 120\u2013160 characters.',
      validation: (Rule) => Rule.max(180).warning('Descriptions over 160 characters may be truncated.'),
    }),
    defineField({
      name: 'ogTitle',
      title: 'Social Share Title',
      description: 'Title shown when shared on social media. Falls back to Meta Title if empty.',
      type: 'string',
    }),
    defineField({
      name: 'ogDescription',
      title: 'Social Share Description',
      description: 'Description shown on social media cards. Falls back to Meta Description if empty.',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'ogImage',
      title: 'Social Share Image',
      description: 'Recommended size: 1200\u00D7630px. Falls back to a default if empty.',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL',
      description: 'Set only if this content also lives at another URL to avoid duplicate content.',
      type: 'url',
    }),
    defineField({
      name: 'noindex',
      title: 'Hide from Search Engines',
      description: 'When enabled, search engines will not index this page.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'nofollow',
      title: 'No Follow Links',
      description: 'When enabled, search engines will not follow outgoing links on this page.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'includeInSitemap',
      title: 'Include in Sitemap',
      description: 'Uncheck to exclude this page from the XML sitemap.',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'metaTitle',
      subtitle: 'metaDescription',
    },
    prepare: ({ title, subtitle }) => ({
      title: title || 'SEO Settings',
      subtitle: subtitle || 'Not configured',
    }),
  },
});
