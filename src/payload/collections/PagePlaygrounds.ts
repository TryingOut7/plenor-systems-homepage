import type { CollectionConfig, Where } from 'payload';
import { pageSectionBlocks, modernPageSectionBlockSlugs } from '../blocks/pageSections.ts';
import { createdByField } from '../fields/ownership.ts';
import { auditAfterChange, auditAfterDelete } from '../hooks/auditLog.ts';
import { stampCreatedByBeforeChange } from '../hooks/stampCreatedBy.ts';
import { migrateGuideInquirySectionsBeforeChange } from '../hooks/guideInquirySectionMigration.ts';
import { migrateLegacySectionsBeforeChange } from '../hooks/legacySectionMigration.ts';
import { authorScopedUpdate, authorScopedDelete } from '../access/authorScopedAccess.ts';


export const PagePlaygrounds: CollectionConfig = {
  slug: 'page-playgrounds',
  labels: {
    singular: 'Playground',
    plural: 'Playgrounds',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['workspaceBadge', 'name', 'visibility', 'createDraftAction', 'createPresetAction', 'updatedAt'],
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
    read: ({ req }) => {
      if (!req.user) return false;
      const user = req.user as unknown as Record<string, unknown>;
      const role = user.role as string;
      if (['admin', 'editor'].includes(role)) return true;
      const where: Where = {
        or: [
          { visibility: { equals: 'team' } },
          { createdBy: { equals: user.id } },
        ],
      };
      return where;
    },
    create: ({ req }) =>
      !!req.user &&
      ['admin', 'editor', 'author'].includes((req.user as unknown as Record<string, unknown>).role as string),
    update: authorScopedUpdate,
    delete: authorScopedDelete,

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
        description: 'Private playgrounds are visible only to you. Team playgrounds are visible to all logged-in users.',
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
          'Experiment freely with page layouts. Nothing here is live. When you are happy with a layout use "Create Draft" or "Create Preset" to move it into the review pipeline. Manage forms in the Forms collection and embed them using Form Section blocks.',
        components: {
          beforeInput: ['@/payload/admin/components/CmsEditorTrainingHint'],
        },
      },
    },
    createdByField,
  ],
};
