'use client';

type SourceCollection = 'page-drafts' | 'site-pages';

const ALLOWED_CATEGORIES = ['core', 'landing', 'campaign', 'internal', 'custom'];

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeCategory(value: string): string {
  const candidate = value.trim().toLowerCase();
  return ALLOWED_CATEGORIES.includes(candidate) ? candidate : 'custom';
}

function normalizeTags(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function resolveEndpoint(sourceCollection: SourceCollection, sourceId: string): string {
  if (sourceCollection === 'site-pages') {
    return `/api/pages/live/${encodeURIComponent(sourceId)}/create-preset`;
  }
  return `/api/pages/drafts/${encodeURIComponent(sourceId)}/create-preset`;
}

function resolveAdminBasePath(): string {
  const path = window.location.pathname;
  const markers = ['/collections/', '/globals/'];

  for (const marker of markers) {
    const markerIndex = path.indexOf(marker);
    if (markerIndex > 0) {
      return path.slice(0, markerIndex);
    }
  }

  return '/admin';
}

function askForMeta(defaultName: string, descriptionSeed: string): null | {
  category: string;
  description?: string;
  name: string;
  tags?: string[];
} {
  const nameInput = window.prompt('Preset name', defaultName);
  if (nameInput === null) return null;

  const name = readString(nameInput);
  if (!name) {
    window.alert('Preset name is required.');
    return null;
  }

  const categoryInput = window.prompt(
    'Category (core | landing | campaign | internal | custom)',
    'custom',
  );
  if (categoryInput === null) return null;

  const descriptionInput = window.prompt(
    'Description (optional)',
    descriptionSeed,
  );
  if (descriptionInput === null) return null;

  const tagsInput = window.prompt(
    'Tags (optional, comma-separated)',
    '',
  );
  if (tagsInput === null) return null;

  const tags = normalizeTags(tagsInput);
  const description = readString(descriptionInput);

  return {
    name,
    category: normalizeCategory(categoryInput),
    ...(description ? { description } : {}),
    ...(tags.length > 0 ? { tags } : {}),
  };
}

export async function createPresetFromSourceClient(args: {
  descriptionSeed?: string;
  sourceCollection: SourceCollection;
  sourceId: string;
  sourceTitle: string;
}): Promise<{ id: string | number; name: string }> {
  const payload = askForMeta(
    `${readString(args.sourceTitle) || 'Untitled'} Preset`,
    readString(args.descriptionSeed),
  );

  if (!payload) {
    throw new Error('Preset creation cancelled.');
  }

  const response = await fetch(resolveEndpoint(args.sourceCollection, args.sourceId), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof json?.message === 'string'
        ? json.message
        : 'Failed to create preset.';
    throw new Error(message);
  }

  if (!json || typeof json !== 'object' || typeof json.preset !== 'object' || !json.preset) {
    throw new Error('Preset API returned an invalid response.');
  }

  const preset = json.preset as Record<string, unknown>;
  const id = preset.id as string | number | undefined;
  const name = readString(preset.name);
  if (!id) {
    throw new Error('Preset API response is missing preset id.');
  }

  return {
    id,
    name: name || payload.name,
  };
}

export function openPresetDocumentInAdmin(presetId: number | string): void {
  const basePath = resolveAdminBasePath();
  window.location.assign(
    `${basePath}/collections/page-presets/${encodeURIComponent(String(presetId))}`,
  );
}

export type { SourceCollection };
