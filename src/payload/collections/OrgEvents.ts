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
  EVENT_STATUS_CURRENT_ONGOING,
  EVENT_STATUS_UPCOMING_PLANNED,
  EVENT_TYPE_FESTIVAL,
  EVENT_TYPES,
  EVENT_STATUSES,
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

type EventValidationData = {
  registrationRequired?: unknown;
  registrationForm?: unknown;
};

function asEventValidationData(data: unknown): EventValidationData {
  if (!data || typeof data !== 'object') return {};
  return data as EventValidationData;
}

function hasRelationshipReference(value: unknown): boolean {
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'string') return value.trim().length > 0;
  if (!value || typeof value !== 'object') return false;

  const record = value as Record<string, unknown>;
  if (typeof record.id === 'number') return Number.isFinite(record.id);
  if (typeof record.id === 'string') return record.id.trim().length > 0;
  if (typeof record.url === 'string') return record.url.trim().length > 0;
  return false;
}

export const OrgEvents: CollectionConfig = {
  slug: 'org-events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'eventType', 'eventStatus', 'workflowStatus'],
    group: 'Org Site',
    description: 'Community events: concerts, competitions, festivals, and workshops.',
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
      name: 'eventType',
      type: 'select',
      required: true,
      options: toPayloadOptions(EVENT_TYPES),
      admin: { position: 'sidebar' },
    },
    {
      name: 'eventStatus',
      type: 'select',
      required: true,
      defaultValue: EVENT_STATUS_UPCOMING_PLANNED,
      options: toPayloadOptions(EVENT_STATUSES),
      admin: {
        position: 'sidebar',
        description: 'Editorial status — set manually by authors, not derived from dates.',
      },
    },

    // ─── Dates & Timing ────────────────────────────────────────────────
    {
      name: 'startDate',
      type: 'date',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Optional for multi-day or multi-session events.',
      },
    },
    {
      name: 'startTime',
      type: 'text',
      admin: {
        description: 'Optional display time text (for example "7:00 PM").',
      },
    },
    {
      name: 'endTime',
      type: 'text',
      admin: {
        description: 'Optional display end time text.',
      },
    },
    {
      name: 'eventTimezone',
      type: 'text',
      defaultValue: 'UTC',
      admin: {
        description: 'IANA timezone (e.g. "America/New_York"). Defaults to UTC.',
      },
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
      name: 'description',
      type: 'richText',
      editor: richTextEditor,
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Primary image (recommended 1200×675, 16:9).',
      },
    },

    // ─── Location ──────────────────────────────────────────────────────
    {
      name: 'venue',
      type: 'text',
      admin: { description: 'Venue or location name.' },
    },
    {
      name: 'location',
      type: 'text',
      admin: { description: 'Full address or location details.' },
    },

    // ─── Display ───────────────────────────────────────────────────────
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'displayPriority',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Higher values appear first within the same status bucket.',
      },
    },

    // ─── Registration ──────────────────────────────────────────────────
    {
      name: 'registrationRequired',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'registrationForm',
      type: 'relationship',
      relationTo: 'forms',
      validate: (value: unknown, { data }: { data?: unknown }) => {
        const incoming = asEventValidationData(data);
        if (incoming.registrationRequired !== true) return true;
        if (hasRelationshipReference(value)) return true;
        return 'Select a registration form when registration is required.';
      },
      admin: {
        condition: (data) => !!data?.registrationRequired,
        description:
          'Select a standard Payload form for this event. Submissions will appear under Form Submissions.',
      },
    },
    {
      name: 'registrationInstructions',
      type: 'richText',
      editor: richTextEditor,
      admin: {
        condition: (data) => !!data?.registrationRequired,
        description: 'Optional instructions shown above the registration form.',
      },
    },

    // ─── Display Window (informational only) ───────────────────────────
    {
      name: 'displayWindowStart',
      type: 'date',
      admin: {
        condition: (data) => data?.eventStatus === EVENT_STATUS_CURRENT_ONGOING,
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Informational: when this event becomes visible as "current".',
      },
    },
    {
      name: 'displayWindowEnd',
      type: 'date',
      admin: {
        condition: (data) => data?.eventStatus === EVENT_STATUS_CURRENT_ONGOING,
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Informational: when this event stops being shown as "current".',
      },
    },

    // ─── Relationships ─────────────────────────────────────────────────
    {
      name: 'relatedSpotlight',
      type: 'relationship',
      relationTo: 'org-spotlight',
      hasMany: true,
      admin: { description: 'Related community spotlight entries.' },
    },
    {
      name: 'relatedLearning',
      type: 'relationship',
      relationTo: 'org-learning',
      hasMany: true,
      admin: { description: 'Related learning resources.' },
    },
    {
      name: 'relatedEvents',
      type: 'relationship',
      relationTo: 'org-events',
      hasMany: true,
      admin: {
        condition: (data) => data?.eventType === EVENT_TYPE_FESTIVAL,
        description: 'Sub-events within this festival.',
      },
    },

    // ─── Media & Links ─────────────────────────────────────────────────
    {
      name: 'mediaGallery',
      type: 'array',
      admin: { description: 'Additional images for this event.' },
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
      name: 'externalLinks',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true, validate: validateHttpUrl },
      ],
    },

    // ─── Workflow & Ownership ──────────────────────────────────────────
    createdByField,
    orgWorkflowStatusField,
    ...workflowApprovalFields,
    ...seoFields,
  ],
};
