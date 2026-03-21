import type { CollectionConfig } from 'payload';

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  admin: {
    useAsTitle: 'summary',
    defaultColumns: ['summary', 'action', 'collection', 'user', 'createdAt'],
    group: 'System',
  },
  access: {
    read: ({ req }) => !!req.user && (req.user as Record<string, unknown>).role === 'admin',
    create: () => false,
    update: () => false,
    delete: () => false,
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
