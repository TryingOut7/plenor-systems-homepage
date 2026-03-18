import { defineField, defineType } from 'sanity';
import { LinkIcon } from '@sanity/icons';

function validatePath(value: string | undefined): true | string {
  if (!value) return 'Path is required';
  if (!value.startsWith('/')) return 'Path must start with "/"';
  if (value.includes('http://') || value.includes('https://')) {
    return 'Use relative paths only (example: /new-path)';
  }
  return true;
}

export const redirectRule = defineType({
  name: 'redirectRule',
  title: 'Redirect',
  type: 'document',
  icon: LinkIcon,
  description: 'Redirect old URLs to new ones.',
  fields: [
    defineField({
      name: 'title',
      title: 'Label',
      type: 'string',
      description: 'A name so you can identify this redirect in the list.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'fromPath',
      title: 'From Path',
      type: 'string',
      description: 'The old URL path, e.g. /old-page',
      validation: (Rule) => Rule.required().custom(validatePath),
    }),
    defineField({
      name: 'toPath',
      title: 'To Path',
      type: 'string',
      description: 'Where visitors should be sent, e.g. /new-page',
      validation: (Rule) => Rule.required().custom(validatePath),
    }),
    defineField({
      name: 'isPermanent',
      title: 'Permanent Redirect (308)',
      description: 'Turn on for pages that have moved permanently. Browsers and search engines cache permanent redirects.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'enabled',
      title: 'Enabled',
      description: 'Turn off to temporarily disable this redirect.',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  orderings: [
    {
      title: 'From Path (A-Z)',
      name: 'fromPathAsc',
      by: [{ field: 'fromPath', direction: 'asc' }],
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
      fromPath: 'fromPath',
      toPath: 'toPath',
      enabled: 'enabled',
    },
    prepare: ({ title, fromPath, toPath, enabled }) => ({
      title: title || `${fromPath || '/'} \u2192 ${toPath || '/'}`,
      subtitle: `${enabled === false ? 'Disabled' : 'Active'} \u00B7 ${fromPath || '/'} \u2192 ${toPath || '/'}`,
    }),
  },
});
