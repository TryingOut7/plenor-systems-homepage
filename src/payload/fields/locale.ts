import type { Field } from 'payload';

/**
 * Locale / hreflang fields for multi-language support.
 *
 * Add these to any collection that may have translated variants.
 * The `locale` field stores the BCP-47 language tag (e.g. "en", "de", "fr").
 * The `alternateLocales` field links to the same page in other languages.
 *
 * These fields are hidden by default (condition returns false) until
 * PAYLOAD_ENABLE_LOCALES=true is set, to avoid cluttering the UI
 * before multi-language content is needed.
 */

const isLocaleEnabled = process.env.PAYLOAD_ENABLE_LOCALES === 'true';

export const localeFields: Field[] = [
  {
    name: 'locale',
    type: 'select',
    defaultValue: 'en',
    options: [
      { label: 'English', value: 'en' },
      { label: 'German', value: 'de' },
      { label: 'French', value: 'fr' },
      { label: 'Spanish', value: 'es' },
      { label: 'Dutch', value: 'nl' },
      { label: 'Portuguese', value: 'pt' },
      { label: 'Italian', value: 'it' },
      { label: 'Japanese', value: 'ja' },
    ],
    admin: {
      position: 'sidebar',
      condition: () => isLocaleEnabled,
      description: 'Language of this page (BCP-47 tag).',
    },
  },
  {
    name: 'alternateLocales',
    type: 'array',
    admin: {
      condition: () => isLocaleEnabled,
      description: 'Link to the same page in other languages for hreflang tags.',
    },
    fields: [
      {
        name: 'locale',
        type: 'select',
        required: true,
        options: [
          { label: 'English', value: 'en' },
          { label: 'German', value: 'de' },
          { label: 'French', value: 'fr' },
          { label: 'Spanish', value: 'es' },
          { label: 'Dutch', value: 'nl' },
          { label: 'Portuguese', value: 'pt' },
          { label: 'Italian', value: 'it' },
          { label: 'Japanese', value: 'ja' },
        ],
      },
      {
        name: 'url',
        type: 'text',
        required: true,
        admin: {
          description: 'Full URL of the alternate-language version (e.g. https://plenor.ai/de/about)',
        },
      },
    ],
  },
];
