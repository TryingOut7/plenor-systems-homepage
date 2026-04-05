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
    singular: 'Preset',
    plural: 'Presets',
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
    description: 'Reusable page blueprints. Presets do not own routes and cannot be published directly.',
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
        description: 'Editable mode allows add/remove/reorder of sections in drafts created from this preset.',
      },
    },
    {
      name: 'sections',
      type: 'blocks',
      blocks: pageSectionBlocks,
      filterOptions: modernPageSectionBlockSlugs,
      admin: {
        description:
          'Manage forms in the Forms collection and place them using Form Embed sections.',
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
      },
    },
    {
      name: 'createdFromSnapshotAt',
      type: 'date',
      access: {
        update: () => false,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    createdByField,
  ],
};
