import type { CollectionConfig } from 'payload';
import { auditAfterChange, auditAfterDelete } from '../hooks/auditLog.ts';
import { mediaGovernanceBeforeChange } from '../hooks/mediaGovernance.ts';
import { withFieldTier } from '../fields/fieldTier.ts';

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    defaultColumns: ['filename', 'alt', 'mediaQaStatus', 'updatedAt'],
    group: 'Content',
    description: 'Upload and manage website images/documents. Most editors only need alt text and optional captions.',
  },
  upload: {
    mimeTypes: ['image/*', 'application/pdf'],
    focalPoint: true,
    crop: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1920,
        height: undefined,
        position: 'centre',
      },
    ],
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user && ['admin', 'editor', 'author'].includes((req.user as unknown as Record<string, unknown>).role as string),
    update: ({ req }) => !!req.user && ['admin', 'editor', 'author'].includes((req.user as unknown as Record<string, unknown>).role as string),
    delete: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as unknown as Record<string, unknown>).role as string),
  },
  hooks: {
    beforeChange: [mediaGovernanceBeforeChange],
    afterChange: [auditAfterChange],
    afterDelete: [auditAfterDelete],
  },
  folders: true,
  enableQueryPresets: true,
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
      admin: {
        description: 'Optional caption or credit for the media',
      },
    },
    withFieldTier({
      name: 'usageScope',
      type: 'select',
      required: true,
      defaultValue: 'site-only',
      options: [
        { label: 'Site only', value: 'site-only' },
        { label: 'Marketing', value: 'marketing' },
        { label: 'Third-party licensed', value: 'licensed-third-party' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Advanced governance setting. Leave as "Site only" for normal uploads.',
      },
    }, 'advanced'),
    withFieldTier({
      name: 'licenseSource',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Required for third-party assets (license provider, contract, or invoice reference).',
        condition: (_data, siblingData) => siblingData?.usageScope === 'licensed-third-party',
      },
    }, 'advanced'),
    withFieldTier({
      name: 'licenseExpiresAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly' },
        condition: (_data, siblingData) => siblingData?.usageScope === 'licensed-third-party',
      },
    }, 'advanced'),
    {
      name: 'requiresAttribution',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'attributionText',
      type: 'text',
      admin: {
        position: 'sidebar',
        condition: (_data, siblingData) => siblingData?.requiresAttribution === true,
      },
    },
    {
      name: 'mediaQaStatus',
      label: 'Approval Status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending Review', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Restricted', value: 'restricted' },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
        components: {
          Field: '@/payload/admin/components/MediaApprovalStatusField',
        },
      },
    },
    {
      name: 'usageApprovedBy',
      type: 'relationship',
      relationTo: 'users',
      access: {
        update: () => false,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'usageApprovedAt',
      type: 'date',
      access: {
        update: () => false,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
};
