import type { CollectionBeforeChangeHook } from 'payload';
import { buildCorePresetSections, type CorePresetKey } from '../presets/corePagePresets';

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function resolveKnownPreset(value: unknown): CorePresetKey | null {
  if (value === 'home' || value === 'services' || value === 'about' || value === 'pricing' || value === 'contact') {
    return value;
  }
  return null;
}

function readSlug(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/^\/+|\/+$/g, '');
}

function resolvePresetKey(
  incoming: Record<string, unknown>,
  originalDoc: Record<string, unknown>,
  operation: 'create' | 'update',
): CorePresetKey {
  const explicit = resolveKnownPreset(incoming.presetKey);
  if (explicit) return explicit;
  if (incoming.presetKey === 'custom') return 'custom';

  const original = resolveKnownPreset(originalDoc.presetKey);
  if (original) return original;
  if (originalDoc.presetKey === 'custom') return 'custom';

  if (operation === 'create') {
    const slug = readSlug(incoming.slug);
    const bySlug = resolveKnownPreset(slug);
    if (bySlug) return bySlug;
  }

  return 'custom';
}

export const applyCorePresetSections: CollectionBeforeChangeHook = ({ data, originalDoc, operation }) => {
  if (!data || typeof data !== 'object') return data;

  const incoming = data as Record<string, unknown>;
  const original = asObject(originalDoc);
  const presetKey = resolvePresetKey(incoming, original, operation);
  if (presetKey === 'custom') return incoming;

  const incomingRoot = asObject(incoming.presetContent);
  const existingRoot = asObject(original.presetContent);
  const mergedRoot = { ...existingRoot, ...incomingRoot };

  const incomingPreset = asObject(incomingRoot[presetKey]);
  const existingPreset = asObject(existingRoot[presetKey]);
  const mergedPreset = { ...existingPreset, ...incomingPreset };

  mergedRoot[presetKey] = mergedPreset;

  incoming.presetContent = mergedRoot;
  incoming.presetKey = presetKey;
  incoming.sections = buildCorePresetSections(presetKey, mergedPreset);

  return incoming;
};
