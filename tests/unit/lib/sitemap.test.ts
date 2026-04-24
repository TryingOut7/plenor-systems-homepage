import { beforeEach, describe, expect, it, vi } from 'vitest';

const getSiteSettingsMock = vi.fn();
const getSitemapSlugsMock = vi.fn();
const resolveSiteUrlMock = vi.fn();

vi.mock('@/payload/cms', () => ({
  getSiteSettings: (...args: Parameters<typeof getSiteSettingsMock>) => getSiteSettingsMock(...args),
  getSitemapSlugs: (...args: Parameters<typeof getSitemapSlugsMock>) => getSitemapSlugsMock(...args),
}));

vi.mock('@/lib/site-config', () => ({
  resolveSiteUrl: (...args: Parameters<typeof resolveSiteUrlMock>) => resolveSiteUrlMock(...args),
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
    frameworkEntries: [],
    solutionEntries: [],
    insightEntries: [],
    aboutProfiles: [],
  });
  resolveSiteUrlMock.mockReturnValue('https://example.com');
});

describe('sitemap', () => {
  it('includes static routes and eligible CMS routes', async () => {
    getSitemapSlugsMock.mockResolvedValue({
      sitePages: [
        { slug: 'events', updatedAt: '2026-04-07T00:00:00.000Z' },
        { slug: 'about', updatedAt: '2026-04-06T00:00:00.000Z' }, // duplicate of static route
        { slug: 'hidden', includeInSitemap: false, updatedAt: '2026-04-05T00:00:00.000Z' },
        { slug: '', updatedAt: '2026-04-04T00:00:00.000Z' },
      ],
      serviceItems: [],
      frameworkEntries: [
        { slug: 'operating-model', updatedAt: '2026-04-04T00:00:00.000Z' },
      ],
      solutionEntries: [
        { slug: 'advisory', updatedAt: '2026-04-03T00:00:00.000Z' },
        { slug: 'internal', includeInSitemap: false, updatedAt: '2026-04-02T00:00:00.000Z' },
      ],
      insightEntries: [
        { slug: 'launch-notes', updatedAt: '2026-04-01T00:00:00.000Z' },
      ],
      aboutProfiles: [
        { slug: 'founder', updatedAt: '2026-03-31T00:00:00.000Z' },
      ],
    });

    const sitemap = await loadSitemap();
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain('https://example.com/');
    expect(urls).toContain('https://example.com/framework');
    expect(urls).toContain('https://example.com/solutions');
    expect(urls).toContain('https://example.com/insights');
    expect(urls).toContain('https://example.com/about');
    expect(urls).toContain('https://example.com/contact');
    expect(urls).toContain('https://example.com/privacy');

    expect(urls).toContain('https://example.com/events');
    expect(urls).toContain('https://example.com/framework/operating-model');
    expect(urls).toContain('https://example.com/solutions/advisory');
    expect(urls).toContain('https://example.com/insights/launch-notes');
    expect(urls).toContain('https://example.com/about/founder');

    expect(urls).not.toContain('https://example.com/hidden');
    expect(urls).not.toContain('https://example.com/solutions/internal');
    expect(urls.some((url) => url.includes('/community'))).toBe(false);

    expect(urls.filter((url) => url === 'https://example.com/about')).toHaveLength(1);
  });

  it('treats includeInSitemap as enabled when unset', async () => {
    getSitemapSlugsMock.mockResolvedValue({
      sitePages: [{ slug: 'resources', updatedAt: '2026-04-07T00:00:00.000Z' }],
      serviceItems: [],
      frameworkEntries: [],
      solutionEntries: [{ slug: 'implementation', updatedAt: '2026-04-06T00:00:00.000Z' }],
      insightEntries: [],
      aboutProfiles: [],
    });

    const sitemap = await loadSitemap();
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain('https://example.com/resources');
    expect(urls).toContain('https://example.com/solutions/implementation');
  });
});
