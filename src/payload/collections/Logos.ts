import type { CollectionConfig } from 'payload';
import { workflowStatusField, workflowApprovalFields } from '../fields/workflow.ts';
import { auditAfterChange, auditAfterDelete } from '../hooks/auditLog.ts';
import { workflowBeforeChange, workflowAfterChange } from '../hooks/workflow.ts';
import { validatePathOrHttpUrl } from '../validation/url.ts';

export const Logos: CollectionConfig = {
  slug: 'logos',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'workflowStatus', 'order'],
    group: 'Content',
    description: 'Client and partner logos used in logo-strip sections.',
    components: {
      beforeList: ['@/payload/admin/components/TrashNotFoundBanner'],
    },
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return { workflowStatus: { equals: 'published' } };
    },
    create: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
    update: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
    delete: ({ req }) => !!req.user && ['admin'].includes((req.user as Record<string, unknown>).role as string),
  },
  hooks: {
    beforeChange: [workflowBeforeChange],
    afterChange: [workflowAfterChange, auditAfterChange],
    afterDelete: [auditAfterDelete],
  },
  trash: true,
  enableQueryPresets: true,
  fields: [
    { name: 'name', type: 'text', required: true, admin: { description: 'Company or partner name' } },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'url', type: 'text', validate: validatePathOrHttpUrl, admin: { description: 'Optional link URL when logo is clicked' } },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Sort order (lower = first)' },
    },
    workflowStatusField,
    ...workflowApprovalFields,
  ],
};
