import { beforeEach, describe, expect, it, vi } from 'vitest';

const findMock = vi.fn();
const findGlobalMock = vi.fn();
const getPayloadMock = vi.fn(async () => ({
  find: findMock,
  findGlobal: findGlobalMock,
}));

vi.mock('@/payload/client', () => ({
  getPayload: (...args: Parameters<typeof getPayloadMock>) => getPayloadMock(...args),
}));

async function loadGetOrgHomeFeatures() {
  const mod = await import('@/infrastructure/cms/orgSiteQueries');
  return mod.getOrgHomeFeatures;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();

  getPayloadMock.mockResolvedValue({
    find: findMock,
    findGlobal: findGlobalMock,
  });
});

describe('org home page fallback logic', () => {
  it('applies published filtering + de-duplication and falls back per-section when curated lists are empty', async () => {
    findGlobalMock.mockImplementation(async ({ slug }: { slug: string }) => {
      if (slug === 'org-home-features') {
        return {
          _status: 'published',
          homeSectionOrder: ['learning', 'events', 'learning', 'invalid'],
          eventsPlaceholder: 'No featured events yet.',
          spotlightPlaceholder: 'Spotlight coming soon.',
          learningPlaceholder: 'Learning resources coming soon.',
          featuredEvents: [
            { id: 101, slug: 'spring-concert', title: 'Spring Concert', _status: 'published' },
            { id: 101, slug: 'spring-concert', title: 'Spring Concert', _status: 'published' },
            { id: 102, slug: 'draft-event', title: 'Draft Event', _status: 'draft' },
          ],
          featuredSpotlight: [],
          featuredLearning: [],
        };
      }

      if (slug === 'org-sponsors') {
        return {
          _status: 'published',
          pageTitle: 'Supporters',
        };
      }

      return null;
    });

    findMock.mockImplementation(async ({ collection }: { collection: string }) => {
      if (collection === 'org-events') {
        throw new Error('events fallback should not run when curated events exist');
      }

      if (collection === 'org-spotlight') {
        return {
          docs: [
            { id: 201, slug: 'student-a', name: 'Student A', _status: 'published' },
            { id: 201, slug: 'student-a', name: 'Student A', _status: 'published' },
            { id: 202, slug: 'draft-spotlight', name: 'Draft Spotlight', _status: 'draft' },
          ],
        };
      }

      if (collection === 'org-learning') {
        return {
          docs: [
            { id: 301, slug: 'mentorship-101', title: 'Mentorship 101', _status: 'published' },
            { id: 301, slug: 'mentorship-101', title: 'Mentorship 101', _status: 'published' },
            { id: 302, slug: 'draft-learning', title: 'Draft Learning', _status: 'draft' },
          ],
        };
      }

      throw new Error(`Unexpected collection: ${collection}`);
    });

    const getOrgHomeFeatures = await loadGetOrgHomeFeatures();
    const result = await getOrgHomeFeatures({});

    expect(result.sectionOrder).toEqual(['learning', 'events', 'spotlight', 'sponsors']);

    expect(result.events.items.map((item) => item.id)).toEqual([101]);
    expect(result.spotlight.items.map((item) => item.id)).toEqual([201]);
    expect(result.learning.items.map((item) => item.id)).toEqual([301]);

    expect(result.events.placeholder).toBe('No featured events yet.');
    expect(result.spotlight.placeholder).toBe('Spotlight coming soon.');
    expect(result.learning.placeholder).toBe('Learning resources coming soon.');

    expect(result.sponsors?.pageTitle).toBe('Supporters');

    const queriedCollections = findMock.mock.calls
      .map((call) => (call[0] as { collection?: string } | undefined)?.collection)
      .filter((value): value is string => typeof value === 'string');

    expect(queriedCollections).toContain('org-spotlight');
    expect(queriedCollections).toContain('org-learning');
    expect(queriedCollections).not.toContain('org-events');
  });

  it('returns placeholder-only sections when fallback is empty and hides sponsors when pageTitle is missing', async () => {
    findGlobalMock.mockImplementation(async ({ slug }: { slug: string }) => {
      if (slug === 'org-home-features') {
        return {
          _status: 'published',
          eventsPlaceholder: '   No events yet   ',
          spotlightPlaceholder: '   ',
          learningPlaceholder: '',
          featuredEvents: [],
          featuredSpotlight: [],
          featuredLearning: [],
        };
      }

      if (slug === 'org-sponsors') {
        return {
          _status: 'published',
          pageTitle: '   ',
        };
      }

      return null;
    });

    findMock.mockResolvedValue({
      docs: [{ id: 999, _status: 'draft' }],
    });

    const getOrgHomeFeatures = await loadGetOrgHomeFeatures();
    const result = await getOrgHomeFeatures({});

    expect(result.events.items).toHaveLength(0);
    expect(result.spotlight.items).toHaveLength(0);
    expect(result.learning.items).toHaveLength(0);

    expect(result.events.placeholder).toBe('No events yet');
    expect(result.spotlight.placeholder).toBeNull();
    expect(result.learning.placeholder).toBeNull();

    expect(result.sponsors).toBeNull();
  });
});
