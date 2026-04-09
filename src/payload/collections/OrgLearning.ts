import type { CollectionConfig } from 'payload';
import {
  BoldFeature,
  InlineToolbarFeature,
  ItalicFeature,
  lexicalEditor,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnderlineFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical';
import { seoFields } from '../fields/seo.ts';
import { orgWorkflowStatusField, workflowApprovalFields } from '../fields/workflow.ts';
import { createdByField } from '../fields/ownership.ts';
import { auditAfterChange, auditAfterDelete } from '../hooks/auditLog.ts';
import { stampCreatedByBeforeChange } from '../hooks/stampCreatedBy.ts';
import { normalizeSlugBeforeChange } from '../hooks/normalizeSlug.ts';
import { workflowBeforeChange, workflowAfterChange } from '../hooks/workflow.ts';
import { authorScopedUpdate } from '../access/authorScopedAccess.ts';
import { buildPublicVisibilityWhere } from '../access/publicVisibility.ts';
import { CleanPasteFeature } from '../editor/features/cleanPasteFeature.ts';
import { validateHttpUrl } from '../validation/url.ts';
import {
  LEARNING_CATEGORIES,
  ORG_SLUG_MAX_LENGTH,
  toPayloadOptions,
  validateOrgSlug,
} from '../../domain/org-site/constants.ts';

const richTextEditor = lexicalEditor({
  features: () => [
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    ParagraphFeature(),
    UnorderedListFeature(),
    OrderedListFeature(),
    LinkFeature({ disableAutoLinks: 'creationOnly' }),
    CleanPasteFeature(),
    InlineToolbarFeature(),
  ],
});

export const OrgLearning: CollectionConfig = {
  slug: 'org-learning',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'category', 'isFeatured', 'workflowStatus'],
    group: 'Org Site',
    description: 'Learning resources: knowledge sharing, college prep, and mentorship.',
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return buildPublicVisibilityWhere({ allowMissingWorkflowStatus: true });
    },
    create: ({ req }) =>
      !!req.user &&
      ['admin', 'editor', 'author'].includes(
        (req.user as unknown as Record<string, unknown>).role as string,
      ),
    update: authorScopedUpdate,
    delete: ({ req }) =>
      !!req.user &&
      ['admin', 'editor'].includes(
        (req.user as unknown as Record<string, unknown>).role as string,
      ),
  },
  hooks: {
    beforeChange: [
      stampCreatedByBeforeChange,
      normalizeSlugBeforeChange,
      workflowBeforeChange,
    ],
    afterChange: [workflowAfterChange, auditAfterChange],
    afterDelete: [auditAfterDelete],
  },
  versions: { drafts: true },
  enableQueryPresets: true,
  fields: [
    // ─── Core ──────────────────────────────────────────────────────────
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
      maxLength: ORG_SLUG_MAX_LENGTH,
      validate: validateOrgSlug,
      admin: {
        position: 'sidebar',
        description: 'Lowercase, hyphenated slug (max 120 characters).',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: toPayloadOptions(LEARNING_CATEGORIES),
      admin: { position: 'sidebar' },
    },

    // ─── Content ───────────────────────────────────────────────────────
    {
      name: 'shortSummary',
      type: 'textarea',
      required: true,
      maxLength: 320,
      admin: {
        description: 'Short description for cards and search snippets (max 320 chars).',
      },
    },
    {
      name: 'detailContent',
      type: 'richText',
      editor: richTextEditor,
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional thumbnail image (recommended 800×600, 4:3).',
      },
    },

    // ─── Attribution ───────────────────────────────────────────────────
    {
      name: 'author',
      type: 'text',
      admin: { description: 'Author or contributor name (optional).' },
    },

    // ─── Display ───────────────────────────────────────────────────────
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower values appear first within the same category.',
      },
    },

    // ─── Links ─────────────────────────────────────────────────────────
    {
      name: 'externalReferenceLink',
      type: 'text',
      validate: validateHttpUrl,
      admin: { description: 'Optional external reference or resource link.' },
    },

    // ─── Relationships ─────────────────────────────────────────────────
    {
      name: 'relatedEvent',
      type: 'relationship',
      relationTo: 'org-events',
      admin: { description: 'Related community event (optional).' },
    },
    {
      name: 'relatedSpotlight',
      type: 'relationship',
      relationTo: 'org-spotlight',
      admin: { description: 'Related community spotlight (optional).' },
    },

    // ─── Workflow & Ownership ──────────────────────────────────────────
    createdByField,
    orgWorkflowStatusField,
    ...workflowApprovalFields,
    ...seoFields,
  ],
};
