import { getPayload } from './client';

// ─── Types ────────────────────────────────────────────────────────────────────
// These mirror the Sanity types so existing components can keep working
// with minimal changes.

export type SeoFields = {
  metaTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
  includeInSitemap?: boolean;
  ogImage?: {
    url?: string;
    alt?: string;
  };
};

export type SiteSettings = {
  siteName?: string;
  brandTagline?: string;
  siteUrl?: string;
  contactEmail?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  twitterHandle?: string;
  defaultSeo?: SeoFields;
  defaultMetaDescription?: string;
  navigationLinks?: Array<{
    id?: string;
    label?: string;
    href?: string;
    isVisible?: boolean;
  }>;
  footerColumns?: Array<{
    id?: string;
    title?: string;
    links?: Array<{ id?: string; label?: string; href?: string }>;
  }>;
  socialLinks?: Array<{ id?: string; label?: string; url?: string }>;
  copyrightText?: string;
  footerLegalLabel?: string;
  footerLegalHref?: string;
  jsonLd?: {
    organizationName?: string;
    organizationUrl?: string;
    organizationEmail?: string;
    sameAs?: Array<{ url?: string }>;
  };
  guideForm?: {
    submitLabel?: string;
    submittingLabel?: string;
    successHeading?: string;
    successBody?: string;
    footerText?: string;
    namePlaceholder?: string;
    emailPlaceholder?: string;
  };
  inquiryForm?: {
    submitLabel?: string;
    submittingLabel?: string;
    successHeading?: string;
    successBody?: string;
    consentText?: string;
    namePlaceholder?: string;
    emailPlaceholder?: string;
    companyPlaceholder?: string;
    challengePlaceholder?: string;
  };
  cookieBanner?: {
    message?: string;
    acceptLabel?: string;
    declineLabel?: string;
    privacyLabel?: string;
    privacyHref?: string;
  };
  privacyPolicy?: unknown;
  privacyLastUpdated?: string;
  notFoundPage?: {
    heading?: string;
    body?: string;
    buttonLabel?: string;
    buttonHref?: string;
  };
  analyticsId?: string;
};

export type PageSection = {
  id?: string;
  blockType: string;
  [key: string]: unknown;
};

export type SitePage = {
  id?: string;
  title?: string;
  slug?: string;
  pageMode?: 'builder' | 'template';
  templateKey?: 'default' | 'landing' | 'article' | 'product';
  isActive?: boolean;
  seo?: SeoFields;
  sections?: PageSection[];
};

export type BlogPost = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  isFeatured?: boolean;
  publishedAt?: string;
  readingTimeMinutes?: number;
  tags?: Array<{ tag?: string }>;
  body?: unknown;
  seo?: SeoFields;
  coverImage?: {
    url?: string;
    alt?: string;
  };
  resourceUrl?: string;
  resourceFile?: {
    url?: string;
  };
};

export type ServiceItem = {
  id?: string;
  title?: string;
  slug?: string;
  summary?: string;
  body?: unknown;
  tags?: Array<{ tag?: string }>;
  isFeatured?: boolean;
  priceFrom?: number;
  currency?: string;
  seo?: SeoFields;
  heroImage?: {
    url?: string;
    alt?: string;
  };
};

export type Testimonial = {
  id?: string;
  personName?: string;
  role?: string;
  company?: string;
  quote?: string;
  slug?: string;
  isFeatured?: boolean;
  rating?: number;
  tags?: Array<{ tag?: string }>;
  publishedAt?: string;
  details?: unknown;
  seo?: SeoFields;
  avatar?: {
    url?: string;
    alt?: string;
  };
};

export type RedirectRule = {
  fromPath?: string;
  toPath?: string;
  isPermanent?: boolean;
  enabled?: boolean;
};

export type CollectionData = {
  blogPosts: BlogPost[];
  serviceItems: ServiceItem[];
  testimonials: Testimonial[];
};

export type SitemapQueryResult = {
  sitePages: Array<{ slug?: string; includeInSitemap?: boolean; updatedAt?: string }>;
  blogPosts: Array<{ slug?: string; includeInSitemap?: boolean; updatedAt?: string }>;
  serviceItems: Array<{ slug?: string; includeInSitemap?: boolean; updatedAt?: string }>;
  testimonials: Array<{ slug?: string; includeInSitemap?: boolean; updatedAt?: string }>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeMedia(media: unknown): { url?: string; alt?: string } | undefined {
  if (!media || typeof media !== 'object') return undefined;
  const m = media as Record<string, unknown>;
  return {
    url: typeof m.url === 'string' ? m.url : undefined,
    alt: typeof m.alt === 'string' ? m.alt : undefined,
  };
}

function normalizeSeo(seo: unknown): SeoFields | undefined {
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

// ─── Data Fetching Functions ──────────────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const payload = await getPayload();
    const data = await payload.findGlobal({ slug: 'site-settings' });
    if (!data) return null;

    const d = data as Record<string, unknown>;
    return {
      siteName: d.siteName as string | undefined,
      brandTagline: d.brandTagline as string | undefined,
      siteUrl: d.siteUrl as string | undefined,
      contactEmail: d.contactEmail as string | undefined,
      primaryCtaLabel: d.primaryCtaLabel as string | undefined,
      primaryCtaHref: d.primaryCtaHref as string | undefined,
      twitterHandle: d.twitterHandle as string | undefined,
      defaultSeo: normalizeSeo(d.defaultSeo),
      defaultMetaDescription: d.defaultMetaDescription as string | undefined,
      navigationLinks: d.navigationLinks as SiteSettings['navigationLinks'],
      footerColumns: d.footerColumns as SiteSettings['footerColumns'],
      socialLinks: d.socialLinks as SiteSettings['socialLinks'],
      copyrightText: d.copyrightText as string | undefined,
      footerLegalLabel: d.footerLegalLabel as string | undefined,
      footerLegalHref: d.footerLegalHref as string | undefined,
      jsonLd: d.jsonLd as SiteSettings['jsonLd'],
      guideForm: d.guideForm as SiteSettings['guideForm'],
      inquiryForm: d.inquiryForm as SiteSettings['inquiryForm'],
      cookieBanner: d.cookieBanner as SiteSettings['cookieBanner'],
      privacyPolicy: d.privacyPolicy,
      privacyLastUpdated: d.privacyLastUpdated as string | undefined,
      notFoundPage: d.notFoundPage as SiteSettings['notFoundPage'],
      analyticsId: d.analyticsId as string | undefined,
    };
  } catch {
    return null;
  }
}

export async function getSitePageBySlug(slug: string): Promise<SitePage | null> {
  try {
    const payload = await getPayload();
    const result = await payload.find({
      collection: 'site-pages',
      where: {
        slug: { equals: slug },
        isActive: { equals: true },
      },
      limit: 1,
      depth: 2,
    });
    const doc = result.docs[0];
    if (!doc) return null;

    const d = doc as Record<string, unknown>;
    return {
      id: String(d.id),
      title: d.title as string | undefined,
      slug: d.slug as string | undefined,
      pageMode: d.pageMode as SitePage['pageMode'],
      templateKey: d.templateKey as SitePage['templateKey'],
      isActive: d.isActive as boolean | undefined,
      seo: normalizeSeo(d.seo),
      sections: Array.isArray(d.sections) ? d.sections.map(normalizeSection) : [],
    };
  } catch {
    return null;
  }
}

function normalizeSection(block: unknown): PageSection {
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

function normalizeBlogPost(doc: Record<string, unknown>): BlogPost {
  return {
    id: String(doc.id),
    title: doc.title as string | undefined,
    slug: doc.slug as string | undefined,
    excerpt: doc.excerpt as string | undefined,
    isFeatured: doc.isFeatured as boolean | undefined,
    publishedAt: doc.publishedAt as string | undefined,
    readingTimeMinutes: doc.readingTimeMinutes as number | undefined,
    tags: doc.tags as BlogPost['tags'],
    body: doc.body,
    seo: normalizeSeo(doc.seo),
    coverImage: normalizeMedia(doc.coverImage),
    resourceUrl: doc.resourceUrl as string | undefined,
    resourceFile: normalizeMedia(doc.resourceFile) as BlogPost['resourceFile'],
  };
}

function normalizeServiceItem(doc: Record<string, unknown>): ServiceItem {
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

function normalizeTestimonial(doc: Record<string, unknown>): Testimonial {
  return {
    id: String(doc.id),
    personName: doc.personName as string | undefined,
    role: doc.role as string | undefined,
    company: doc.company as string | undefined,
    quote: doc.quote as string | undefined,
    slug: doc.slug as string | undefined,
    isFeatured: doc.isFeatured as boolean | undefined,
    rating: doc.rating as number | undefined,
    tags: doc.tags as Testimonial['tags'],
    publishedAt: doc.publishedAt as string | undefined,
    details: doc.details,
    seo: normalizeSeo(doc.seo),
    avatar: normalizeMedia(doc.avatar),
  };
}

export async function getCollectionData(): Promise<CollectionData> {
  try {
    const payload = await getPayload();
    const [blogResult, serviceResult, testimonialResult] = await Promise.all([
      payload.find({
        collection: 'blog-posts',
        sort: '-publishedAt',
        limit: 100,
        depth: 1,
      }),
      payload.find({
        collection: 'service-items',
        sort: '-updatedAt',
        limit: 100,
        depth: 1,
      }),
      payload.find({
        collection: 'testimonials',
        sort: '-publishedAt',
        limit: 100,
        depth: 1,
      }),
    ]);

    return {
      blogPosts: blogResult.docs.map((d) => normalizeBlogPost(d as unknown as Record<string, unknown>)),
      serviceItems: serviceResult.docs.map((d) => normalizeServiceItem(d as unknown as Record<string, unknown>)),
      testimonials: testimonialResult.docs.map((d) => normalizeTestimonial(d as unknown as Record<string, unknown>)),
    };
  } catch {
    return { blogPosts: [], serviceItems: [], testimonials: [] };
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const payload = await getPayload();
    const result = await payload.find({
      collection: 'blog-posts',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
    });
    const doc = result.docs[0];
    if (!doc) return null;
    return normalizeBlogPost(doc as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function getServiceItemBySlug(slug: string): Promise<ServiceItem | null> {
  try {
    const payload = await getPayload();
    const result = await payload.find({
      collection: 'service-items',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
    });
    const doc = result.docs[0];
    if (!doc) return null;
    return normalizeServiceItem(doc as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function getTestimonialBySlug(slug: string): Promise<Testimonial | null> {
  try {
    const payload = await getPayload();
    const result = await payload.find({
      collection: 'testimonials',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
    });
    const doc = result.docs[0];
    if (!doc) return null;
    return normalizeTestimonial(doc as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function getSitemapSlugs(): Promise<SitemapQueryResult> {
  try {
    const payload = await getPayload();
    const [pages, blogs, services, testimonials] = await Promise.all([
      payload.find({ collection: 'site-pages', where: { isActive: { equals: true } }, limit: 500 }),
      payload.find({ collection: 'blog-posts', limit: 500 }),
      payload.find({ collection: 'service-items', limit: 500 }),
      payload.find({ collection: 'testimonials', limit: 500 }),
    ]);

    const mapDoc = (d: Record<string, unknown>) => ({
      slug: d.slug as string | undefined,
      includeInSitemap: (d.seo as Record<string, unknown> | undefined)?.includeInSitemap as boolean | undefined ?? true,
      updatedAt: d.updatedAt as string | undefined,
    });

    return {
      sitePages: pages.docs.map((d) => mapDoc(d as unknown as Record<string, unknown>)),
      blogPosts: blogs.docs.map((d) => mapDoc(d as unknown as Record<string, unknown>)),
      serviceItems: services.docs.map((d) => mapDoc(d as unknown as Record<string, unknown>)),
      testimonials: testimonials.docs.map((d) => mapDoc(d as unknown as Record<string, unknown>)),
    };
  } catch {
    return { sitePages: [], blogPosts: [], serviceItems: [], testimonials: [] };
  }
}

export async function getRedirectRules(): Promise<RedirectRule[]> {
  try {
    const payload = await getPayload();
    const result = await payload.find({
      collection: 'redirect-rules',
      where: { enabled: { equals: true } },
      limit: 500,
    });
    return result.docs.map((d) => {
      const doc = d as unknown as Record<string, unknown>;
      return {
        fromPath: doc.fromPath as string | undefined,
        toPath: doc.toPath as string | undefined,
        isPermanent: doc.isPermanent as boolean | undefined,
        enabled: doc.enabled as boolean | undefined,
      };
    });
  } catch {
    return [];
  }
}
