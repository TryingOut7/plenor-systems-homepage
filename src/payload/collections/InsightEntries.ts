import type { CollectionConfig } from 'payload';
import { seoFields } from '../fields/seo.ts';
import { workflowStatusField, workflowApprovalFields } from '../fields/workflow.ts';
import { createdByField } from '../fields/ownership.ts';
import { auditAfterChange, auditAfterDelete } from '../hooks/auditLog.ts';
import { stampCreatedByBeforeChange } from '../hooks/stampCreatedBy.ts';
import { normalizeSlugBeforeChange } from '../hooks/normalizeSlug.ts';
import { workflowBeforeChange, workflowAfterChange } from '../hooks/workflow.ts';
import { authorScopedUpdate } from '../access/authorScopedAccess.ts';
import { buildPublicVisibilityWhere } from '../access/publicVisibility.ts';
import { ensureLocalizationBeforeChange, localizationFields } from '../fields/localization.ts';

export const InsightEntries: CollectionConfig = {
  slug: 'insight-entries',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'category', 'workflowStatus', 'isFeatured', 'publishedAt'],
    group: 'Content',
    description: 'Insights entries for articles, essays, and guides/resources.',
    components: {
      beforeList: ['@/payload/admin/components/TrashNotFoundBanner'],
    },
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return buildPublicVisibilityWhere({ allowMissingWorkflowStatus: true });
    },
    create: ({ req }) => !!req.user && ['admin', 'editor', 'author'].includes((req.user as unknown as Record<string, unknown>).role as string),
    update: authorScopedUpdate,
    delete: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as unknown as Record<string, unknown>).role as string),
  },
  hooks: {
    beforeChange: [
      stampCreatedByBeforeChange,
      normalizeSlugBeforeChange,
      ensureLocalizationBeforeChange,
      workflowBeforeChange,
    ],
    afterChange: [workflowAfterChange, auditAfterChange],
    afterDelete: [auditAfterDelete],
  },
  versions: { drafts: true },
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
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Article', value: 'article' },
        { label: 'Essay', value: 'essay' },
        { label: 'Guide/Resource', value: 'guide-resource' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 320,
      admin: {
        description: 'Recommended 140-320 characters for previews and SEO snippets.',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'body',
      type: 'richText',
    },
    {
      name: 'authorLabel',
      type: 'text',
      admin: {
        description: 'Author or source label shown on the detail page.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'orderingValue',
      type: 'number',
      admin: {
        position: 'sidebar',
        description:
          'Homepage and listing fallback ordering. Lower values appear first.',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    ...localizationFields,
    createdByField,
    workflowStatusField,
    ...workflowApprovalFields,
    ...seoFields,
  ],
};
