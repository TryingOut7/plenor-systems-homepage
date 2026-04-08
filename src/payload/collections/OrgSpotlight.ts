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
import { workflowStatusField, workflowApprovalFields } from '../fields/workflow.ts';
import { createdByField } from '../fields/ownership.ts';
import { auditAfterChange, auditAfterDelete } from '../hooks/auditLog.ts';
import { stampCreatedByBeforeChange } from '../hooks/stampCreatedBy.ts';
import { normalizeSlugBeforeChange } from '../hooks/normalizeSlug.ts';
import { workflowBeforeChange, workflowAfterChange } from '../hooks/workflow.ts';
import { authorScopedUpdate } from '../access/authorScopedAccess.ts';
import { CleanPasteFeature } from '../editor/features/cleanPasteFeature.ts';
import { validateHttpUrl } from '../validation/url.ts';
import {
  ORG_SLUG_MAX_LENGTH,
  SPOTLIGHT_CATEGORIES,
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

export const OrgSpotlight: CollectionConfig = {
  slug: 'org-spotlight',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'category', 'isFeatured', 'workflowStatus'],
    group: 'Org Site',
    description: 'Community spotlights: students, teachers, volunteers, and local artists.',
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return { workflowStatus: { equals: 'published' } };
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
      name: 'name',
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
      options: toPayloadOptions(SPOTLIGHT_CATEGORIES),
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
      name: 'thumbnailImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Profile/thumbnail image (recommended 400×400, 1:1).',
      },
    },

    // ─── Optional Details ──────────────────────────────────────────────
    {
      name: 'roleTitle',
      type: 'text',
      admin: { description: 'Role or title (e.g. "Piano Student", "Lead Volunteer").' },
    },
    {
      name: 'affiliation',
      type: 'text',
      admin: { description: 'School, organization, or other affiliation.' },
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

    // ─── Media & Links ─────────────────────────────────────────────────
    {
      name: 'additionalImages',
      type: 'array',
      admin: { description: 'Additional images for this spotlight.' },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'externalLink',
      type: 'text',
      validate: validateHttpUrl,
      admin: { description: 'Optional external link (e.g. personal website, social media).' },
    },

    // ─── Relationships ─────────────────────────────────────────────────
    {
      name: 'relatedEvents',
      type: 'relationship',
      relationTo: 'org-events',
      hasMany: true,
      admin: { description: 'Related community events.' },
    },

    // ─── Workflow & Ownership ──────────────────────────────────────────
    createdByField,
    workflowStatusField,
    ...workflowApprovalFields,
    ...seoFields,
  ],
};
