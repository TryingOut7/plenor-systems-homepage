'use client';

type SourceCollection = 'page-drafts' | 'page-playgrounds' | 'site-pages';

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
  if (sourceCollection === 'page-playgrounds') {
    return `/api/pages/playgrounds/${encodeURIComponent(sourceId)}/create-preset`;
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

export async function createDraftFromPlaygroundClient(args: {
  playgroundId: string;
  playgroundName: string;
}): Promise<{ id: string | number; title: string }> {
  const nameInput = window.prompt('Draft title', `${readString(args.playgroundName) || 'Untitled'} Draft`);
  if (nameInput === null) throw new Error('Draft creation cancelled.');

  const title = readString(nameInput);
  if (!title) {
    window.alert('Draft title is required.');
    throw new Error('Draft creation cancelled.');
  }

  const slugInput = window.prompt('Target page slug (e.g. /about)', '');
  if (slugInput === null) throw new Error('Draft creation cancelled.');

  const targetSlug = readString(slugInput);
  if (!targetSlug) {
    window.alert('Target page slug is required.');
    throw new Error('Draft creation cancelled.');
  }

  const response = await fetch(
    `/api/pages/playgrounds/${encodeURIComponent(args.playgroundId)}/create-draft`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ title, targetSlug }),
    },
  );

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof json?.message === 'string' ? json.message : 'Failed to create draft.';
    throw new Error(message);
  }

  if (!json || typeof json !== 'object' || typeof json.draft !== 'object' || !json.draft) {
    throw new Error('Draft API returned an invalid response.');
  }

  const draft = json.draft as Record<string, unknown>;
  const id = draft.id as string | number | undefined;
  const draftTitle = readString(draft.title);
  if (!id) throw new Error('Draft API response is missing draft id.');

  return { id, title: draftTitle || title };
}

export function openDraftDocumentInAdmin(draftId: number | string): void {
  const basePath = resolveAdminBasePath();
  window.location.assign(
    `${basePath}/collections/page-drafts/${encodeURIComponent(String(draftId))}`,
  );
}

export type { SourceCollection };
