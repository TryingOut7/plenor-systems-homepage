import type { GlobalConfig } from 'payload';
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
import { auditGlobalAfterChange } from '../hooks/auditLog.ts';
import { CleanPasteFeature } from '../editor/features/cleanPasteFeature.ts';
import { revalidateGlobalAfterChange } from '../hooks/revalidateCmsContent.ts';
import { toPayloadOptions } from '../../domain/org-site/constants.ts';
import { validateImageUploadReference } from '../validation/media.ts';

type ValidationContext = {
  data?: Record<string, unknown>;
};

const sponsorBlockOrderKeys = [
  'support_summary',
  'sponsor_acknowledgment',
  'donation_instructions',
  'payment_instructions',
  'sponsor_logos',
  'support_faq',
  'featured_supporter_text',
] as const;

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

function containsWhitespace(value: string): boolean {
  return /\s/.test(value);
}

function validateSupportContactPath(value: unknown): true | string {
  if (typeof value !== 'string') return true;

  const trimmed = value.trim();
  if (!trimmed) return true;

  if (containsWhitespace(trimmed)) {
    return 'Support contact must not contain whitespace.';
  }

  const lower = trimmed.toLowerCase();
  if (lower.startsWith('mailto:')) {
    const email = trimmed.slice('mailto:'.length).trim();
    if (!email) return 'Use a valid mailto: address (for example mailto:team@example.com).';

    const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      return 'Use a valid mailto: address (for example mailto:team@example.com).';
    }

    return true;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') {
      return 'Support contact must use https:// or mailto:.';
    }
    if (parsed.username || parsed.password) {
      return 'Support contact URL cannot include embedded credentials.';
    }
    return true;
  } catch {
    return 'Support contact must be a valid https:// URL or mailto: link.';
  }
}

function hasNonEmptyText(value: unknown, seen: Set<unknown> = new Set()): boolean {
  if (typeof value === 'string') return value.trim().length > 0;
  if (!value || typeof value !== 'object') return false;
  if (seen.has(value)) return false;

  seen.add(value);

  if (Array.isArray(value)) {
    return value.some((entry) => hasNonEmptyText(entry, seen));
  }

  const record = value as Record<string, unknown>;
  if (typeof record.text === 'string' && record.text.trim()) {
    return true;
  }

  if (Array.isArray(record.children)) {
    return record.children.some((entry) => hasNonEmptyText(entry, seen));
  }

  return false;
}

function validatePaymentInstructionsContent(
  value: unknown,
  context?: ValidationContext,
): true | string {
  const status = context?.data?._status;
  if (status !== 'published') return true;

  if (!hasNonEmptyText(value)) {
    return 'Payment instructions content is required before publishing.';
  }

  return true;
}

export const OrgSponsors: GlobalConfig = {
  slug: 'org-sponsors',
  admin: {
    group: 'Org Site',
    description:
      'Sponsors and donation settings for the org-site. Payment destination fields are admin-only governance fields.',
  },
  access: {
    read: () => true,
    update: ({ req }) =>
      !!req.user &&
      (req.user as unknown as Record<string, unknown>).role === 'admin',
  },
  versions: {
    max: 25,
    drafts: {
      autosave: false,
    },
  },
  hooks: {
    afterChange: [revalidateGlobalAfterChange, auditGlobalAfterChange],
  },
  fields: [
    {
      name: 'pageTitle',
      type: 'text',
      required: true,
    },
    {
      name: 'supportSummary',
      type: 'richText',
      editor: richTextEditor,
    },
    {
      name: 'sponsorAcknowledgmentContent',
      type: 'richText',
      editor: richTextEditor,
    },
    {
      name: 'donationInstructions',
      type: 'richText',
      editor: richTextEditor,
    },
    {
      name: 'zelleQrCode',
      type: 'upload',
      relationTo: 'media',
      validate: validateImageUploadReference,
      admin: {
        description:
          'Upload static QR image. Media alt text is required and should describe the payment destination.',
      },
    },
    {
      name: 'venmoQrCode',
      type: 'upload',
      relationTo: 'media',
      validate: validateImageUploadReference,
      admin: {
        description:
          'Upload static QR image. Media alt text is required and should describe the payment destination.',
      },
    },
    {
      name: 'paymentInstructionsContent',
      type: 'richText',
      editor: richTextEditor,
      validate: validatePaymentInstructionsContent,
      admin: {
        description:
          'Required before publish. Include anti-fraud guidance and visible destination text (not image-only instructions).',
      },
    },
    {
      name: 'supportContactPath',
      type: 'text',
      validate: validateSupportContactPath,
      admin: {
        description: 'Support contact endpoint. Allowed formats: https://... or mailto:....',
      },
    },
    {
      name: 'sponsorLogos',
      type: 'array',
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
        },
      ],
    },
    {
      name: 'featuredSupporterText',
      type: 'richText',
      editor: richTextEditor,
    },
    {
      name: 'supportFaq',
      type: 'array',
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
        {
          name: 'answer',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'displayOrder',
      type: 'select',
      hasMany: true,
      options: toPayloadOptions(sponsorBlockOrderKeys),
      admin: {
        description: 'Optional custom order for sponsors page content blocks.',
      },
    },
  ],
};
