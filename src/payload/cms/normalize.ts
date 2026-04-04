import { buildCorePresetSections, type CorePresetKey } from '../presets/corePagePresets.ts';
import type { BlogPost, PageSection, SeoFields, ServiceItem, SitePage, Testimonial } from './types.ts';

type CorePagePreset = Exclude<CorePresetKey, 'custom'>;

const DEFAULT_PAGE_TITLES: Record<CorePagePreset, string> = {
  home: 'Home',
  about: 'About',
  services: 'Services',
  pricing: 'Pricing',
  contact: 'Contact',
};

export const DEFAULT_SITE_PAGE_SLUGS: ReadonlyArray<CorePagePreset> = Object.freeze(
  Object.keys(DEFAULT_PAGE_TITLES) as CorePagePreset[],
);

const DEFAULT_SITE_PAGES: Record<string, SitePage> = DEFAULT_SITE_PAGE_SLUGS.reduce((acc, presetKey) => {
  acc[presetKey] = {
    title: DEFAULT_PAGE_TITLES[presetKey],
    slug: presetKey,
    pageMode: 'builder',
    presetKey,
    presetContent: {},
    isActive: true,
    sections: buildCorePresetSections(presetKey, {}) as unknown as PageSection[],
  };
  return acc;
}, {} as Record<string, SitePage>);

export function cloneDefaultSitePage(slug: string): SitePage | null {
  const page = DEFAULT_SITE_PAGES[slug];
  if (!page) return null;
  return {
    ...page,
    sections: Array.isArray(page.sections) ? page.sections.map((section) => ({ ...section })) : [],
  };
}

function normalizeMedia(media: unknown): { url?: string; alt?: string } | undefined {
  if (!media || typeof media !== 'object') return undefined;
  const m = media as Record<string, unknown>;
  return {
    url: typeof m.url === 'string' ? m.url : undefined,
    alt: typeof m.alt === 'string' ? m.alt : undefined,
  };
}

export function normalizeSeo(seo: unknown): SeoFields | undefined {
  if (!seo || typeof seo !== 'object') return undefined;
  const s = seo as Record<string, unknown>;
  return {
    metaTitle: s.metaTitle as string | undefined,
    metaDescription: s.metaDescription as string | undefined,
    ogTitle: s.ogTitle as string | undefined,
    ogDescription: s.ogDescription as string | undefined,
    canonicalUrl: s.canonicalUrl as string | undefined,
    noindex: s.noindex as boolean | undefined,
    nofollow: s.nofollow as boolean | undefined,
    includeInSitemap: s.includeInSitemap as boolean | undefined,
    ogImage: normalizeMedia(s.ogImage),
  };
}

export function normalizeSection(block: unknown): PageSection {
  if (!block || typeof block !== 'object') {
    return { blockType: 'unknown' };
  }
  const b = block as Record<string, unknown>;
  return {
    ...b,
    id: String(b.id ?? ''),
    blockType: String(b.blockType ?? 'unknown'),
  } as PageSection;
}

export function normalizeServiceItem(doc: Record<string, unknown>): ServiceItem {
  return {
    id: String(doc.id),
    title: doc.title as string | undefined,
    slug: doc.slug as string | undefined,
    summary: doc.summary as string | undefined,
    body: doc.body,
    tags: doc.tags as ServiceItem['tags'],
    isFeatured: doc.isFeatured as boolean | undefined,
    priceFrom: doc.priceFrom as number | undefined,
    currency: doc.currency as string | undefined,
    seo: normalizeSeo(doc.seo),
    heroImage: normalizeMedia(doc.heroImage),
  };
}

export function normalizeBlogPost(doc: Record<string, unknown>): BlogPost {
  return {
    id: String(doc.id),
    title: doc.title as string | undefined,
    slug: doc.slug as string | undefined,
    excerpt: doc.excerpt as string | undefined,
    coverImage: normalizeMedia(doc.coverImage),
    body: doc.body,
    publishedAt: doc.publishedAt as string | undefined,
    isFeatured: doc.isFeatured as boolean | undefined,
    readingTimeMinutes: doc.readingTimeMinutes as number | undefined,
    tags: doc.tags as BlogPost['tags'],
    category: doc.category as BlogPost['category'],
    resourceUrl: doc.resourceUrl as string | undefined,
    seo: normalizeSeo(doc.seo),
  };
}

export function normalizeTestimonial(doc: Record<string, unknown>): Testimonial {
  return {
    id: String(doc.id),
    name: doc.name as string | undefined,
    slug: doc.slug as string | undefined,
    role: doc.role as string | undefined,
    company: doc.company as string | undefined,
    quote: doc.quote as string | undefined,
    avatar: normalizeMedia(doc.avatar),
    rating: doc.rating as number | undefined,
    details: doc.details,
    isFeatured: doc.isFeatured as boolean | undefined,
    publishedAt: doc.publishedAt as string | undefined,
    tags: doc.tags as Testimonial['tags'],
    seo: normalizeSeo(doc.seo),
  };
}
