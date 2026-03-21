import type { CollectionConfig } from 'payload';
import { seoFields } from '../fields/seo';
import { workflowStatusField, workflowApprovalFields } from '../fields/workflow';
import { auditAfterChange, auditAfterDelete } from '../hooks/auditLog';
import { workflowBeforeChange, workflowAfterChange } from '../hooks/workflow';

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'personName',
    defaultColumns: ['personName', 'company', 'isFeatured', 'rating'],
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user && ['admin', 'editor', 'author'].includes((req.user as Record<string, unknown>).role as string),
    update: ({ req }) => !!req.user && ['admin', 'editor', 'author'].includes((req.user as Record<string, unknown>).role as string),
    delete: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
  },
  versions: {
    maxPerDoc: 25,
    drafts: {
      autosave: {
        interval: 800,
      },
      schedulePublish: true,
      validate: false,
    },
  },
  hooks: {
    beforeChange: [workflowBeforeChange],
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
    workflowStatusField,
    ...workflowApprovalFields,
    ...seoFields,
  ],
};
