import type { CollectionConfig } from 'payload';

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  admin: {
    useAsTitle: 'summary',
    defaultColumns: ['summary', 'action', 'collection', 'user', 'createdAt'],
    group: 'System',
  },
  access: {
    read: ({ req }) => !!req.user && ['admin'].includes((req.user as Record<string, unknown>).role as string),
    create: () => true,
    update: () => false,
    delete: ({ req }) => !!req.user && ['admin'].includes((req.user as Record<string, unknown>).role as string),
  },
  fields: [
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        { label: 'Create', value: 'create' },
        { label: 'Update', value: 'update' },
        { label: 'Delete', value: 'delete' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'collection',
      type: 'text',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'documentId',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'documentTitle',
      type: 'text',
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'userEmail',
      type: 'text',
    },
    {
      name: 'summary',
      type: 'text',
      admin: { readOnly: true },
    },
  ],
};
