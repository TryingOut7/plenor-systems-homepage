import type { CollectionConfig } from 'payload';
import { seoFields } from '../fields/seo';
import { workflowStatusField, workflowApprovalFields } from '../fields/workflow';
import { pageSectionBlocks } from '../blocks/pageSections';
import { auditAfterChange, auditAfterDelete } from '../hooks/auditLog';
import { workflowBeforeChange, workflowAfterChange } from '../hooks/workflow';

export const SitePages: CollectionConfig = {
  slug: 'site-pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'isActive'],
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
      name: 'title',
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
      name: 'pageMode',
      type: 'select',
      defaultValue: 'builder',
      options: [
        { label: 'Builder', value: 'builder' },
        { label: 'Template', value: 'template' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'templateKey',
      type: 'select',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Landing', value: 'landing' },
        { label: 'Article', value: 'article' },
        { label: 'Product', value: 'product' },
      ],
      admin: {
        position: 'sidebar',
        condition: (_, siblingData) => siblingData?.pageMode === 'template',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'sections',
      type: 'blocks',
      blocks: pageSectionBlocks,
    },
    workflowStatusField,
    ...workflowApprovalFields,
    ...seoFields,
  ],
};
