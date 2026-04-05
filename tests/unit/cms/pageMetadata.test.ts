import { describe, expect, it } from 'vitest';
import { buildSitePageMetadata } from '@/lib/page-metadata';

describe('site page metadata builder', () => {
  it('uses fallback metadata when CMS values are missing', () => {
    const metadata = buildSitePageMetadata({
      slug: 'about',
      settings: { siteUrl: 'https://example.com' } as never,
      page: null,
      fallbackTitle: 'Fallback Title',
      fallbackDescription: 'Fallback Description',
    });

    expect(metadata.title).toBe('Fallback Title');
    expect(metadata.description).toBe('Fallback Description');
    expect(metadata.alternates?.canonical).toBe('https://example.com/about');
    expect(metadata.openGraph?.title).toBe('Fallback Title');
    expect(metadata.openGraph?.description).toBe('Fallback Description');
    expect(metadata.openGraph?.url).toBe('https://example.com/about');
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });

  it('prefers page seo fields and default seo images from settings', () => {
    const metadata = buildSitePageMetadata({
      slug: 'services',
      settings: {
        siteUrl: 'https://example.com',
        defaultSeo: {
          metaTitle: 'Global Default Title',
          metaDescription: 'Global Default Description',
          ogImage: { url: 'https://example.com/default-og.png', alt: 'Default OG' },
        },
      } as never,
      page: {
        title: 'CMS Page Title',
        seo: {
          metaTitle: 'CMS Meta Title',
          metaDescription: 'CMS Meta Description',
          ogTitle: 'CMS OG Title',
          ogDescription: 'CMS OG Description',
          canonicalUrl: 'https://custom.example.com/services',
        },
      } as never,
      fallbackTitle: 'Fallback Title',
      fallbackDescription: 'Fallback Description',
    });

    expect(metadata.title).toBe('CMS Meta Title');
    expect(metadata.description).toBe('CMS Meta Description');
    expect(metadata.alternates?.canonical).toBe('https://custom.example.com/services');
    expect(metadata.openGraph).toEqual({
      title: 'CMS OG Title',
      description: 'CMS OG Description',
      url: 'https://custom.example.com/services',
      images: [{ url: 'https://example.com/default-og.png', alt: 'Default OG' }],
    });
  });

  it('applies fallback robots directives when seo-level values are not set', () => {
    const metadata = buildSitePageMetadata({
      slug: 'privacy',
      settings: { siteUrl: 'https://example.com' } as never,
      page: null,
      fallbackTitle: 'Privacy Policy',
      fallbackDescription: 'Privacy details',
      fallbackNoindex: true,
      fallbackNofollow: true,
    });

    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
