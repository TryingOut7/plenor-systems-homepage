import { defineField, defineType } from 'sanity';

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
  title: 'Redirect Rule',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Label',
      type: 'string',
      description: 'Editor-friendly label for this redirect rule.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'fromPath',
      title: 'From Path',
      type: 'string',
      validation: (Rule) => Rule.required().custom(validatePath),
    }),
    defineField({
      name: 'toPath',
      title: 'To Path',
      type: 'string',
      validation: (Rule) => Rule.required().custom(validatePath),
    }),
    defineField({
      name: 'isPermanent',
      title: 'Permanent Redirect (308)',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'enabled',
      title: 'Enabled',
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
      title: title || `${fromPath || '/'} -> ${toPath || '/'}`,
      subtitle: `${enabled ? 'Enabled' : 'Disabled'} · ${fromPath || '/'} -> ${toPath || '/'}`,
    }),
  },
});
