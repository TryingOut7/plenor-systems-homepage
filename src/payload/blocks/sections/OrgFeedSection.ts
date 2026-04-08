import type { Block } from 'payload';
import {
  EVENT_STATUSES,
  LEARNING_CATEGORIES,
  SPOTLIGHT_CATEGORIES,
  toPayloadOptions,
} from '../../../domain/org-site/constants.ts';
import { sectionCommonFields } from '../../fields/sectionCommon.ts';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function hasFeedType(siblingData: unknown, feedType: string): boolean {
  return asRecord(siblingData).feedType === feedType;
}

function hasSourceMode(siblingData: unknown, sourceMode: string): boolean {
  return asRecord(siblingData).sourceMode === sourceMode;
}

function showManualRelationships(siblingData: unknown, feedType: string): boolean {
  return hasFeedType(siblingData, feedType) && hasSourceMode(siblingData, 'manual');
}

function showAutomaticFilter(siblingData: unknown, feedType: string): boolean {
  return hasFeedType(siblingData, feedType) && hasSourceMode(siblingData, 'automatic');
}

export const OrgFeedSection: Block = {
  slug: 'orgFeedSection',
  dbName: 'org_feed',
  labels: { singular: 'Org Feed', plural: 'Org Feeds' },
  fields: [
    ...sectionCommonFields,
    {
      name: 'heading',
      type: 'text',
      admin: {
        description: 'Optional heading override.',
      },
    },
    {
      name: 'subheading',
      type: 'textarea',
      admin: {
        description: 'Optional supporting text.',
      },
    },
    {
      name: 'feedType',
      type: 'select',
      required: true,
      defaultValue: 'events',
      options: [
        { label: 'Events', value: 'events' },
        { label: 'Spotlight', value: 'spotlight' },
        { label: 'Learning', value: 'learning' },
      ],
      admin: {
        description: 'Select which org content to render.',
      },
    },
    {
      name: 'sourceMode',
      type: 'select',
      required: true,
      defaultValue: 'featured',
      options: [
        { label: 'Featured (Org Home Features)', value: 'featured' },
        { label: 'Manual Selection', value: 'manual' },
        { label: 'Automatic by Filter', value: 'automatic' },
      ],
      admin: {
        description:
          'Featured reads curated items from org-home-features. Manual lets you pick exact entries. Automatic queries by status/category.',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 12,
      admin: {
        description: 'Maximum number of cards to display (1-12).',
      },
    },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '1 Column', value: '1' },
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
      admin: {
        description: 'Preferred grid density on desktop.',
      },
    },
    {
      name: 'includeCta',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Show a top-right call-to-action link.',
      },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      admin: {
        condition: (_, siblingData) => asRecord(siblingData).includeCta !== false,
      },
    },
    {
      name: 'ctaHref',
      type: 'text',
      admin: {
        condition: (_, siblingData) => asRecord(siblingData).includeCta !== false,
      },
    },
    {
      name: 'manualEvents',
      type: 'relationship',
      relationTo: 'org-events',
      hasMany: true,
      admin: {
        description: 'Used only for Events + Manual Selection.',
        condition: (_, siblingData) => showManualRelationships(siblingData, 'events'),
      },
    },
    {
      name: 'manualSpotlight',
      type: 'relationship',
      relationTo: 'org-spotlight',
      hasMany: true,
      admin: {
        description: 'Used only for Spotlight + Manual Selection.',
        condition: (_, siblingData) => showManualRelationships(siblingData, 'spotlight'),
      },
    },
    {
      name: 'manualLearning',
      type: 'relationship',
      relationTo: 'org-learning',
      hasMany: true,
      admin: {
        description: 'Used only for Learning + Manual Selection.',
        condition: (_, siblingData) => showManualRelationships(siblingData, 'learning'),
      },
    },
    {
      name: 'eventStatus',
      type: 'select',
      defaultValue: EVENT_STATUSES[0],
      options: toPayloadOptions(EVENT_STATUSES),
      admin: {
        description: 'Used only for Events + Automatic by Filter.',
        condition: (_, siblingData) => showAutomaticFilter(siblingData, 'events'),
      },
    },
    {
      name: 'spotlightCategory',
      type: 'select',
      defaultValue: SPOTLIGHT_CATEGORIES[0],
      options: toPayloadOptions(SPOTLIGHT_CATEGORIES),
      admin: {
        description: 'Used only for Spotlight + Automatic by Filter.',
        condition: (_, siblingData) => showAutomaticFilter(siblingData, 'spotlight'),
      },
    },
    {
      name: 'learningCategory',
      type: 'select',
      defaultValue: LEARNING_CATEGORIES[0],
      options: toPayloadOptions(LEARNING_CATEGORIES),
      admin: {
        description: 'Used only for Learning + Automatic by Filter.',
        condition: (_, siblingData) => showAutomaticFilter(siblingData, 'learning'),
      },
    },
  ],
};
