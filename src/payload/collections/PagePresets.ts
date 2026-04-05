import type { CollectionConfig } from 'payload';
import { pageSectionBlocks, modernPageSectionBlockSlugs } from '../blocks/pageSections.ts';
import { auditAfterChange, auditAfterDelete } from '../hooks/auditLog.ts';
import { stampCreatedByBeforeChange } from '../hooks/stampCreatedBy.ts';
import { migrateGuideInquirySectionsBeforeChange } from '../hooks/guideInquirySectionMigration.ts';
import { migrateLegacySectionsBeforeChange } from '../hooks/legacySectionMigration.ts';
import { createdByField } from '../fields/ownership.ts';

export const PagePresets: CollectionConfig = {
  slug: 'page-presets',
  labels: {
    singular: 'Section Template',
    plural: 'Section Templates',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: [
      'workspaceBadge',
      'sourceBadge',
      'name',
      'category',
      'createDraftAction',
      'sourceType',
      'updatedAt',
    ],
    group: 'Pages',
    description: 'Reusable page layouts (section templates). Templates do not own routes — use "Create Draft" to start a new draft from one.',
    components: {
      beforeList: ['@/payload/admin/components/TrashNotFoundBanner'],
      edit: {
        beforeDocumentControls: [
          '@/payload/admin/components/CreateDraftFromDocumentButton',
        ],
      },
    },
  },
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) =>
      !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
    update: ({ req }) =>
      !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
    delete: ({ req }) =>
      !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
  },
  hooks: {
    beforeChange: [
      stampCreatedByBeforeChange,
      migrateLegacySectionsBeforeChange,
      migrateGuideInquirySectionsBeforeChange,
    ],
    afterChange: [auditAfterChange],
    afterDelete: [auditAfterDelete],
  },
  trash: true,
  enableQueryPresets: true,
  fields: [
    {
      name: 'workspaceBadge',
      type: 'ui',
      admin: {
        disableBulkEdit: true,
        disableListColumn: false,
        components: {
          Cell: '@/payload/admin/components/WorkspaceBadgeCell',
          Field: '@/payload/admin/components/HiddenUIField',
        },
      },
    },
    {
      name: 'sourceBadge',
      type: 'ui',
      admin: {
        disableBulkEdit: true,
        disableListColumn: false,
        components: {
          Cell: '@/payload/admin/components/PresetSourceBadge#PresetSourceBadgeCell',
          Field: '@/payload/admin/components/PresetSourceBadge',
        },
      },
    },
    {
      name: 'createDraftAction',
      label: 'Create Draft',
      type: 'ui',
      custom: {
        draftSourceCollection: 'page-presets',
      },
      admin: {
        disableBulkEdit: true,
        disableListColumn: false,
        components: {
          Cell: '@/payload/admin/components/CreateDraftFromRowCell',
          Field: '@/payload/admin/components/HiddenUIField',
        },
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'custom',
      options: [
        { label: 'Core', value: 'core' },
        { label: 'Landing', value: 'landing' },
        { label: 'Campaign', value: 'campaign' },
        { label: 'Internal', value: 'internal' },
        { label: 'Custom', value: 'custom' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Core: system-managed preset for a primary site page. Landing/Campaign: purpose-built layouts. Internal: back-office or utility pages. Custom: team-created layouts.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
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
    {
      name: 'structureMode',
      type: 'select',
      required: true,
      defaultValue: 'editable',
      options: [
        { label: 'Editable Structure', value: 'editable' },
        { label: 'Locked Structure', value: 'locked' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Locked structure prevents adding, removing, or reordering sections in drafts created from this template. Content within sections can still be edited.',
      },
    },
    {
      name: 'sections',
      type: 'blocks',
      blocks: pageSectionBlocks,
      filterOptions: modernPageSectionBlockSlugs,
      admin: {
        description:
          'Define the reusable section layout for this template. Use "Create Draft" to instantiate a new draft from this template. Manage forms in the Forms collection and embed them using Form Section blocks.',
        components: {
          beforeInput: ['@/payload/admin/components/CmsEditorTrainingHint'],
        },
      },
    },
    {
      name: 'sourceType',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'From Live Page', value: 'from-live' },
        { label: 'From Draft', value: 'from-draft' },
        { label: 'From Playground', value: 'from-playground' },
      ],
      access: {
        update: () => false,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Records whether this template was captured manually or from an existing page, draft, or playground.',
      },
    },
    {
      name: 'sourceLivePage',
      type: 'relationship',
      relationTo: 'site-pages',
      access: {
        update: () => false,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (_, siblingData) => siblingData?.sourceType === 'from-live',
      },
    },
    {
      name: 'sourceDraft',
      type: 'relationship',
      relationTo: 'page-drafts',
      access: {
        update: () => false,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (_, siblingData) => siblingData?.sourceType === 'from-draft',
      },
    },
    {
      name: 'sourcePlayground',
      type: 'relationship',
      relationTo: 'page-playgrounds',
      access: {
        update: () => false,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (_, siblingData) => siblingData?.sourceType === 'from-playground',
      },
    },
    {
      name: 'createdFromSnapshotAt',
      label: 'Captured At',
      type: 'date',
      access: {
        update: () => false,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Timestamp when the section layout was snapshotted from its source document.',
      },
    },
    createdByField,
  ],
};
