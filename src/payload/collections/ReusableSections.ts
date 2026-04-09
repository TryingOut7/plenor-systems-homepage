import type { CollectionBeforeChangeHook, CollectionBeforeDeleteHook, CollectionConfig } from 'payload';
import { ValidationError } from 'payload';
import {
  modernPageSectionBlockSlugs,
  pageSectionBlocks,
} from '../blocks/pageSections.ts';
import { workflowStatusField, workflowApprovalFields } from '../fields/workflow.ts';
import { workflowBeforeChange, workflowAfterChange } from '../hooks/workflow.ts';
import { auditAfterChange, auditAfterDelete } from '../hooks/auditLog.ts';
import { normalizeSlugBeforeChange } from '../hooks/normalizeSlug.ts';
import { ensureLocalizationBeforeChange, localizationFields } from '../fields/localization.ts';
import { reusableSectionVersioningBeforeChange } from '../hooks/reusableSectionVersioning.ts';
import { buildPublicVisibilityWhere } from '../access/publicVisibility.ts';

type PageCollection = 'site-pages' | 'page-drafts' | 'page-playgrounds';

async function findReferencingPages(
  req: Parameters<CollectionBeforeDeleteHook>[0]['req'],
  sectionSlug: string,
): Promise<{ collection: PageCollection; titles: string[] }[]> {
  const collections: PageCollection[] = ['site-pages', 'page-drafts', 'page-playgrounds'];
  const results: { collection: PageCollection; titles: string[] }[] = [];

  for (const col of collections) {
    const found = await req.payload.find({
      collection: col,
      where: {
        'sections.reusableSectionSlug': { equals: sectionSlug },
      },
      limit: 20,
      depth: 0,
      overrideAccess: true,
    });
    if (found.docs.length > 0) {
      const titles = found.docs.map((doc: unknown) => {
        const d = doc as Record<string, unknown>;
        return typeof d.title === 'string' && d.title.trim() ? d.title.trim() : `ID ${d.id}`;
      });
      results.push({ collection: col, titles });
    }
  }

  return results;
}

const warnOnDeprecateWithReferences: CollectionBeforeChangeHook = async ({
  collection,
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation !== 'update') return data;

  const incoming = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const wasDeprecated = !!(originalDoc as Record<string, unknown> | undefined)?.isDeprecated;
  const willBeDeprecated = !!incoming.isDeprecated;

  if (wasDeprecated || !willBeDeprecated) return data;

  const sectionSlug = (originalDoc as Record<string, unknown> | undefined)?.slug;
  if (typeof sectionSlug !== 'string' || !sectionSlug.trim()) return data;

  const refs = await findReferencingPages(req, sectionSlug.trim());
  if (refs.length === 0) return data;

  const lines = refs.map(({ collection: col, titles }) =>
    `${col}: ${titles.join(', ')}`,
  );
  const message =
    `This section is still referenced by the following pages — deprecating it will not remove those references, but new usage will be blocked.\n${lines.join('\n')}\nTo proceed, save again with the deprecation confirmed.`;

  throw new ValidationError({
    collection: typeof collection?.slug === 'string' ? collection.slug : 'reusable-sections',
    req,
    errors: [{ path: 'isDeprecated', label: message, message }],
  });
};

const blockDeleteWithReferences: CollectionBeforeDeleteHook = async ({ collection, id, req }) => {
  const doc = await req.payload.findByID({
    collection: 'reusable-sections',
    id,
    depth: 0,
    overrideAccess: true,
  }).catch(() => null);

  const sectionSlug = (doc as Record<string, unknown> | null)?.slug;
  if (typeof sectionSlug !== 'string' || !sectionSlug.trim()) return;

  const refs = await findReferencingPages(req, sectionSlug.trim());
  if (refs.length === 0) return;

  const lines = refs.map(({ collection: col, titles }) =>
    `${col}: ${titles.join(', ')}`,
  );
  const message =
    `Cannot delete: this section is still referenced by the following pages. Remove all references before deleting.\n${lines.join('\n')}`;

  throw new ValidationError({
    collection: typeof collection?.slug === 'string' ? collection.slug : 'reusable-sections',
    req,
    errors: [{ path: 'id', label: message, message }],
  });
};

export const ReusableSections: CollectionConfig = {
  slug: 'reusable-sections',
  dbName: 'reuse_sec',
  labels: {
    singular: 'Section Library Item',
    plural: 'Section Library',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'libraryVersion', 'libraryCategory', 'workflowStatus'],
    group: 'Content',
    description: 'Shared content blocks reused across pages. Intended for admins and editors.',
    components: {
      beforeList: ['@/payload/admin/components/TrashNotFoundBanner'],
    },
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return buildPublicVisibilityWhere({ allowMissingWorkflowStatus: true });
    },
    create: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as unknown as Record<string, unknown>).role as string),
    update: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as unknown as Record<string, unknown>).role as string),
    delete: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as unknown as Record<string, unknown>).role as string),
  },
  hooks: {
    beforeChange: [
      normalizeSlugBeforeChange,
      ensureLocalizationBeforeChange,
      reusableSectionVersioningBeforeChange,
      workflowBeforeChange,
      warnOnDeprecateWithReferences,
    ],
    beforeDelete: [blockDeleteWithReferences],
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
    },
    {
      name: 'sections',
      type: 'blocks',
      blocks: pageSectionBlocks,
      filterOptions: modernPageSectionBlockSlugs,
      admin: {
        components: {
          beforeInput: ['@/payload/admin/components/CmsEditorTrainingHint'],
        },
      },
    },
    {
      name: 'libraryCategory',
      type: 'select',
      defaultValue: 'general',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Hero', value: 'hero' },
        { label: 'CTA', value: 'cta' },
        { label: 'Table', value: 'table' },
        { label: 'Form', value: 'form' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'libraryVersion',
      type: 'number',
      defaultValue: 1,
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Auto-incremented system version for this library item.',
      },
    },
    {
      name: 'libraryChangeSummary',
      type: 'textarea',
      admin: {
        description: 'Summarize what changed in this version for downstream editors.',
      },
    },
    {
      name: 'isDeprecated',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Mark as deprecated to prevent new usage while preserving existing references.',
      },
    },
    ...localizationFields,
    workflowStatusField,
    ...workflowApprovalFields,
  ],
};
