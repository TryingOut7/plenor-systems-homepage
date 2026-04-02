import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload';
import { seoFields } from '../fields/seo.ts';
import { workflowStatusField, workflowApprovalFields } from '../fields/workflow.ts';
import { createdByField } from '../fields/ownership.ts';
import { pageSectionBlocks } from '../blocks/pageSections.ts';
import { auditAfterChange, auditAfterDelete } from '../hooks/auditLog.ts';
import { stampCreatedByBeforeChange } from '../hooks/stampCreatedBy.ts';
import { workflowBeforeChange, workflowAfterChange } from '../hooks/workflow.ts';
import { applyCorePresetSections } from '../hooks/sitePagePreset.ts';
import { normalizeSlugBeforeChange } from '../hooks/normalizeSlug.ts';
import { authorScopedUpdate } from '../access/authorScopedAccess.ts';

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
  const nextIsActive = readEffectiveIsActive(incoming, original, operation);
  if (nextPresetKey !== 'home' || !nextIsActive) return incoming;

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
      'Only one Home preset page can be active at a time. Deactivate the other active Home page first.',
    );
  }

  return incoming;
};

export const SitePages: CollectionConfig = {
  slug: 'site-pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'presetKey', 'workflowStatus', 'isActive'],
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
      enforceSitePageActivationRules,
    ],
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
        description: 'Use a core preset to lock page structure and edit text content.',
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
    {
      name: 'pageBackgroundColor',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Override page background color (CSS value, e.g. #F5F5F5)',
      },
    },
    {
      name: 'customHeadScripts',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        description: 'Custom <script> or <link> tags to inject in <head> for this page only',
      },
    },
    {
      name: 'sections',
      type: 'blocks',
      blocks: pageSectionBlocks,
      admin: {
        condition: () => true,
        description:
          'For core presets, structure is locked to template and only text content changes are kept.',
      },
    },
    createdByField,
    workflowStatusField,
    ...workflowApprovalFields,
    ...seoFields,
  ],
};
