import type { CollectionConfig } from 'payload';
import { AUDIT_ACTION_OPTIONS } from '../constants/auditActions.ts';

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  admin: {
    useAsTitle: 'summary',
    defaultColumns: ['summary', 'riskTier', 'action', 'collection', 'fieldPath', 'user', 'createdAt'],
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
      options: [...AUDIT_ACTION_OPTIONS],
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
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'documentTitle',
      type: 'text',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'actorId',
      type: 'text',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'userEmail',
      type: 'text',
    },
    {
      name: 'actorRole',
      type: 'text',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'fieldPath',
      type: 'text',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'oldValueSummary',
      type: 'textarea',
      required: true,
    },
    {
      name: 'newValueSummary',
      type: 'textarea',
      required: true,
    },
    {
      name: 'riskTier',
      type: 'select',
      options: [
        { label: 'Routine', value: 'routine' },
        { label: 'System', value: 'system' },
      ],
      defaultValue: 'routine',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'changedAt',
      type: 'date',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'summary',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
  ],
};
