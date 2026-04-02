import type { CollectionConfig } from 'payload';
import { seoFields } from '../fields/seo.ts';
import { workflowStatusField, workflowApprovalFields } from '../fields/workflow.ts';
import { createdByField } from '../fields/ownership.ts';
import { auditAfterChange, auditAfterDelete } from '../hooks/auditLog.ts';
import { stampCreatedByBeforeChange } from '../hooks/stampCreatedBy.ts';
import { normalizeSlugBeforeChange } from '../hooks/normalizeSlug.ts';
import { workflowBeforeChange, workflowAfterChange } from '../hooks/workflow.ts';
import { authorScopedUpdate } from '../access/authorScopedAccess.ts';

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'personName',
    defaultColumns: ['personName', 'company', 'isFeatured', 'rating'],
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return { workflowStatus: { equals: 'published' } };
    },
    create: ({ req }) => !!req.user && ['admin', 'editor', 'author'].includes((req.user as Record<string, unknown>).role as string),
    update: authorScopedUpdate,
    delete: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
  },
  hooks: {
    beforeChange: [stampCreatedByBeforeChange, normalizeSlugBeforeChange, workflowBeforeChange],
    afterChange: [workflowAfterChange, auditAfterChange],
    afterDelete: [auditAfterDelete],
  },
  trash: true,
  enableQueryPresets: true,
  fields: [
    {
      name: 'personName',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'role',
      type: 'text',
    },
    {
      name: 'company',
      type: 'text',
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'details',
      type: 'richText',
      admin: {
        description: 'Extended testimonial details',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    createdByField,
    workflowStatusField,
    ...workflowApprovalFields,
    ...seoFields,
  ],
};
