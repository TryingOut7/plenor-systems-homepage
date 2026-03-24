import type { CollectionConfig } from 'payload';
import { pageSectionBlocks } from '../blocks/pageSections';
import { workflowStatusField, workflowApprovalFields } from '../fields/workflow';
import { workflowBeforeChange, workflowAfterChange } from '../hooks/workflow';
import { auditAfterChange, auditAfterDelete } from '../hooks/auditLog';
import { normalizeSlugBeforeChange } from '../hooks/normalizeSlug';

export const ReusableSections: CollectionConfig = {
  slug: 'reusable-sections',
  dbName: 'reuse_sec',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return false;
    },
    create: ({ req }) => !!req.user && ['admin', 'editor', 'author'].includes((req.user as Record<string, unknown>).role as string),
    update: ({ req }) => !!req.user && ['admin', 'editor', 'author'].includes((req.user as Record<string, unknown>).role as string),
    delete: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
  },
  hooks: {
    beforeChange: [normalizeSlugBeforeChange, workflowBeforeChange],
    afterChange: [workflowAfterChange, auditAfterChange],
    afterDelete: [auditAfterDelete],
  },
  trash: true,
  enableQueryPresets: true,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'sections',
      type: 'blocks',
      blocks: pageSectionBlocks,
    },
    workflowStatusField,
    ...workflowApprovalFields,
  ],
};
