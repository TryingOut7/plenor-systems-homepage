import type { GlobalConfig } from 'payload';
import { auditGlobalAfterChange } from '../hooks/auditLog.ts';
import { revalidateGlobalAfterChange } from '../hooks/revalidateCmsContent.ts';
import { HOME_SECTION_KEYS, toPayloadOptions } from '../../domain/org-site/constants.ts';

function validateFeaturedSelectionLimit(value: unknown): true | string {
  if (!Array.isArray(value)) return true;
  if (value.length <= 3) return true;
  return 'Select up to 3 featured items.';
}

function validateHomeSectionOrder(value: unknown): true | string {
  if (!Array.isArray(value)) return true;

  const normalized = value
    .map((entry) => (typeof entry === 'string' ? entry : String(entry)))
    .filter((entry) => entry.length > 0);

  const seen = new Set<string>();
  for (const section of normalized) {
    if (seen.has(section)) {
      return 'Home section order cannot contain duplicates.';
    }
    seen.add(section);
  }

  return true;
}

export const OrgHomeFeatures: GlobalConfig = {
  slug: 'org-home-features',
  admin: {
    group: 'Org Site',
    description:
      'Curated home-page selections for events, spotlight, and learning with per-section placeholders.',
  },
  access: {
    read: () => true,
    update: ({ req }) =>
      !!req.user &&
      ['admin', 'editor'].includes(
        (req.user as unknown as Record<string, unknown>).role as string,
      ),
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
      name: 'featuredEvents',
      type: 'relationship',
      relationTo: 'org-events',
      hasMany: true,
      validate: validateFeaturedSelectionLimit,
      admin: {
        description: 'Optional curated events for the home page (max 3).',
      },
    },
    {
      name: 'featuredSpotlight',
      type: 'relationship',
      relationTo: 'org-spotlight',
      hasMany: true,
      validate: validateFeaturedSelectionLimit,
      admin: {
        description: 'Optional curated spotlight entries for the home page (max 3).',
      },
    },
    {
      name: 'featuredLearning',
      type: 'relationship',
      relationTo: 'org-learning',
      hasMany: true,
      validate: validateFeaturedSelectionLimit,
      admin: {
        description: 'Optional curated learning entries for the home page (max 3).',
      },
    },
    {
      name: 'eventsPlaceholder',
      type: 'textarea',
      maxLength: 320,
      admin: {
        description: 'Shown when no events can be rendered on the home page.',
      },
    },
    {
      name: 'spotlightPlaceholder',
      type: 'textarea',
      maxLength: 320,
      admin: {
        description: 'Shown when no spotlight entries can be rendered on the home page.',
      },
    },
    {
      name: 'learningPlaceholder',
      type: 'textarea',
      maxLength: 320,
      admin: {
        description: 'Shown when no learning entries can be rendered on the home page.',
      },
    },
    {
      name: 'homeSectionOrder',
      type: 'select',
      hasMany: true,
      options: toPayloadOptions(HOME_SECTION_KEYS),
      validate: validateHomeSectionOrder,
      admin: {
        description: 'Optional section order override (events, spotlight, learning, sponsors).',
      },
    },
  ],
};
