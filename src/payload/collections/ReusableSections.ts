import type { CollectionConfig } from 'payload';
import {
  modernPageSectionBlockSlugs,
  pageSectionBlocks,
} from '../blocks/pageSections.ts';
import { workflowStatusField, workflowApprovalFields } from '../fields/workflow.ts';
import { workflowBeforeChange, workflowAfterChange } from '../hooks/workflow.ts';
import { auditAfterChange, auditAfterDelete } from '../hooks/auditLog.ts';
import { normalizeSlugBeforeChange } from '../hooks/normalizeSlug.ts';
import { ensureLocalizationBeforeChange, localizationFields } from '../fields/localization.ts';
import { reusableSectionVersioningBeforeChange } from '../hooks/reusableSectionVersioning.ts';

export const ReusableSections: CollectionConfig = {
  slug: 'reusable-sections',
  dbName: 'reuse_sec',
  labels: {
    singular: 'Section Library Item',
    plural: 'Section Library',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'libraryVersion', 'libraryCategory', 'workflowStatus'],
    group: 'System',
    description: 'Shared content blocks reused across pages. Intended for admins and editors.',
  },
  access: {
    read: ({ req }) => {
      const role = (req.user as Record<string, unknown> | undefined)?.role as string | undefined;
      return role === 'admin' || role === 'editor';
    },
    create: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
    update: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
    delete: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
  },
  hooks: {
    beforeChange: [
      normalizeSlugBeforeChange,
      ensureLocalizationBeforeChange,
      reusableSectionVersioningBeforeChange,
      workflowBeforeChange,
    ],
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
      filterOptions: modernPageSectionBlockSlugs,
      admin: {
        components: {
          beforeInput: ['@/payload/admin/components/CmsEditorTrainingHint'],
        },
      },
    },
    {
      name: 'libraryCategory',
      type: 'select',
      defaultValue: 'general',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Hero', value: 'hero' },
        { label: 'CTA', value: 'cta' },
        { label: 'Table', value: 'table' },
        { label: 'Form', value: 'form' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'libraryVersion',
      type: 'number',
      defaultValue: 1,
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Auto-incremented system version for this library item.',
      },
    },
    {
      name: 'libraryChangeSummary',
      type: 'textarea',
      admin: {
        description: 'Summarize what changed in this version for downstream editors.',
      },
    },
    {
      name: 'isDeprecated',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Mark as deprecated to prevent new usage while preserving existing references.',
      },
    },
    ...localizationFields,
    workflowStatusField,
    ...workflowApprovalFields,
  ],
};
