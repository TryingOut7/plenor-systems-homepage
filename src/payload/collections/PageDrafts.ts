import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload';
import { pageSectionBlocks, modernPageSectionBlockSlugs } from '../blocks/pageSections.ts';
import { workflowStatusField, workflowApprovalFields } from '../fields/workflow.ts';
import { buildSeoFields } from '../fields/seo.ts';
import { createdByField } from '../fields/ownership.ts';
import { auditAfterChange, auditAfterDelete } from '../hooks/auditLog.ts';
import { stampCreatedByBeforeChange } from '../hooks/stampCreatedBy.ts';
import { workflowBeforeChange, workflowAfterChange } from '../hooks/workflow.ts';
import { migrateGuideInquirySectionsBeforeChange } from '../hooks/guideInquirySectionMigration.ts';
import { migrateLegacySectionsBeforeChange } from '../hooks/legacySectionMigration.ts';
import { authorScopedUpdate } from '../access/authorScopedAccess.ts';

const normalizeTargetSlugBeforeChange: CollectionBeforeChangeHook = ({ data }) => {
  if (!data || typeof data !== 'object') return data;
  const incoming = data as Record<string, unknown>;
  const targetSlug = incoming.targetSlug;
  if (typeof targetSlug !== 'string') return incoming;

  incoming.targetSlug = targetSlug.trim().replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/');
  return incoming;
};

function cloneValueWithoutIds<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValueWithoutIds(entry)) as T;
  }

  if (value && typeof value === 'object') {
    const cloned: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      if (key === 'id') continue;
      cloned[key] = cloneValueWithoutIds(nestedValue);
    }
    return cloned as T;
  }

  return value;
}

function readRelationId(value: unknown): null | number | string {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const relationId = (value as Record<string, unknown>).id;
  if (typeof relationId === 'number') return relationId;
  if (typeof relationId === 'string' && relationId.trim()) return relationId.trim();
  return null;
}

const hydrateSectionsFromPresetBeforeChange: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (!data || typeof data !== 'object') return data;
  if (operation !== 'create') return data;

  const incoming = data as Record<string, unknown>;
  const sourceType =
    typeof incoming.sourceType === 'string' ? incoming.sourceType.trim() : '';
  if (sourceType !== 'from-preset') return incoming;

  const sourcePresetId = readRelationId(incoming.sourcePreset);
  if (!sourcePresetId) return incoming;
  if (Array.isArray(incoming.sections) && incoming.sections.length > 0) return incoming;

  const preset = await req.payload.findByID({
    collection: 'page-presets',
    id: sourcePresetId,
    depth: 0,
    overrideAccess: false,
    user: req.user,
  });

  const presetRecord =
    preset && typeof preset === 'object' && !Array.isArray(preset)
      ? (preset as Record<string, unknown>)
      : null;
  const presetSections = Array.isArray(presetRecord?.sections)
    ? (presetRecord?.sections as unknown[])
    : [];
  incoming.sections = cloneValueWithoutIds(presetSections);

  const title =
    typeof incoming.title === 'string' ? incoming.title.trim() : '';
  if (!title) {
    const presetName =
      typeof presetRecord?.name === 'string' ? presetRecord.name.trim() : '';
    if (presetName) {
      incoming.title = `${presetName} Draft`;
    }
  }

  return incoming;
};

export const PageDrafts: CollectionConfig = {
  slug: 'page-drafts',
  labels: {
    singular: 'Draft',
    plural: 'Drafts',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: [
      'workspaceBadge',
      'lifecycleBadge',
      'title',
      'targetSlug',
      'workflowStatus',
      'createPresetAction',
      'updatedAt',
    ],
    group: 'Pages',
    description: 'Working copies for review and experimentation before promotion to live pages.',
    components: {
      edit: {
        beforeDocumentControls: [
          '@/payload/admin/components/PromoteDraftToLiveButton',
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
      normalizeTargetSlugBeforeChange,
      hydrateSectionsFromPresetBeforeChange,
      workflowBeforeChange,
      migrateLegacySectionsBeforeChange,
      migrateGuideInquirySectionsBeforeChange,
    ],
    afterChange: [workflowAfterChange, auditAfterChange],
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
      name: 'lifecycleBadge',
      type: 'ui',
      admin: {
        disableBulkEdit: true,
        disableListColumn: false,
        components: {
          Cell: '@/payload/admin/components/LifecycleBadgeCell',
          Field: '@/payload/admin/components/HiddenUIField',
        },
      },
    },
    {
      name: 'createPresetAction',
      label: 'Create Preset',
      type: 'ui',
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
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'targetSlug',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Target live route slug for this draft (for example "about" or "solutions/qa").',
      },
    },
    {
      name: 'sourceType',
      type: 'select',
      defaultValue: 'blank',
      required: true,
      options: [
        { label: 'Blank', value: 'blank' },
        { label: 'From Live Page', value: 'from-live' },
        { label: 'From Preset', value: 'from-preset' },
        { label: 'From Playground', value: 'from-playground' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'sourcePage',
      type: 'relationship',
      relationTo: 'site-pages',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'sourcePreset',
      type: 'relationship',
      relationTo: 'page-presets',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'sourcePlayground',
      type: 'relationship',
      relationTo: 'page-playgrounds',
      admin: {
        position: 'sidebar',
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
      name: 'editorNotes',
      type: 'textarea',
      admin: {
        description: 'Internal notes for reviewers and future maintainers.',
      },
    },
    createdByField,
    workflowStatusField,
    ...workflowApprovalFields,
    ...buildSeoFields({ canonicalSystemTier: true }),
  ],
};
