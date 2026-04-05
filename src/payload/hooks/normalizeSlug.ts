import type { CollectionBeforeChangeHook } from 'payload';

function normalizeSlug(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  const normalized = trimmed
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/{2,}/g, '/');

  return normalized;
}

function slugFromTitle(title: unknown): string | null {
  if (typeof title !== 'string') return null;
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || null;
}

export const normalizeSlugBeforeChange: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (!data || typeof data !== 'object') return data;

  const incoming = data as Record<string, unknown>;
  const normalized = normalizeSlug(incoming.slug);

  if (normalized !== null && normalized !== '') {
    incoming.slug = normalized;
  } else if (operation === 'create' || !normalized) {
    const generated = slugFromTitle(incoming.title);
    if (generated) {
      incoming.slug = generated;
    }
  }

  return incoming;
};
