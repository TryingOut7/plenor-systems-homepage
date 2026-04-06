import type { CollectionConfig } from 'payload';
import { AUDIT_ACTION_OPTIONS } from '../constants/auditActions.ts';

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  admin: {
    useAsTitle: 'summary',
    defaultColumns: ['summary', 'riskTier', 'action', 'collection', 'documentTitle', 'user', 'createdAt'],
    group: 'System',
  },
  access: {
    read: ({ req }) => !!req.user && (req.user as unknown as Record<string, unknown>).role === 'admin',
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
      name: 'ipAddress',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true },
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
      admin: {
        position: 'sidebar',
        description: 'Routine = normal content change, System = high-risk settings or policy-governed changes.',
      },
    },
    {
      name: 'summary',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
  ],
};
