import type { Payload, RequiredDataFromCollectionSlug, TypedUser } from 'payload';
import { buildCorePresetSections } from '../presets/corePagePresets.ts';

type UnknownRecord = Record<string, unknown>;
type CorePresetKey = 'home' | 'services' | 'about' | 'pricing' | 'contact';

const CORE_PRESET_KEYS: CorePresetKey[] = ['home', 'services', 'about', 'pricing', 'contact'];

function asRecord(value: unknown): UnknownRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as UnknownRecord;
}

function readTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
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

function cloneSectionsForCreate(sections: unknown[]): UnknownRecord[] {
  return cloneValueWithoutIds(sections) as UnknownRecord[];
}

function normalizeStructuralKey(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\./g, '-');
}

function buildSectionStructureSignature(sections: UnknownRecord[]): string[] {
  return sections.map((section) => {
    const blockType = readTrimmedString(section.blockType);
    const structuralKey = normalizeStructuralKey(section.structuralKey);
    return `${blockType}::${structuralKey}`;
  });
}

function inferCorePresetKeyFromSections(sections: UnknownRecord[]): CorePresetKey | 'custom' {
  const signature = buildSectionStructureSignature(sections);
  if (signature.length === 0) return 'custom';

  for (const presetKey of CORE_PRESET_KEYS) {
    const presetSignature = buildCorePresetSections(presetKey, {}).map((section) => {
      const record = asRecord(section);
      return `${readTrimmedString(record.blockType)}::${normalizeStructuralKey(record.structuralKey)}`;
    });

    if (
      signature.length === presetSignature.length &&
      signature.every((entry, index) => entry === presetSignature[index])
    ) {
      return presetKey;
    }
  }

  return 'custom';
}

function resolvePromotionPresetKey(
  slug: string,
  sections: UnknownRecord[],
): CorePresetKey | 'custom' {
  const normalizedSlug = readTrimmedString(slug).replace(/^\/+|\/+$/g, '');
  if (CORE_PRESET_KEYS.includes(normalizedSlug as CorePresetKey)) {
    return normalizedSlug as CorePresetKey;
  }

  return inferCorePresetKeyFromSections(sections);
}

function resolvePromotionReviewSummary(
  slug: string,
  ...candidates: unknown[]
): string {
  for (const candidate of candidates) {
    const trimmed = readTrimmedString(candidate);
    if (trimmed.length >= 10) return trimmed;
  }

  const livePath = slug === 'home' ? '/' : `/${slug}`;
  return `Promoted draft content to live page ${livePath}.`;
}

function resolveExistingPresetKey(value: unknown): CorePresetKey | 'custom' | null {
  if (value === 'custom') return 'custom';
  if (typeof value !== 'string') return null;
  return CORE_PRESET_KEYS.includes(value as CorePresetKey) ? (value as CorePresetKey) : null;
}

export async function promoteDraftToLive(args: {
  draftId: number | string;
  payload: Payload;
  user: TypedUser;
}): Promise<{ id: number | string; isNew: boolean; slug: string }> {
  const { draftId, payload, user } = args;

  const draft = await payload.findByID({
    collection: 'page-drafts',
    id: draftId,
    depth: 0,
    overrideAccess: false,
    user,
  });

  const draftData = asRecord(draft);
  const title = readTrimmedString(draftData.title) || 'Untitled';
  const targetSlug = readTrimmedString(draftData.targetSlug);

  if (!targetSlug) {
    throw new Error('Draft must have a targetSlug before it can be promoted to live.');
  }

  const sectionsForUpdate = Array.isArray(draftData.sections)
    ? cloneValueWithoutIds(draftData.sections)
    : [];
  const sectionsForCreate = Array.isArray(draftData.sections)
    ? cloneSectionsForCreate(draftData.sections)
    : [];
  const inferredPresetKey = resolvePromotionPresetKey(targetSlug, sectionsForCreate);

  const seoForUpdate = cloneValueWithoutIds(asRecord(draftData.seo));
  const seoForCreate = cloneValueWithoutIds(asRecord(draftData.seo));

  const existing = await payload.find({
    collection: 'site-pages',
    where: { slug: { equals: targetSlug } },
    limit: 1,
    depth: 0,
    overrideAccess: false,
    user,
  });

  let livePageId: string | number;
  let isNew: boolean;

  if (existing.docs.length > 0) {
    const existingPage = asRecord(existing.docs[0]);
    const pageId = existingPage.id as string | number;
    const reviewSummary = resolvePromotionReviewSummary(
      targetSlug,
      draftData.reviewSummary,
      existingPage.reviewSummary,
    );
    const existingPresetKey = resolveExistingPresetKey(existingPage.presetKey);

    await payload.update({
      collection: 'site-pages',
      id: pageId,
      depth: 0,
      overrideAccess: false,
      user,
      data: {
        title,
        sections: sectionsForUpdate,
        seo: seoForUpdate,
        workflowStatus: 'published',
        reviewChecklistComplete: true,
        reviewSummary,
        ...(existingPresetKey && existingPresetKey !== 'custom'
          ? { presetKey: existingPresetKey }
          : {}),
      },
    });

    livePageId = pageId;
    isNew = false;
  } else {
    const reviewSummary = resolvePromotionReviewSummary(targetSlug, draftData.reviewSummary);
    const created = await payload.create({
      collection: 'site-pages',
      depth: 0,
      overrideAccess: false,
      user,
      data: {
        title,
        slug: targetSlug,
        sections: sectionsForCreate,
        seo: seoForCreate,
        workflowStatus: 'published',
        reviewChecklistComplete: true,
        reviewSummary,
        isActive: true,
        createdBy: draftData.createdBy,
        ...(inferredPresetKey !== 'custom' ? { presetKey: inferredPresetKey } : {}),
      } as unknown as RequiredDataFromCollectionSlug<'site-pages'>,
    });

    const createdRecord = asRecord(created);
    livePageId = (createdRecord.id as string | number) ?? '';
    isNew = true;
  }

  await payload.update({
    collection: 'page-drafts',
    id: draftId,
    depth: 0,
    overrideAccess: true,
    user,
    data: {
      workflowStatus: 'published',
      reviewChecklistComplete: true,
      reviewSummary: resolvePromotionReviewSummary(targetSlug, draftData.reviewSummary),
    },
  });

  return { id: livePageId, isNew, slug: targetSlug };
}
