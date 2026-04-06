import type { CollectionSlug, Payload, RequiredDataFromCollectionSlug, TypedUser } from 'payload';

const PRESET_CATEGORIES = new Set(['core', 'landing', 'campaign', 'internal', 'custom']);

type UnknownRecord = Record<string, unknown>;

export type PresetMetaInput = {
  name?: unknown;
  category?: unknown;
  description?: unknown;
  thumbnailId?: unknown;
  tags?: unknown;
};

type PresetSourceType = 'from-live' | 'from-draft' | 'from-playground';
type DraftSourceType = 'from-playground' | 'from-preset';

type DraftSourceDoc = {
  id: number | string;
  name?: string;
  sections?: unknown;
  notes?: unknown;
};

type SourceDoc = {
  id: number | string;
  title?: string;
  sections?: unknown;
  editorNotes?: unknown;
};

function asRecord(value: unknown): UnknownRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as UnknownRecord;
}

function normalizeDocId(id: number | string): number | string {
  if (typeof id === 'number') return id;

  const trimmed = id.trim();
  if (!trimmed) {
    throw new Error('id is required.');
  }

  if (/^-?\d+$/.test(trimmed)) {
    const parsed = Number(trimmed);
    if (Number.isSafeInteger(parsed)) return parsed;
  }

  return trimmed;
}

function cloneValueWithoutIds<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValueWithoutIds(entry)) as T;
  }

  if (value && typeof value === 'object') {
    const cloned: UnknownRecord = {};
    for (const [key, nestedValue] of Object.entries(value as UnknownRecord)) {
      if (key === 'id') continue;
      cloned[key] = cloneValueWithoutIds(nestedValue);
    }
    return cloned as T;
  }

  return value;
}

function cloneSections(sections: unknown[]): UnknownRecord[] {
  return cloneValueWithoutIds(sections) as UnknownRecord[];
}

function readTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean);
}

function sanitizeMeta(meta: PresetMetaInput, fallbackName: string, fallbackDescription: string): {
  category: string;
  description?: string;
  name: string;
  tags: string[];
  thumbnailId?: string;
} {
  const name = readTrimmedString(meta.name) || fallbackName;
  const rawCategory = readTrimmedString(meta.category).toLowerCase();
  const category = PRESET_CATEGORIES.has(rawCategory) ? rawCategory : 'custom';
  const description = readTrimmedString(meta.description) || fallbackDescription;
  const thumbnailIdRaw = readTrimmedString(meta.thumbnailId);
  const tags = normalizeTags(meta.tags);

  return {
    name,
    category,
    ...(description ? { description } : {}),
    ...(thumbnailIdRaw ? { thumbnailId: thumbnailIdRaw } : {}),
    tags,
  };
}

async function loadSourceDoc(
  payload: Payload,
  collection: CollectionSlug,
  id: number | string,
  user: TypedUser,
): Promise<SourceDoc> {
  const source = await payload.findByID({
    collection,
    id: normalizeDocId(id),
    depth: 0,
    overrideAccess: false,
    user,
  });
  return source as SourceDoc;
}

async function createPresetFromSource(args: {
  payload: Payload;
  presetMeta: PresetMetaInput;
  sourceCollection: 'page-drafts' | 'page-playgrounds' | 'site-pages';
  sourceId: number | string;
  sourceType: PresetSourceType;
  user: TypedUser;
}): Promise<{ id: number | string; name: string }> {
  const { payload, presetMeta, sourceCollection, sourceId, sourceType, user } = args;
  const source = await loadSourceDoc(payload, sourceCollection, sourceId, user);
  const sourceData = asRecord(source);
  const sourceTitle =
    readTrimmedString(sourceData.title) ||
    readTrimmedString(sourceData.name) ||
    'Untitled';
  const fallbackDescription =
    sourceType === 'from-draft' ? readTrimmedString(sourceData.editorNotes) :
    sourceType === 'from-playground' ? readTrimmedString(sourceData.notes) : '';
  const normalizedMeta = sanitizeMeta(
    presetMeta,
    `${sourceTitle} Preset`,
    fallbackDescription,
  );

  const sections = Array.isArray(sourceData.sections)
    ? cloneSections(sourceData.sections)
    : [];

  const created = await payload.create({
    collection: 'page-presets',
    depth: 0,
    overrideAccess: false,
    user,
    data: {
      name: normalizedMeta.name,
      category: normalizedMeta.category,
      description: normalizedMeta.description,
      thumbnail: normalizedMeta.thumbnailId,
      tags: normalizedMeta.tags.map((tag) => ({ tag })),
      structureMode: 'editable',
      sections,
      sourceType,
      sourceLivePage: sourceType === 'from-live' ? source.id : undefined,
      sourceDraft: sourceType === 'from-draft' ? source.id : undefined,
      sourcePlayground: sourceType === 'from-playground' ? source.id : undefined,
      createdFromSnapshotAt: new Date().toISOString(),
    } as unknown as RequiredDataFromCollectionSlug<'page-presets'>,
  });

  const createdRecord = created as unknown as UnknownRecord;
  return {
    id: (createdRecord.id as string | number) ?? '',
    name: readTrimmedString(createdRecord.name) || normalizedMeta.name,
  };
}

export async function createPresetFromLivePage(args: {
  livePageId: number | string;
  payload: Payload;
  presetMeta: PresetMetaInput;
  user: TypedUser;
}): Promise<{ id: number | string; name: string }> {
  return createPresetFromSource({
    payload: args.payload,
    sourceCollection: 'site-pages',
    sourceId: args.livePageId,
    sourceType: 'from-live',
    presetMeta: args.presetMeta,
    user: args.user,
  });
}

export async function createPresetFromDraft(args: {
  draftId: number | string;
  payload: Payload;
  presetMeta: PresetMetaInput;
  user: TypedUser;
}): Promise<{ id: number | string; name: string }> {
  return createPresetFromSource({
    payload: args.payload,
    sourceCollection: 'page-drafts',
    sourceId: args.draftId,
    sourceType: 'from-draft',
    presetMeta: args.presetMeta,
    user: args.user,
  });
}

export async function createPresetFromPlayground(args: {
  playgroundId: number | string;
  payload: Payload;
  presetMeta: PresetMetaInput;
  user: TypedUser;
}): Promise<{ id: number | string; name: string }> {
  return createPresetFromSource({
    payload: args.payload,
    sourceCollection: 'page-playgrounds',
    sourceId: args.playgroundId,
    sourceType: 'from-playground',
    presetMeta: args.presetMeta,
    user: args.user,
  });
}

export async function createDraftFromPlayground(args: {
  playgroundId: number | string;
  payload: Payload;
  title: string;
  targetSlug: string;
  user: TypedUser;
}): Promise<{ id: number | string; title: string }> {
  const { payload, title, targetSlug, user } = args;
  const source = await loadSourceDoc(payload, 'page-playgrounds', args.playgroundId, user) as DraftSourceDoc;
  const sourceData = asRecord(source as unknown);
  return createDraftFromSource({
    payload,
    user,
    source,
    sourceData,
    sourceType: 'from-playground',
    title,
    targetSlug,
  });
}

export async function createDraftFromPreset(args: {
  presetId: number | string;
  payload: Payload;
  title: string;
  targetSlug: string;
  user: TypedUser;
}): Promise<{ id: number | string; title: string }> {
  const { payload, title, targetSlug, user } = args;
  const source = await loadSourceDoc(payload, 'page-presets', args.presetId, user) as DraftSourceDoc;
  const sourceData = asRecord(source as unknown);
  return createDraftFromSource({
    payload,
    user,
    source,
    sourceData,
    sourceType: 'from-preset',
    title,
    targetSlug,
  });
}

async function createDraftFromSource(args: {
  payload: Payload;
  user: TypedUser;
  source: DraftSourceDoc;
  sourceData: UnknownRecord;
  sourceType: DraftSourceType;
  title: string;
  targetSlug: string;
}): Promise<{ id: number | string; title: string }> {
  const { payload, user, source, sourceData, sourceType, title, targetSlug } = args;

  const sections = Array.isArray(sourceData.sections) ? cloneSections(sourceData.sections) : [];
  const sourceTitle = readTrimmedString(sourceData.title) || readTrimmedString(sourceData.name);
  const normalizedSlug = targetSlug.trim().replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/');
  if (!normalizedSlug) {
    throw new Error(
      sourceType === 'from-preset'
        ? 'targetSlug is required to create a draft from a preset.'
        : 'targetSlug is required to create a draft from a playground.',
    );
  }

  const created = await payload.create({
    collection: 'page-drafts',
    depth: 0,
    overrideAccess: false,
    user,
    data: {
      title: title.trim() || sourceTitle || 'Untitled',
      targetSlug: normalizedSlug,
      sections,
      sourceType,
      sourcePlayground: sourceType === 'from-playground' ? source.id : undefined,
      sourcePreset: sourceType === 'from-preset' ? source.id : undefined,
      workflowStatus: 'draft',
    } as unknown as RequiredDataFromCollectionSlug<'page-drafts'>,
  });

  const createdRecord = created as unknown as UnknownRecord;
  return {
    id: (createdRecord.id as string | number) ?? '',
    title: readTrimmedString(createdRecord.title) || title,
  };
}
