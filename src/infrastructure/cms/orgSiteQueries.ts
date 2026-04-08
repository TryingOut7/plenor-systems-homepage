import { cache } from 'react';
import type { CmsReadOptions } from '@/payload/cms';
import { getPayload } from '@/payload/client';
import {
  ABOUT_CATEGORIES,
  EVENT_STATUS_PAST_COMPLETED,
  EVENT_STATUS_UPCOMING_PLANNED,
  HOME_SECTION_KEYS,
  type AboutCategory,
  type EventStatus,
  type HomeSectionKey,
  type LearningCategory,
  type SpotlightCategory,
  LEARNING_CATEGORIES,
  SPOTLIGHT_CATEGORIES,
} from '@/domain/org-site/constants';
import type {
  OrgAboutProfile,
  OrgEvent,
  OrgHomeFeature,
  OrgLearning,
  OrgSponsor,
  OrgSpotlight,
} from '@/payload-types';
import type { Where } from 'payload';

type OrgReadOptions = CmsReadOptions;

type PublishedStatus = 'draft' | 'published' | null | undefined;

type OrgHomeSection<T> = {
  items: T[];
  placeholder: string | null;
};

export type OrgHomeFeaturesResult = {
  sectionOrder: HomeSectionKey[];
  events: OrgHomeSection<OrgEvent>;
  spotlight: OrgHomeSection<OrgSpotlight>;
  learning: OrgHomeSection<OrgLearning>;
  sponsors: OrgSponsor | null;
};

function isDraftRead(options?: OrgReadOptions): boolean {
  return options?.draft === true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isPublished(status: PublishedStatus): boolean {
  return status === 'published';
}

function includeForRead<T extends { _status?: PublishedStatus }>(
  doc: T,
  options?: OrgReadOptions,
): boolean {
  return isDraftRead(options) || isPublished(doc._status);
}

function parseNumberish(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function parseDateMs(value: unknown, fallback = 0): number {
  if (typeof value !== 'string') return fallback;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : fallback;
}

function readNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function dedupeById<T extends { id: number }>(items: readonly T[]): T[] {
  const seen = new Set<number>();
  const deduped: T[] = [];

  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    deduped.push(item);
  }

  return deduped;
}

function relationDocs<T extends { id: number }>(value: unknown): T[] {
  if (!Array.isArray(value)) return [];

  const docs: T[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    if (typeof item.id !== 'number') continue;
    docs.push(item as T);
  }

  return docs;
}

function queryDraftOptions(options?: OrgReadOptions): {
  draft?: true;
  overrideAccess?: true;
} {
  return isDraftRead(options) ? { draft: true, overrideAccess: true } : {};
}

function publicPublishedWhere(options?: OrgReadOptions): Where | null {
  if (isDraftRead(options)) return null;
  return { _status: { equals: 'published' } } as Where;
}

function compareEventPriorityThenStartDateAsc(a: OrgEvent, b: OrgEvent): number {
  const priorityDiff =
    parseNumberish(b.displayPriority, 0) - parseNumberish(a.displayPriority, 0);
  if (priorityDiff !== 0) return priorityDiff;
  return parseDateMs(a.startDate, 0) - parseDateMs(b.startDate, 0);
}

const CATEGORY_SET = {
  spotlight: new Set<string>(SPOTLIGHT_CATEGORIES),
  about: new Set<string>(ABOUT_CATEGORIES),
  learning: new Set<string>(LEARNING_CATEGORIES),
};

export const getOrgEventById = cache(async function getOrgEventById(
  id: number | string,
  options: OrgReadOptions = {},
): Promise<OrgEvent | null> {
  try {
    const payload = await getPayload();
    const doc = (await payload.findByID({
      collection: 'org-events',
      id,
      depth: 2,
      ...queryDraftOptions(options),
    })) as OrgEvent | null;

    if (!doc) return null;
    if (!includeForRead(doc, options)) return null;
    return doc;
  } catch {
    return null;
  }
});

export const getOrgEventBySlug = cache(async function getOrgEventBySlug(
  slug: string,
  options: OrgReadOptions = {},
): Promise<OrgEvent | null> {
  const normalizedSlug = slug.trim().replace(/^\/+|\/+$/g, '');
  if (!normalizedSlug) return null;

  try {
    const payload = await getPayload();
    const publishedWhere = publicPublishedWhere(options);
    const result = await payload.find({
      collection: 'org-events',
      where: {
        slug: { equals: normalizedSlug },
        ...(publishedWhere || {}),
      },
      limit: 1,
      depth: 2,
      ...queryDraftOptions(options),
    });

    const doc = result.docs[0] as OrgEvent | undefined;
    if (!doc) return null;
    if (!includeForRead(doc, options)) return null;
    return doc;
  } catch {
    return null;
  }
});

export const getOrgSpotlightById = cache(async function getOrgSpotlightById(
  id: number | string,
  options: OrgReadOptions = {},
): Promise<OrgSpotlight | null> {
  try {
    const payload = await getPayload();
    const doc = (await payload.findByID({
      collection: 'org-spotlight',
      id,
      depth: 2,
      ...queryDraftOptions(options),
    })) as OrgSpotlight | null;

    if (!doc) return null;
    if (!includeForRead(doc, options)) return null;
    return doc;
  } catch {
    return null;
  }
});

export const getOrgLearningById = cache(async function getOrgLearningById(
  id: number | string,
  options: OrgReadOptions = {},
): Promise<OrgLearning | null> {
  try {
    const payload = await getPayload();
    const doc = (await payload.findByID({
      collection: 'org-learning',
      id,
      depth: 2,
      ...queryDraftOptions(options),
    })) as OrgLearning | null;

    if (!doc) return null;
    if (!includeForRead(doc, options)) return null;
    return doc;
  } catch {
    return null;
  }
});

export const getOrgAboutById = cache(async function getOrgAboutById(
  id: number | string,
  options: OrgReadOptions = {},
): Promise<OrgAboutProfile | null> {
  try {
    const payload = await getPayload();
    const doc = (await payload.findByID({
      collection: 'org-about-profiles',
      id,
      depth: 2,
      ...queryDraftOptions(options),
    })) as OrgAboutProfile | null;

    if (!doc) return null;
    if (!includeForRead(doc, options)) return null;
    return doc;
  } catch {
    return null;
  }
});

export const getOrgEventsByStatus = cache(async function getOrgEventsByStatus(
  status: EventStatus,
  options: OrgReadOptions = {},
): Promise<OrgEvent[]> {
  try {
    const payload = await getPayload();
    const isPast = status === EVENT_STATUS_PAST_COMPLETED;
    const publishedWhere = publicPublishedWhere(options);

    const result = await payload.find({
      collection: 'org-events',
      where: {
        eventStatus: { equals: status },
        ...(publishedWhere || {}),
      },
      depth: 1,
      limit: isPast ? 12 : 200,
      sort: isPast ? '-startDate' : '-displayPriority',
      ...queryDraftOptions(options),
    });

    const docs = (result.docs as OrgEvent[]).filter((doc) => includeForRead(doc, options));

    if (isPast) return docs.slice(0, 12);

    return docs.sort(compareEventPriorityThenStartDateAsc);
  } catch {
    return [];
  }
});

export const getOrgSpotlightByCategory = cache(async function getOrgSpotlightByCategory(
  category: SpotlightCategory,
  options: OrgReadOptions = {},
): Promise<OrgSpotlight[]> {
  if (!CATEGORY_SET.spotlight.has(category)) return [];

  try {
    const payload = await getPayload();
    const publishedWhere = publicPublishedWhere(options);
    const result = await payload.find({
      collection: 'org-spotlight',
      where: {
        category: { equals: category },
        ...(publishedWhere || {}),
      },
      depth: 1,
      limit: 200,
      sort: 'displayOrder',
      ...queryDraftOptions(options),
    });

    return (result.docs as OrgSpotlight[]).filter((doc) => includeForRead(doc, options));
  } catch {
    return [];
  }
});

export const getOrgAboutByCategory = cache(async function getOrgAboutByCategory(
  category: AboutCategory,
  options: OrgReadOptions = {},
): Promise<OrgAboutProfile[]> {
  if (!CATEGORY_SET.about.has(category)) return [];

  try {
    const payload = await getPayload();
    const publishedWhere = publicPublishedWhere(options);
    const result = await payload.find({
      collection: 'org-about-profiles',
      where: {
        category: { equals: category },
        ...(publishedWhere || {}),
      },
      depth: 1,
      limit: 200,
      sort: 'displayOrder',
      ...queryDraftOptions(options),
    });

    return (result.docs as OrgAboutProfile[]).filter((doc) => includeForRead(doc, options));
  } catch {
    return [];
  }
});

export const getOrgLearningByCategory = cache(async function getOrgLearningByCategory(
  category: LearningCategory,
  options: OrgReadOptions = {},
): Promise<OrgLearning[]> {
  if (!CATEGORY_SET.learning.has(category)) return [];

  try {
    const payload = await getPayload();
    const publishedWhere = publicPublishedWhere(options);
    const result = await payload.find({
      collection: 'org-learning',
      where: {
        category: { equals: category },
        ...(publishedWhere || {}),
      },
      depth: 1,
      limit: 200,
      sort: 'displayOrder',
      ...queryDraftOptions(options),
    });

    return (result.docs as OrgLearning[]).filter((doc) => includeForRead(doc, options));
  } catch {
    return [];
  }
});

async function getTopSpotlightFallback(options: OrgReadOptions): Promise<OrgSpotlight[]> {
  try {
    const payload = await getPayload();
    const where = publicPublishedWhere(options);
    const result = await payload.find({
      collection: 'org-spotlight',
      ...(where ? { where } : {}),
      depth: 1,
      limit: 3,
      sort: 'displayOrder',
      ...queryDraftOptions(options),
    });
    return (result.docs as OrgSpotlight[]).filter((doc) => includeForRead(doc, options)).slice(0, 3);
  } catch {
    return [];
  }
}

async function getTopUpcomingEventsFallback(options: OrgReadOptions): Promise<OrgEvent[]> {
  try {
    const payload = await getPayload();
    const where = publicPublishedWhere(options);
    const result = await payload.find({
      collection: 'org-events',
      where: {
        eventStatus: { equals: EVENT_STATUS_UPCOMING_PLANNED },
        ...(where || {}),
      },
      depth: 1,
      limit: 3,
      sort: 'startDate',
      ...queryDraftOptions(options),
    });
    return (result.docs as OrgEvent[]).filter((doc) => includeForRead(doc, options)).slice(0, 3);
  } catch {
    return [];
  }
}

async function getTopLearningFallback(options: OrgReadOptions): Promise<OrgLearning[]> {
  try {
    const payload = await getPayload();
    const where = publicPublishedWhere(options);
    const result = await payload.find({
      collection: 'org-learning',
      ...(where ? { where } : {}),
      depth: 1,
      limit: 3,
      sort: 'displayOrder',
      ...queryDraftOptions(options),
    });
    return (result.docs as OrgLearning[]).filter((doc) => includeForRead(doc, options)).slice(0, 3);
  } catch {
    return [];
  }
}

export const getOrgSponsorsGlobal = cache(async function getOrgSponsorsGlobal(
  options: OrgReadOptions = {},
): Promise<OrgSponsor | null> {
  try {
    const payload = await getPayload();
    const doc = (await payload.findGlobal({
      slug: 'org-sponsors',
      depth: 2,
      ...queryDraftOptions(options),
    })) as OrgSponsor | null;

    if (!doc) return null;
    if (!includeForRead(doc, options)) return null;
    if (!readNonEmptyString(doc.pageTitle)) return null;
    return doc;
  } catch {
    return null;
  }
});

function resolveSectionOrder(homeDoc: OrgHomeFeature | null): HomeSectionKey[] {
  const defaults = [...HOME_SECTION_KEYS];
  if (!homeDoc || !Array.isArray(homeDoc.homeSectionOrder)) return defaults;

  const configured: HomeSectionKey[] = [];
  const seen = new Set<HomeSectionKey>();

  for (const section of homeDoc.homeSectionOrder) {
    if (!HOME_SECTION_KEYS.includes(section)) continue;
    if (seen.has(section)) continue;
    seen.add(section);
    configured.push(section);
  }

  if (configured.length === 0) return defaults;
  const missing = defaults.filter((key) => !seen.has(key));
  return [...configured, ...missing];
}

export const getOrgHomeFeatures = cache(async function getOrgHomeFeatures(
  options: OrgReadOptions = {},
): Promise<OrgHomeFeaturesResult> {
  let homeDoc: OrgHomeFeature | null = null;

  try {
    const payload = await getPayload();
    const fetched = (await payload.findGlobal({
      slug: 'org-home-features',
      depth: 2,
      ...queryDraftOptions(options),
    })) as OrgHomeFeature | null;

    if (fetched && includeForRead(fetched, options)) {
      homeDoc = fetched;
    }
  } catch {
    homeDoc = null;
  }

  const sectionOrder = resolveSectionOrder(homeDoc);

  const curatedEvents = dedupeById(
    relationDocs<OrgEvent>(homeDoc?.featuredEvents).filter((doc) => includeForRead(doc, options)),
  ).slice(0, 3);
  const eventsFallback =
    curatedEvents.length === 0
      ? await getTopUpcomingEventsFallback(options)
      : [];
  const eventsItems = dedupeById(curatedEvents.length > 0 ? curatedEvents : eventsFallback);

  const curatedSpotlight = dedupeById(
    relationDocs<OrgSpotlight>(homeDoc?.featuredSpotlight).filter((doc) =>
      includeForRead(doc, options),
    ),
  ).slice(0, 3);
  const spotlightFallback =
    curatedSpotlight.length === 0 ? await getTopSpotlightFallback(options) : [];
  const spotlightItems = dedupeById(
    curatedSpotlight.length > 0 ? curatedSpotlight : spotlightFallback,
  );

  const curatedLearning = dedupeById(
    relationDocs<OrgLearning>(homeDoc?.featuredLearning).filter((doc) =>
      includeForRead(doc, options),
    ),
  ).slice(0, 3);
  const learningFallback =
    curatedLearning.length === 0 ? await getTopLearningFallback(options) : [];
  const learningItems = dedupeById(curatedLearning.length > 0 ? curatedLearning : learningFallback);

  const sponsors = await getOrgSponsorsGlobal(options);

  return {
    sectionOrder,
    events: {
      items: eventsItems,
      placeholder: readNonEmptyString(homeDoc?.eventsPlaceholder),
    },
    spotlight: {
      items: spotlightItems,
      placeholder: readNonEmptyString(homeDoc?.spotlightPlaceholder),
    },
    learning: {
      items: learningItems,
      placeholder: readNonEmptyString(homeDoc?.learningPlaceholder),
    },
    sponsors,
  };
});
