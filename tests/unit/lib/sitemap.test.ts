import { beforeEach, describe, expect, it, vi } from 'vitest';

const getSiteSettingsMock = vi.fn();
const getSitemapSlugsMock = vi.fn();
const resolveSiteUrlMock = vi.fn();
const resolveCommunityBasePathMock = vi.fn();
const findMock = vi.fn();
const findGlobalMock = vi.fn();
const getPayloadMock = vi.fn();

vi.mock('@/payload/cms', () => ({
  getSiteSettings: (...args: Parameters<typeof getSiteSettingsMock>) => getSiteSettingsMock(...args),
  getSitemapSlugs: (...args: Parameters<typeof getSitemapSlugsMock>) => getSitemapSlugsMock(...args),
}));

vi.mock('@/lib/site-config', () => ({
  resolveSiteUrl: (...args: Parameters<typeof resolveSiteUrlMock>) => resolveSiteUrlMock(...args),
}));

vi.mock('@/lib/community-site-config', () => ({
  resolveCommunityBasePath: (...args: Parameters<typeof resolveCommunityBasePathMock>) =>
    resolveCommunityBasePathMock(...args),
}));

vi.mock('@/payload/client', () => ({
  getPayload: (...args: Parameters<typeof getPayloadMock>) => getPayloadMock(...args),
}));

async function loadSitemap() {
  const mod = await import('@/app/sitemap');
  return mod.default;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();

  getSiteSettingsMock.mockResolvedValue({});
  getSitemapSlugsMock.mockResolvedValue({
    sitePages: [],
    serviceItems: [],
  });
  resolveSiteUrlMock.mockReturnValue('https://example.com');
  resolveCommunityBasePathMock.mockReturnValue(null);
  getPayloadMock.mockResolvedValue({
    find: findMock,
    findGlobal: findGlobalMock,
  });
  findMock.mockResolvedValue({ docs: [] });
  findGlobalMock.mockResolvedValue(null);
});

describe('sitemap community routes', () => {
  it('does not include community URLs when base path is disabled', async () => {
    resolveCommunityBasePathMock.mockReturnValue(null);

    const sitemap = await loadSitemap();
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls.some((url) => url.includes('/community'))).toBe(false);
    expect(getPayloadMock).not.toHaveBeenCalled();
  });

  it('includes community routes when base path is configured', async () => {
    resolveCommunityBasePathMock.mockReturnValue('/community');

    findMock.mockImplementation(async ({ collection }: { collection: string }) => {
      if (collection === 'org-events') {
        return {
          docs: [{ slug: 'spring-concert', updatedAt: '2026-04-07T00:00:00.000Z' }],
        };
      }

      if (collection === 'org-spotlight') {
        return {
          docs: [{ slug: 'anika', category: 'student', updatedAt: '2026-04-06T00:00:00.000Z' }],
        };
      }

      if (collection === 'org-learning') {
        return {
          docs: [{ slug: 'mentor-series', category: 'mentorship', updatedAt: '2026-04-05T00:00:00.000Z' }],
        };
      }

      if (collection === 'org-about-profiles') {
        return {
          docs: [{ slug: 'founder-ravi', category: 'founder', updatedAt: '2026-04-04T00:00:00.000Z' }],
        };
      }

      return { docs: [] };
    });

    findGlobalMock.mockResolvedValue({
      pageTitle: 'Sponsors',
      _status: 'published',
      updatedAt: '2026-04-03T00:00:00.000Z',
    });

    const sitemap = await loadSitemap();
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain('https://example.com/community');
    expect(urls).toContain('https://example.com/community/events');
    expect(urls).toContain('https://example.com/community/spotlight/student');
    expect(urls).toContain('https://example.com/community/learning/mentorship');
    expect(urls).toContain('https://example.com/community/about/founder');
    expect(urls).toContain('https://example.com/community/sponsors');
    expect(urls).toContain('https://example.com/community/events/spring-concert');
    expect(urls).toContain('https://example.com/community/spotlight/student/anika');
    expect(urls).toContain('https://example.com/community/learning/mentorship/mentor-series');
    expect(urls).toContain('https://example.com/community/about/founder/founder-ravi');
  });
});
