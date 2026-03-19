import type { CollectionConfig } from 'payload';

export const RedirectRules: CollectionConfig = {
  slug: 'redirect-rules',
  admin: {
    useAsTitle: 'fromPath',
    defaultColumns: ['fromPath', 'toPath', 'isPermanent', 'enabled'],
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
    update: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
    delete: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
  },
  trash: true,
  enableQueryPresets: true,
  fields: [
    {
      name: 'fromPath',
      type: 'text',
      required: true,
      admin: {
        description: 'Source path (e.g. /old-page or /old-blog/*)',
      },
    },
    {
      name: 'toPath',
      type: 'text',
      required: true,
      admin: {
        description: 'Destination path (e.g. /new-page)',
      },
    },
    {
      name: 'isPermanent',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Use 308 permanent redirect (otherwise 307 temporary)',
      },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
};
