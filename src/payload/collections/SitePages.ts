import {
  ValidationError,
  type CollectionBeforeChangeHook,
  type CollectionConfig,
} from 'payload';
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
import { sitePagePublishGuardsBeforeChange } from '../hooks/sitePageGuards.ts';
import { withFieldTier } from '../fields/fieldTier.ts';

function normalizeSlugCandidate(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/');
}

function readDocumentId(value: unknown): string | null {
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string' && value.trim()) return value.trim();
  return null;
}

export const ensureUniqueSitePageSlugBeforeChange: CollectionBeforeChangeHook = async ({
  collection,
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation !== 'create' && operation !== 'update') return data;

  const incoming = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const slugCandidate = incoming.slug ?? (originalDoc as Record<string, unknown> | undefined)?.slug;
  const normalizedSlug = normalizeSlugCandidate(slugCandidate);
  if (!normalizedSlug) return data;

  const currentId = readDocumentId((originalDoc as Record<string, unknown> | undefined)?.id);
  const existing = await req.payload.find({
    collection: 'site-pages',
    where: {
      slug: { equals: normalizedSlug },
    },
    limit: 5,
    depth: 0,
    overrideAccess: true,
  });

  const conflictingDoc = existing.docs.find((doc: unknown) => {
    const docId = readDocumentId((doc as Record<string, unknown>).id);
    if (!docId) return false;
    if (!currentId) return true;
    return docId !== currentId;
  }) as Record<string, unknown> | undefined;
  if (!conflictingDoc) return data;

  const conflictingTitle =
    typeof conflictingDoc.title === 'string' && conflictingDoc.title.trim()
      ? conflictingDoc.title.trim()
      : `ID ${readDocumentId(conflictingDoc.id) || 'unknown'}`;
  const slugMessage = `Slug "${normalizedSlug}" is already used by "${conflictingTitle}". Choose a different slug.`;

  throw new ValidationError({
    collection: typeof collection?.slug === 'string' ? collection.slug : 'site-pages',
    req,
    errors: [
      {
        path: 'slug',
        label: slugMessage,
        message: slugMessage,
      },
    ],
  });
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
      'updatedAt',
    ],
    group: 'Pages',
    description: 'Main website pages. Core preset pages use a fixed layout; custom pages use the section builder.',
    baseListFilter: () => ({ workflowStatus: { equals: 'published' } }),
    components: {
      beforeList: ['@/payload/admin/components/TrashNotFoundBanner'],
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
    create: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as unknown as Record<string, unknown>).role as string),
    update: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as unknown as Record<string, unknown>).role as string),

    delete: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as unknown as Record<string, unknown>).role as string),
  },
  hooks: {
    beforeChange: [
      stampCreatedByBeforeChange,
      normalizeSlugBeforeChange,
      ensureUniqueSitePageSlugBeforeChange,
      workflowBeforeChange,
      applyCorePresetSections,
      sitePagePublishGuardsBeforeChange,
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
      custom: {
        presetSourceCollection: 'site-pages',
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
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        components: {
          Cell: '@/payload/admin/components/CollectionDocumentTitleLinkCell',
        },
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL path segment. Use "home" for the root ( / ) page. All other slugs map to /<slug>. Auto-formatted: no leading or trailing slashes.',
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
      defaultValue: false,
      access: {
        create: ({ req }) =>
          !!req.user && ['admin', 'editor'].includes((req.user as unknown as Record<string, unknown>).role as string),
        update: ({ req }) =>
          !!req.user && ['admin', 'editor'].includes((req.user as unknown as Record<string, unknown>).role as string),
      },
      admin: {
        position: 'sidebar',
        description: 'Inactive pages are not served on the frontend and do not appear in the sitemap. New pages are inactive by default — activate only once the content is ready.',
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
        description:
          'Inject external scripts for this page only. Only empty <script src="..."></script> tags ' +
          'pointing to allowed domains are loaded — inline scripts are ignored for security. ' +
          'Example: <script src="https://cdn.example.com/widget.js"></script>',
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
          'Add, reorder, and configure page sections. For core preset pages the structure is managed automatically — you can edit content within sections but cannot add or remove them here. Manage forms in the Forms collection and embed them using Form Section blocks.',
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
