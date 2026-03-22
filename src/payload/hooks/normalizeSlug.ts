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

export const normalizeSlugBeforeChange: CollectionBeforeChangeHook = ({ data }) => {
  if (!data || typeof data !== 'object') return data;

  const incoming = data as Record<string, unknown>;
  const normalized = normalizeSlug(incoming.slug);

  if (normalized !== null) {
    incoming.slug = normalized;
  }

  return incoming;
};
