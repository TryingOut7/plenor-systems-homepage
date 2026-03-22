import type { CollectionConfig } from 'payload';
import { seoFields } from '../fields/seo';
import { workflowStatusField, workflowApprovalFields } from '../fields/workflow';
import { pageSectionBlocks } from '../blocks/pageSections';
import { auditAfterChange, auditAfterDelete } from '../hooks/auditLog';
import { workflowBeforeChange, workflowAfterChange } from '../hooks/workflow';
import { applyCorePresetSections } from '../hooks/sitePagePreset';
import { normalizeSlugBeforeChange } from '../hooks/normalizeSlug';

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
    update: ({ req }) => !!req.user && ['admin', 'editor', 'author'].includes((req.user as Record<string, unknown>).role as string),
    delete: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
  },
  hooks: {
    beforeChange: [normalizeSlugBeforeChange, workflowBeforeChange, applyCorePresetSections],
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
      admin: {
        position: 'sidebar',
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
    workflowStatusField,
    ...workflowApprovalFields,
    ...seoFields,
  ],
};
