import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload';
import { buildSeoFields } from '../fields/seo.ts';
import { workflowStatusField, workflowApprovalFields } from '../fields/workflow.ts';
import { createdByField } from '../fields/ownership.ts';
import {
  modernPageSectionBlockSlugs,
  pageSectionBlocks,
} from '../blocks/pageSections.ts';
import { auditAfterChange, auditAfterDelete } from '../hooks/auditLog.ts';
import { stampCreatedByBeforeChange } from '../hooks/stampCreatedBy.ts';
import { workflowBeforeChange, workflowAfterChange } from '../hooks/workflow.ts';
import { applyCorePresetSections } from '../hooks/sitePagePreset.ts';
import { normalizeSlugBeforeChange } from '../hooks/normalizeSlug.ts';
import { authorScopedUpdate } from '../access/authorScopedAccess.ts';
import { migrateGuideInquirySectionsBeforeChange } from '../hooks/guideInquirySectionMigration.ts';
import { migrateLegacySectionsBeforeChange } from '../hooks/legacySectionMigration.ts';
import { sitePagePublishGuardsBeforeChange } from '../hooks/sitePageGuards.ts';
import { withFieldTier } from '../fields/fieldTier.ts';

const corePresetValues = ['home', 'services', 'about', 'pricing', 'contact'] as const;

function readPresetKey(data: unknown): string {
  if (!data || typeof data !== 'object') return 'custom';
  const key = (data as Record<string, unknown>).presetKey;
  return typeof key === 'string' ? key : 'custom';
}

function isCorePreset(data: unknown): boolean {
  const key = readPresetKey(data);
  return corePresetValues.includes(key as (typeof corePresetValues)[number]);
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function readEffectivePresetKey(incoming: Record<string, unknown>, original: Record<string, unknown>): string {
  const incomingPreset = incoming.presetKey;
  if (typeof incomingPreset === 'string') return incomingPreset;

  const originalPreset = original.presetKey;
  if (typeof originalPreset === 'string') return originalPreset;

  return 'custom';
}

function readEffectiveSlug(incoming: Record<string, unknown>, original: Record<string, unknown>): string {
  const incomingSlug = incoming.slug;
  if (typeof incomingSlug === 'string') return incomingSlug.trim().replace(/^\/+|\/+$/g, '');

  const originalSlug = original.slug;
  if (typeof originalSlug === 'string') return originalSlug.trim().replace(/^\/+|\/+$/g, '');

  return '';
}

function readEffectiveIsActive(
  incoming: Record<string, unknown>,
  original: Record<string, unknown>,
  operation: 'create' | 'update',
): boolean {
  if (typeof incoming.isActive === 'boolean') return incoming.isActive;
  if (typeof original.isActive === 'boolean') return original.isActive;

  // Field default is true for newly created pages.
  return operation === 'create';
}

const enforceSitePageActivationRules: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  const incoming = asObject(data);
  const original = asObject(originalDoc);

  if (operation !== 'create' && operation !== 'update') return incoming;

  const nextPresetKey = readEffectivePresetKey(incoming, original);
  const nextSlug = readEffectiveSlug(incoming, original);
  const nextIsActive = readEffectiveIsActive(incoming, original, operation);
  if (nextPresetKey !== 'home' || nextSlug !== 'home' || !nextIsActive) return incoming;

  const currentId = incoming.id ?? original.id;
  const excludeSelf =
    typeof currentId === 'string' || typeof currentId === 'number'
      ? [{ id: { not_equals: String(currentId) } }]
      : [];

  const result = await req.payload.find({
    collection: 'site-pages',
    where: {
      and: [
        { presetKey: { equals: 'home' } },
        { isActive: { equals: true } },
        ...excludeSelf,
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  if (result.docs.length > 0) {
    throw new Error(
      'Only one active page can use slug "home". Deactivate the current Home page first.',
    );
  }

  return incoming;
};

export const SitePages: CollectionConfig = {
  slug: 'site-pages',
  labels: {
    singular: 'Live Page',
    plural: 'Live Pages',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: [
      'workspaceBadge',
      'lifecycleBadge',
      'title',
      'slug',
      'presetKey',
      'workflowStatus',
      'isActive',
      'createPresetAction',
    ],
    group: 'Pages',
    description: 'Main website pages. Core preset pages use a fixed layout; custom pages use the section builder.',
    components: {
      edit: {
        beforeDocumentControls: ['@/payload/admin/components/CreatePresetFromDocumentButton'],
      },
    },
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return { workflowStatus: { equals: 'published' }, isActive: { equals: true } };
    },
    create: ({ req }) => !!req.user && ['admin', 'editor', 'author'].includes((req.user as Record<string, unknown>).role as string),
    update: authorScopedUpdate,
    delete: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
  },
  hooks: {
    beforeChange: [
      stampCreatedByBeforeChange,
      normalizeSlugBeforeChange,
      workflowBeforeChange,
      applyCorePresetSections,
      migrateLegacySectionsBeforeChange,
      migrateGuideInquirySectionsBeforeChange,
      sitePagePublishGuardsBeforeChange,
      enforceSitePageActivationRules,
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
        { label: 'Layout: Custom', value: 'builder' },
        { label: 'Layout: Fixed', value: 'template' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Choose custom layout controls or fixed template layout.',
        condition: (data) => !isCorePreset(data),
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
        condition: (data, siblingData) => !isCorePreset(data) && siblingData?.pageMode === 'template',
      },
    },
    {
      name: 'presetKey',
      type: 'select',
      defaultValue: 'custom',
      options: [
        { label: 'Custom (Section Builder)', value: 'custom' },
        { label: 'Home Preset', value: 'home' },
        { label: 'Services Preset', value: 'services' },
        { label: 'About Preset', value: 'about' },
        { label: 'Pricing Preset', value: 'pricing' },
        { label: 'Contact Preset', value: 'contact' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Use a core preset to create a ready-made fixed layout (great for duplicating core page styles). You can create multiple pages from the same preset by using a unique slug.',
      },
    },
    {
      name: 'presetContent',
      type: 'json',
      defaultValue: {},
      admin: {
        condition: () => false,
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      access: {
        create: ({ req }) =>
          !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
        update: ({ req }) =>
          !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'hideNavbar',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Hide the navigation bar on this page',
      },
    },
    {
      name: 'hideFooter',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Hide the footer on this page',
      },
    },
    withFieldTier({
      name: 'pageBackgroundColor',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Override page background color (CSS value, e.g. #F5F5F5)',
      },
    }, 'advanced'),
    withFieldTier({
      name: 'customHeadScripts',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        description: 'Custom <script> or <link> tags to inject in <head> for this page only',
      },
    }, 'system'),
    {
      name: 'sections',
      type: 'blocks',
      blocks: pageSectionBlocks,
      filterOptions: modernPageSectionBlockSlugs,
      admin: {
        condition: () => true,
        description:
          'For fixed preset pages, section structure is managed automatically. Edit text/images inside each locked section. Manage forms in the Forms collection and place them using Form Embed sections.',
        components: {
          beforeInput: ['@/payload/admin/components/CmsEditorTrainingHint'],
        },
      },
    },
    {
      name: 'publishQualityScore',
      type: 'number',
      defaultValue: 100,
      access: {
        update: () => false,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Quality score for this draft. See checklist below for what to fix before publishing.',
        components: {
          beforeInput: ['@/payload/admin/components/SitePageQualityChecklistHint'],
        },
      },
    },
    {
      name: 'publishQualityLevel',
      type: 'select',
      defaultValue: 'excellent',
      options: [
        { label: 'Excellent', value: 'excellent' },
        { label: 'Good', value: 'good' },
        { label: 'Needs Attention', value: 'needs_attention' },
        { label: 'Blocked', value: 'blocked' },
      ],
      access: {
        update: () => false,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Quality level derived from publish score thresholds (excellent/good/needs-attention/blocked).',
      },
    },
    {
      name: 'previewDiffSummary',
      type: 'json',
      access: {
        update: () => false,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Template-vs-document diff summary for QA on core preset pages.',
      },
    },
    createdByField,
    workflowStatusField,
    ...workflowApprovalFields,
    ...buildSeoFields({ canonicalSystemTier: true }),
  ],
};
