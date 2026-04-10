/**
 * Seeds minimal org verification pages and content items so that all 6 new
 * org section blocks can be verified without touching the Payload admin UI.
 *
 * Run via: npx tsx src/payload/seed/seedOrgVerificationPages.ts
 * Or call seedOrgVerificationPages() from a route handler / script.
 */
import type { RequiredDataFromCollectionSlug } from 'payload';
import { getPayload } from '@/payload/client';

// Minimal 1×1 white PNG (68 bytes) — used for required upload fields in seed records
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAABjE+ibYAAAAASUVORK5CYII=',
  'base64',
);

async function findOrCreatePlaceholderMedia(
  payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<number | string | null> {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: 'seed-placeholder.png' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  if (existing.docs.length > 0) {
    return (existing.docs[0] as { id?: number | string }).id ?? null;
  }

  try {
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: 'Seed placeholder image',
        usageScope: 'site-only',
      } as unknown as RequiredDataFromCollectionSlug<'media'>,
      file: {
        data: PLACEHOLDER_PNG,
        mimetype: 'image/png',
        name: 'seed-placeholder.png',
        size: PLACEHOLDER_PNG.length,
      },
      overrideAccess: true,
    });
    return (media as unknown as { id?: number | string }).id ?? null;
  } catch (err) {
    console.error('findOrCreatePlaceholderMedia failed:', err instanceof Error ? err.message : String(err));
    return null;
  }
}

type SeedSummary = {
  created: string[];
  skipped: string[];
  errors: string[];
};

function makeRichText(text: string): Record<string, unknown> {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text, version: 1 }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  };
}

async function upsertPage(
  payload: Awaited<ReturnType<typeof getPayload>>,
  slug: string,
  title: string,
  sections: unknown[],
  summary: SeedSummary,
): Promise<string | null> {
  const found = await payload.find({
    collection: 'site-pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  if (found.docs.length > 0) {
    summary.skipped.push(`page:${slug}`);
    return String((found.docs[0] as { id?: string | number }).id ?? '');
  }

  try {
    const created = await payload.create({
      collection: 'site-pages',
      data: {
        title,
        slug,
        isActive: true,
        workflowStatus: 'published',
        reviewChecklistComplete: true,
        reviewSummary: `Org verification page for /${slug}.`,
        sections,
      } as unknown as RequiredDataFromCollectionSlug<'site-pages'>,
      overrideAccess: true,
    });
    summary.created.push(`page:${slug}`);
    return String((created as unknown as { id?: string | number }).id ?? '');
  } catch (err) {
    summary.errors.push(`page:${slug} — ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

async function findOrCreateEvent(
  payload: Awaited<ReturnType<typeof getPayload>>,
  summary: SeedSummary,
  mediaId: number | string,
): Promise<number | string | null> {
  const found = await payload.find({
    collection: 'org-events',
    where: { slug: { equals: 'org-seed-sample-event' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  if (found.docs.length > 0) {
    summary.skipped.push('org-event:org-seed-sample-event');
    return (found.docs[0] as { id?: number | string }).id ?? null;
  }

  try {
    const doc = await payload.create({
      collection: 'org-events',
      data: {
        title: '[Seed] Sample Community Event',
        slug: 'org-seed-sample-event',
        eventType: 'festival',
        eventStatus: 'upcoming_planned',
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        shortSummary: 'A seed event created for org section block verification.',
        detailContent: makeRichText('This is a seed event used to verify the OrgEventDetailSection block renders correctly.'),
        heroImage: mediaId,
        workflowStatus: 'published',
        registrationRequired: false,
      } as unknown as RequiredDataFromCollectionSlug<'org-events'>,
      overrideAccess: true,
    });
    summary.created.push('org-event:org-seed-sample-event');
    return (doc as unknown as { id?: number | string }).id ?? null;
  } catch (err) {
    summary.errors.push(`org-event — ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

async function findOrCreateSpotlight(
  payload: Awaited<ReturnType<typeof getPayload>>,
  summary: SeedSummary,
  mediaId: number | string,
): Promise<number | string | null> {
  const found = await payload.find({
    collection: 'org-spotlight',
    where: { slug: { equals: 'org-seed-sample-spotlight' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  if (found.docs.length > 0) {
    summary.skipped.push('org-spotlight:org-seed-sample-spotlight');
    return (found.docs[0] as { id?: number | string }).id ?? null;
  }

  try {
    const doc = await payload.create({
      collection: 'org-spotlight',
      data: {
        name: '[Seed] Sample Spotlight',
        slug: 'org-seed-sample-spotlight',
        category: 'student',
        shortSummary: 'A seed spotlight entry for block verification.',
        thumbnailImage: mediaId,
        detailContent: makeRichText('This is a seed spotlight entry used to verify the OrgSpotlightDetailSection block renders correctly.'),
        workflowStatus: 'published',
      } as unknown as RequiredDataFromCollectionSlug<'org-spotlight'>,
      overrideAccess: true,
    });
    summary.created.push('org-spotlight:org-seed-sample-spotlight');
    return (doc as unknown as { id?: number | string }).id ?? null;
  } catch (err) {
    summary.errors.push(`org-spotlight — ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

async function findOrCreateLearning(
  payload: Awaited<ReturnType<typeof getPayload>>,
  summary: SeedSummary,
): Promise<number | string | null> {
  const found = await payload.find({
    collection: 'org-learning',
    where: { slug: { equals: 'org-seed-sample-learning' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  if (found.docs.length > 0) {
    summary.skipped.push('org-learning:org-seed-sample-learning');
    return (found.docs[0] as { id?: number | string }).id ?? null;
  }

  try {
    const doc = await payload.create({
      collection: 'org-learning',
      data: {
        title: '[Seed] Sample Learning Resource',
        slug: 'org-seed-sample-learning',
        category: 'knowledge_sharing',
        shortSummary: 'A seed learning resource for block verification.',
        detailContent: makeRichText('This is a seed learning entry used to verify the OrgLearningDetailSection block renders correctly.'),
        workflowStatus: 'published',
      } as unknown as RequiredDataFromCollectionSlug<'org-learning'>,
      overrideAccess: true,
    });
    summary.created.push('org-learning:org-seed-sample-learning');
    return (doc as unknown as { id?: number | string }).id ?? null;
  } catch (err) {
    summary.errors.push(`org-learning — ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

async function findOrCreateAboutProfile(
  payload: Awaited<ReturnType<typeof getPayload>>,
  summary: SeedSummary,
  mediaId: number | string,
): Promise<number | string | null> {
  const found = await payload.find({
    collection: 'org-about-profiles',
    where: { slug: { equals: 'org-seed-sample-profile' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  if (found.docs.length > 0) {
    summary.skipped.push('org-about-profiles:org-seed-sample-profile');
    return (found.docs[0] as { id?: number | string }).id ?? null;
  }

  try {
    const doc = await payload.create({
      collection: 'org-about-profiles',
      data: {
        name: '[Seed] Sample Profile',
        slug: 'org-seed-sample-profile',
        category: 'founder',
        shortBio: 'A seed profile for block verification.',
        profileImage: mediaId,
        detailContent: makeRichText('This is a seed about profile used to verify the OrgAboutDetailSection block renders correctly.'),
        workflowStatus: 'published',
      } as unknown as RequiredDataFromCollectionSlug<'org-about-profiles'>,
      overrideAccess: true,
    });
    summary.created.push('org-about-profiles:org-seed-sample-profile');
    return (doc as unknown as { id?: number | string }).id ?? null;
  } catch (err) {
    summary.errors.push(`org-about-profiles — ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

export async function seedOrgVerificationPages(): Promise<SeedSummary> {
  const payload = await getPayload();
  const summary: SeedSummary = { created: [], skipped: [], errors: [] };

  // ── Feed pages (no content items required) ─────────────────────────────────
  await upsertPage(payload, 'events', 'Events', [
    { blockType: 'orgFeedSection', feedType: 'events', sourceMode: 'automatic' },
  ], summary);

  await upsertPage(payload, 'spotlight', 'Spotlight', [
    { blockType: 'orgFeedSection', feedType: 'spotlight', sourceMode: 'automatic' },
  ], summary);

  await upsertPage(payload, 'learning', 'Learning', [
    { blockType: 'orgFeedSection', feedType: 'learning', sourceMode: 'automatic' },
  ], summary);

  // ── Sponsors page (pulls from global, no item required) ────────────────────
  await upsertPage(payload, 'sponsors', 'Sponsors', [
    { blockType: 'orgSponsorsSection' },
  ], summary);

  // ── Placeholder media (required by upload fields on several collections) ─────
  const mediaId = await findOrCreatePlaceholderMedia(payload);
  if (!mediaId) {
    summary.errors.push('media — could not create placeholder image; skipping detail pages');
    return summary;
  }

  // ── Detail pages (require a content item each) ─────────────────────────────
  const eventId = await findOrCreateEvent(payload, summary, mediaId);
  if (eventId) {
    await upsertPage(payload, 'events/sample-event', 'Sample Event', [
      { blockType: 'orgEventDetailSection', event: eventId, showRegistrationCta: true },
    ], summary);

    await upsertPage(payload, 'events/sample-event/register', 'Sample Event — Register', [
      { blockType: 'orgEventRegistrationSection', event: eventId },
    ], summary);
  }

  const spotlightId = await findOrCreateSpotlight(payload, summary, mediaId);
  if (spotlightId) {
    await upsertPage(payload, 'spotlight/sample-spotlight', 'Sample Spotlight', [
      { blockType: 'orgSpotlightDetailSection', spotlightEntry: spotlightId, showCategoryNav: false },
    ], summary);
  }

  const learningId = await findOrCreateLearning(payload, summary);
  if (learningId) {
    await upsertPage(payload, 'learning/sample-resource', 'Sample Learning Resource', [
      { blockType: 'orgLearningDetailSection', learningEntry: learningId, showCategoryNav: false },
    ], summary);
  }

  const profileId = await findOrCreateAboutProfile(payload, summary, mediaId);
  if (profileId) {
    await upsertPage(payload, 'about/sample-profile', 'Sample Profile', [
      { blockType: 'orgAboutDetailSection', profile: profileId, showCategoryNav: false },
    ], summary);
  }

  return summary;
}
