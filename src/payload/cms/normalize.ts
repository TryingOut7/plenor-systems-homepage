import { buildCorePresetSections, type CorePresetKey } from '../presets/corePagePresets.ts';
import type {
  AboutProfile,
  BlogPost,
  FrameworkEntry,
  InsightEntry,
  Logo,
  PageSection,
  SeoFields,
  ServiceItem,
  SitePage,
  SolutionEntry,
  TeamMember,
  Testimonial,
} from './types.ts';
import { inferAboutProfileLabel } from '@/lib/plenor-site';

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

  let clonedSections: PageSection[] = [];
  if (Array.isArray(page.sections)) {
    try {
      clonedSections = structuredClone(page.sections);
    } catch {
      clonedSections = JSON.parse(JSON.stringify(page.sections));
    }
  }

  return {
    ...page,
    sections: clonedSections,
  };
}

function normalizeMedia(
  media: unknown,
): { url?: string; alt?: string; width?: number; height?: number } | undefined {
  if (!media || typeof media !== 'object') return undefined;
  const m = media as Record<string, unknown>;
  return {
    url: typeof m.url === 'string' ? m.url : undefined,
    alt: typeof m.alt === 'string' ? m.alt : undefined,
    width: typeof m.width === 'number' ? m.width : undefined,
    height: typeof m.height === 'number' ? m.height : undefined,
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
    resourceFile: normalizeMedia(doc.resourceFile),
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
    tags: doc.tags as Testimonial['tags'],
    seo: normalizeSeo(doc.seo),
  };
}

export function normalizeTeamMember(doc: Record<string, unknown>): TeamMember {
  return {
    id: String(doc.id),
    name: doc.name as string | undefined,
    role: doc.role as string | undefined,
    bio: doc.bio as string | undefined,
    photo: normalizeMedia(doc.photo),
    linkedinUrl: doc.linkedinUrl as string | undefined,
    twitterUrl: doc.twitterUrl as string | undefined,
    order: doc.order as number | undefined,
  };
}

export function normalizeLogo(doc: Record<string, unknown>): Logo {
  return {
    id: String(doc.id),
    name: doc.name as string | undefined,
    image: normalizeMedia(doc.image),
    url: doc.url as string | undefined,
    order: doc.order as number | undefined,
  };
}

function normalizeRelatedDocs(
  value: unknown,
): Array<{ id?: string; title?: string; slug?: string }> | undefined {
  if (!Array.isArray(value)) return undefined;
  const relatedDocs: Array<{ id?: string; title?: string; slug?: string }> = [];

  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue;
    const record = entry as Record<string, unknown>;
    relatedDocs.push({
      id: record.id ? String(record.id) : undefined,
      title: record.title as string | undefined,
      slug: record.slug as string | undefined,
    });
  }

  return relatedDocs;
}

export function normalizeFrameworkEntry(doc: Record<string, unknown>): FrameworkEntry {
  return {
    id: String(doc.id),
    title: doc.title as string | undefined,
    slug: doc.slug as string | undefined,
    category: doc.category as FrameworkEntry['category'],
    summary: doc.summary as string | undefined,
    coverImage: normalizeMedia(doc.coverImage),
    body: doc.body,
    publishedAt: doc.publishedAt as string | undefined,
    isFeatured: doc.isFeatured as boolean | undefined,
    orderingValue: doc.orderingValue as number | undefined,
    ctaPath: doc.ctaPath as string | undefined,
    relatedSolutions: normalizeRelatedDocs(doc.relatedSolutions),
    relatedInsights: normalizeRelatedDocs(doc.relatedInsights),
    tags: doc.tags as FrameworkEntry['tags'],
    seo: normalizeSeo(doc.seo),
  };
}

export function normalizeSolutionEntry(doc: Record<string, unknown>): SolutionEntry {
  return {
    id: String(doc.id),
    title: doc.title as string | undefined,
    slug: doc.slug as string | undefined,
    category: doc.category as SolutionEntry['category'],
    summary: doc.summary as string | undefined,
    coverImage: normalizeMedia(doc.coverImage),
    body: doc.body,
    publishedAt: doc.publishedAt as string | undefined,
    isFeatured: doc.isFeatured as boolean | undefined,
    orderingValue: doc.orderingValue as number | undefined,
    ctaPath: doc.ctaPath as string | undefined,
    relatedInsights: normalizeRelatedDocs(doc.relatedInsights),
    tags: doc.tags as SolutionEntry['tags'],
    seo: normalizeSeo(doc.seo),
  };
}

export function normalizeInsightEntry(doc: Record<string, unknown>): InsightEntry {
  return {
    id: String(doc.id),
    title: doc.title as string | undefined,
    slug: doc.slug as string | undefined,
    category: doc.category as InsightEntry['category'],
    excerpt: doc.excerpt as string | undefined,
    coverImage: normalizeMedia(doc.coverImage),
    body: doc.body,
    authorLabel: doc.authorLabel as string | undefined,
    publishedAt: doc.publishedAt as string | undefined,
    isFeatured: doc.isFeatured as boolean | undefined,
    orderingValue: doc.orderingValue as number | undefined,
    tags: doc.tags as InsightEntry['tags'],
    seo: normalizeSeo(doc.seo),
  };
}

export function normalizeAboutProfile(doc: Record<string, unknown>): AboutProfile {
  const category = doc.category as AboutProfile['category'];
  return {
    id: String(doc.id),
    name: doc.name as string | undefined,
    slug: doc.slug as string | undefined,
    category,
    displayLabel: inferAboutProfileLabel(category),
    shortBio: doc.shortBio as string | undefined,
    detailContent: doc.detailContent,
    profileImage: normalizeMedia(doc.profileImage),
    roleTitle: doc.roleTitle as string | undefined,
    displayOrder: doc.displayOrder as number | undefined,
    seo: normalizeSeo(doc.seo),
  };
}
