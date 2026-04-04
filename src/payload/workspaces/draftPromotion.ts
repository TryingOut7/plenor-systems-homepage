import type { Payload, TypedUser } from 'payload';

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as UnknownRecord;
}

function readTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValue(entry)) as T;
  }

  if (value && typeof value === 'object') {
    const cloned: UnknownRecord = {};
    for (const [key, nestedValue] of Object.entries(value as UnknownRecord)) {
      cloned[key] = cloneValue(nestedValue);
    }
    return cloned as T;
  }

  return value;
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

  const sections = Array.isArray(draftData.sections)
    ? cloneValue(draftData.sections)
    : [];

  const seo = asRecord(draftData.seo);

  const existing = await payload.find({
    collection: 'site-pages',
    where: { slug: { equals: targetSlug } },
    limit: 1,
    depth: 0,
    overrideAccess: false,
    user,
  });

  if (existing.docs.length > 0) {
    const existingPage = asRecord(existing.docs[0]);
    const pageId = existingPage.id as string | number;

    await payload.update({
      collection: 'site-pages',
      id: pageId,
      depth: 0,
      overrideAccess: false,
      user,
      data: {
        title,
        sections,
        seo,
      },
    });

    return { id: pageId, isNew: false, slug: targetSlug };
  }

  const created = await payload.create({
    collection: 'site-pages',
    depth: 0,
    overrideAccess: false,
    user,
    data: {
      title,
      slug: targetSlug,
      sections,
      seo,
      workflowStatus: 'draft',
      isActive: false,
    },
  });

  const createdRecord = asRecord(created);
  return {
    id: (createdRecord.id as string | number) ?? '',
    isNew: true,
    slug: targetSlug,
  };
}
