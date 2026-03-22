import type { CollectionConfig } from 'payload';

export const Logos: CollectionConfig = {
  slug: 'logos',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'order'],
    group: 'Content',
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
    update: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
    delete: ({ req }) => !!req.user && ['admin'].includes((req.user as Record<string, unknown>).role as string),
  },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { description: 'Company or partner name' } },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'href', type: 'text', admin: { description: 'Optional link URL when logo is clicked' } },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Sort order (lower = first)' },
    },
  ],
};
