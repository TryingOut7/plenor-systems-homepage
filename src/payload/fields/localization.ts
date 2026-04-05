import crypto from 'node:crypto';
import type { CollectionBeforeChangeHook, Field } from 'payload';

const DEFAULT_LOCALE = 'en';

type RecordValue = Record<string, unknown>;

export const localizationFields: Field[] = [
  {
    name: 'locale',
    type: 'select',
    defaultValue: DEFAULT_LOCALE,
    options: [
      { label: 'English', value: 'en' },
      { label: 'German', value: 'de' },
      { label: 'French', value: 'fr' },
      { label: 'Spanish', value: 'es' },
      { label: 'Italian', value: 'it' },
    ],
    required: true,
    admin: {
      position: 'sidebar',
      description: 'Document locale. English-first now; other locales can be enabled progressively.',
    },
  },
  {
    name: 'translationGroupId',
    type: 'text',
    admin: {
      position: 'sidebar',
      readOnly: true,
      description: 'Shared ID linking localized variants of the same content.',
    },
  },
];

export const ensureLocalizationBeforeChange: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (!data || typeof data !== 'object') return data;

  const incoming = { ...(data as RecordValue) };
  const original = originalDoc && typeof originalDoc === 'object'
    ? (originalDoc as RecordValue)
    : {};

  if (typeof incoming.locale !== 'string' || !incoming.locale.trim()) {
    incoming.locale =
      typeof original.locale === 'string' && original.locale.trim()
        ? original.locale
        : DEFAULT_LOCALE;
  }

  if (typeof incoming.translationGroupId !== 'string' || !incoming.translationGroupId.trim()) {
    const originalGroup = typeof original.translationGroupId === 'string'
      ? original.translationGroupId.trim()
      : '';
    incoming.translationGroupId = originalGroup || crypto.randomUUID();
  }

  return incoming;
};
