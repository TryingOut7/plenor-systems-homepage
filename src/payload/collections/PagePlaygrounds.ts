import type { CollectionConfig } from 'payload';
import { pageSectionBlocks, modernPageSectionBlockSlugs } from '../blocks/pageSections.ts';
import { createdByField } from '../fields/ownership.ts';
import { auditAfterChange, auditAfterDelete } from '../hooks/auditLog.ts';
import { stampCreatedByBeforeChange } from '../hooks/stampCreatedBy.ts';
import { migrateGuideInquirySectionsBeforeChange } from '../hooks/guideInquirySectionMigration.ts';
import { migrateLegacySectionsBeforeChange } from '../hooks/legacySectionMigration.ts';
import { authorScopedUpdate } from '../access/authorScopedAccess.ts';

export const PagePlaygrounds: CollectionConfig = {
  slug: 'page-playgrounds',
  labels: {
    singular: 'Playground',
    plural: 'Playgrounds',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['workspaceBadge', 'name', 'visibility', 'createDraftAction', 'createPresetAction', 'expiresAt', 'updatedAt'],
    group: 'Pages',
    description: 'Safe sandbox area for trying layouts and section combinations before creating a draft.',
    components: {
      beforeList: ['@/payload/admin/components/TrashNotFoundBanner'],
      edit: {
        beforeDocumentControls: [
          '@/payload/admin/components/CreateDraftFromDocumentButton',
          '@/payload/admin/components/CreatePresetFromDocumentButton',
        ],
      },
    },
  },
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) =>
      !!req.user &&
      ['admin', 'editor', 'author'].includes((req.user as Record<string, unknown>).role as string),
    update: authorScopedUpdate,
    delete: authorScopedUpdate,
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
      name: 'createDraftAction',
      label: 'Create Draft',
      type: 'ui',
      custom: {
        draftSourceCollection: 'page-playgrounds',
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
      name: 'createPresetAction',
      label: 'Create Preset',
      type: 'ui',
      custom: {
        presetSourceCollection: 'page-playgrounds',
      },
      admin: {
        disableBulkEdit: true,
        disableListColumn: false,
        components: {
          Cell: '@/payload/admin/components/CreatePresetFromRowCell',
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
      name: 'visibility',
      type: 'select',
      defaultValue: 'private',
      options: [
        { label: 'Private (Only Me)', value: 'private' },
        { label: 'Team', value: 'team' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'notes',
      type: 'textarea',
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
    createdByField,
  ],
};
