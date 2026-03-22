import type { CollectionConfig } from 'payload';

export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'order'],
    group: 'Content',
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
    update: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
    delete: ({ req }) => !!req.user && ['admin'].includes((req.user as Record<string, unknown>).role as string),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', required: true, admin: { description: 'Job title or role' } },
    { name: 'bio', type: 'textarea' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'linkedinHref', type: 'text', admin: { description: 'LinkedIn profile URL' } },
    { name: 'twitterHref', type: 'text', admin: { description: 'Twitter/X profile URL' } },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Sort order (lower = first)' },
    },
  ],
};
