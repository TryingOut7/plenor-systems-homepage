import { cache } from 'react';
import { getPayload } from './client';

// ─── Types ────────────────────────────────────────────────────────────────────
// Payload CMS data types consumed by frontend components.

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
  headerButtons?: Array<{
    id?: string;
    label?: string;
    href?: string;
    variant?: 'primary' | 'ghost';
    isVisible?: boolean;
  }>;
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

export type UISettings = {
  colors?: {
    primary?: string;
    primaryHover?: string;
    background?: string;
    surface?: string;
    sectionAlt?: string;
    text?: string;
    textMuted?: string;
    border?: string;
    link?: string;
    focusRing?: string;
    navyBackground?: string;
    charcoalBackground?: string;
    blackBackground?: string;
    darkText?: string;
    darkTextMuted?: string;
    heroBackground?: string;
    heroText?: string;
    heroMutedText?: string;
    footerBackground?: string;
    footerText?: string;
    footerMutedText?: string;
    cookieBackground?: string;
    cookieText?: string;
    cookieLink?: string;
  };
  typography?: {
    bodyFontFamily?: string;
    displayFontFamily?: string;
    baseFontSize?: number;
    baseLineHeight?: number;
    headingLetterSpacing?: string;
    sectionLabelLetterSpacing?: string;
  };
  layout?: {
    containerMaxWidth?: string;
    sectionPaddingCompact?: string;
    sectionPaddingRegular?: string;
    sectionPaddingSpacious?: string;
    heroPaddingCompact?: string;
    heroPaddingRegular?: string;
    heroPaddingSpacious?: string;
    mobileSectionPadding?: string;
  };
  buttons?: {
    radius?: number;
    primaryBackground?: string;
    primaryBackgroundHover?: string;
    primaryText?: string;
    secondaryBackground?: string;
    secondaryBackgroundHover?: string;
    secondaryText?: string;
    secondaryTextHover?: string;
    ghostBackground?: string;
    ghostBackgroundHover?: string;
    ghostText?: string;
    navBackground?: string;
    navBackgroundHover?: string;
    navText?: string;
  };
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
  presetKey?: 'custom' | 'home' | 'services' | 'about' | 'pricing' | 'contact';
  presetContent?: Record<string, unknown>;
  isActive?: boolean;
  seo?: SeoFields;
  sections?: PageSection[];
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

export type BlogPost = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  coverImage?: {
    url?: string;
    alt?: string;
  };
  body?: unknown;
  publishedAt?: string;
  isFeatured?: boolean;
  readingTimeMinutes?: number;
  tags?: Array<{ tag?: string }>;
  resourceUrl?: string;
  seo?: SeoFields;
};

export type Testimonial = {
  id?: string;
  personName?: string;
  slug?: string;
  role?: string;
  company?: string;
  quote?: string;
  avatar?: {
    url?: string;
    alt?: string;
  };
  rating?: number;
  details?: unknown;
  isFeatured?: boolean;
  publishedAt?: string;
  tags?: Array<{ tag?: string }>;
  seo?: SeoFields;
};

export type RedirectRule = {
  fromPath?: string;
  toPath?: string;
  isPermanent?: boolean;
  enabled?: boolean;
};

export type CollectionData = {
  serviceItems: ServiceItem[];
  blogPosts: BlogPost[];
  testimonials: Testimonial[];
};

export type SitemapQueryResult = {
  sitePages: Array<{ slug?: string; includeInSitemap?: boolean; updatedAt?: string }>;
  serviceItems: Array<{ slug?: string; includeInSitemap?: boolean; updatedAt?: string }>;
};

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const CMS_CACHE_TTL_MS = Number.parseInt(process.env.CMS_CACHE_TTL_MS || '60000', 10);
const CMS_FAILURE_BACKOFF_MS = Number.parseInt(process.env.CMS_FAILURE_BACKOFF_MS || '30000', 10);

const siteSettingsCache: { entry?: CacheEntry<SiteSettings | null> } = {};
const uiSettingsCache: { entry?: CacheEntry<UISettings | null> } = {};
const collectionDataCache: { entry?: CacheEntry<CollectionData> } = {};
const pageCache = new Map<string, CacheEntry<SitePage | null>>();
const serviceItemCache = new Map<string, CacheEntry<ServiceItem | null>>();
const sitemapCache: { entry?: CacheEntry<SitemapQueryResult> } = {};
const redirectRulesCache: { entry?: CacheEntry<RedirectRule[]> } = {};

let payloadFailureUntil = 0;

function getFromCache<T>(entry: CacheEntry<T> | undefined): T | undefined {
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) return undefined;
  return entry.value;
}

function setCache<T>(holder: { entry?: CacheEntry<T> }, value: T, ttl = CMS_CACHE_TTL_MS): T {
  holder.entry = {
    value,
    expiresAt: Date.now() + ttl,
  };
  return value;
}

function getMapCache<T>(map: Map<string, CacheEntry<T>>, key: string): T | undefined {
  const entry = map.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    map.delete(key);
    return undefined;
  }
  return entry.value;
}

function setMapCache<T>(map: Map<string, CacheEntry<T>>, key: string, value: T, ttl = CMS_CACHE_TTL_MS): T {
  map.set(key, {
    value,
    expiresAt: Date.now() + ttl,
  });
  return value;
}

function shouldSkipPayload(): boolean {
  return Date.now() < payloadFailureUntil;
}

function markPayloadFailure(): void {
  payloadFailureUntil = Date.now() + CMS_FAILURE_BACKOFF_MS;
}

function richTextFromParagraphs(paragraphs: string[]): Record<string, unknown> {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: paragraphs
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph) => ({
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          textFormat: 0,
          textStyle: '',
          children: [
            {
              type: 'text',
              version: 1,
              text: paragraph,
              detail: 0,
              mode: 'normal',
              style: '',
              format: 0,
            },
          ],
        })),
    },
  };
}

const DEFAULT_SITE_PAGES: Record<string, SitePage> = {
  home: {
    title: 'Home',
    slug: 'home',
    pageMode: 'builder',
    isActive: true,
    sections: [
      {
        blockType: 'heroSection',
        theme: 'navy',
        eyebrow: 'Product Development Framework',
        heading:
          'Plenor Systems brings structure to the two most failure-prone stages of product development.',
        subheading: 'Testing & QA and Launch & Go-to-Market, done right.',
        primaryCtaLabel: 'Get the Free Guide',
        primaryCtaHref: '/contact#guide',
      },
      {
        blockType: 'richTextSection',
        theme: 'white',
        heading: 'Most product failures happen at the end, not the beginning.',
        content: richTextFromParagraphs([
          "Teams spend months building a product, then rush testing, skip structured QA, and launch without a clear go-to-market plan. The result: bugs found by customers, positioning that misses the market, and launches that don't generate expected traction.",
          "These aren't execution failures — they're structural ones. The final stages of product development are consistently underprepared. Plenor Systems is built specifically to fix that.",
        ]),
      },
      {
        blockType: 'ctaSection',
        theme: 'light',
        heading: 'Two stages. Both critical.',
        body: 'Plenor Systems focuses on Testing & QA and Launch & Go-to-Market, where product outcomes are won or lost.',
        buttonLabel: 'How it works',
        buttonHref: '/services',
      },
      {
        blockType: 'simpleTableSection',
        theme: 'light',
        heading: 'What We Do',
        columns: [
          { label: 'Stage' },
          { label: 'Title' },
          { label: 'Description' },
        ],
        rows: [
          {
            cells: [
              { value: 'Stage 1' },
              { value: 'Testing & QA that catches what matters before release.' },
              {
                value:
                  'A structured approach to verification, quality criteria, and release readiness. Designed to reduce rework and give your team confidence before shipping.',
              },
            ],
          },
          {
            cells: [
              { value: 'Stage 2' },
              { value: 'Launch & Go-to-Market with a plan that holds up on launch day.' },
              {
                value:
                  'From positioning and channel selection to operational readiness, the framework keeps go-to-market work structured rather than reactive.',
              },
            ],
          },
        ],
      },
      {
        blockType: 'simpleTableSection',
        theme: 'white',
        heading: 'Built for teams at every stage',
        columns: [
          { label: 'Team' },
          { label: 'How it helps' },
        ],
        rows: [
          {
            cells: [
              { value: 'Startups' },
              {
                value:
                  'Moving fast but need a reliable process for the final stretch — before a launch defines your reputation.',
              },
            ],
          },
          {
            cells: [
              { value: 'SMEs' },
              {
                value:
                  'Growing teams that have outpaced informal processes and need structure without slowing down delivery.',
              },
            ],
          },
          {
            cells: [
              { value: 'Enterprises' },
              {
                value:
                  'Larger organisations that need a rigorous, repeatable framework that scales across products and teams.',
              },
            ],
          },
        ],
      },
      {
        blockType: 'guideFormSection',
        theme: 'navy',
        anchorId: 'guide',
        label: 'Free resource',
        heading: 'Get the free guide',
        highlightText:
          'The 7 Most Common Product Development Mistakes — and How to Avoid Them.',
        body:
          'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent to your inbox automatically.',
      },
    ],
  },
  about: {
    title: 'About',
    slug: 'about',
    pageMode: 'builder',
    isActive: true,
    sections: [
      {
        blockType: 'heroSection',
        theme: 'navy',
        eyebrow: 'About',
        heading: 'Who we are',
        subheading:
          'Plenor Systems is a product development framework built around a specific observation: the stages most likely to cause a launch to fail are Testing & QA and Go-to-Market — and they’re consistently the least structured.',
      },
      {
        blockType: 'richTextSection',
        theme: 'white',
        heading: 'Who we are',
        content: richTextFromParagraphs([
          'Most frameworks cover the full development lifecycle. Plenor Systems covers only the final two stages — not because the others don’t matter, but because these two are where structure is most absent and most needed.',
          'The framework is used by teams ranging from early-stage startups to enterprise product groups that need a repeatable process between build completion and successful launch.',
        ]),
      },
      {
        blockType: 'richTextSection',
        theme: 'white',
        heading: 'Narrow by design. Deep by necessity.',
        content: richTextFromParagraphs([
          'Plenor Systems covers two stages: Testing & QA and Launch & Go-to-Market. That scope is intentional.',
          'Narrowing to two stages means the framework goes deep rather than broad. Each module is specific — built from observed patterns of what goes wrong and why. It is not a general project management tool dressed as a product framework.',
          'The narrow focus is a strength, not a limitation. Teams get a framework that is immediately applicable to real launch work.',
        ]),
      },
      {
        blockType: 'ctaSection',
        theme: 'light',
        heading: 'What we believe',
        body:
          'A well-built product deserves a structured path to market — and consistent quality standards before it gets there.',
      },
      {
        blockType: 'ctaSection',
        theme: 'navy',
        heading: 'Want to work together?',
        body:
          'Get in touch to discuss your product and team, or start with the free guide.',
        buttonLabel: 'Get in touch',
        buttonHref: '/contact',
      },
    ],
  },
  services: {
    title: 'Services',
    slug: 'services',
    pageMode: 'builder',
    isActive: true,
    sections: [
      {
        blockType: 'heroSection',
        theme: 'navy',
        eyebrow: 'Framework Overview',
        heading:
          'Two framework stages. The two that decide whether a product succeeds.',
        subheading:
          'Testing & QA and Launch & Go-to-Market are where most product failures originate — not in design or development. Plenor Systems is built specifically for these stages.',
      },
      {
        blockType: 'richTextSection',
        theme: 'white',
        heading: 'Testing & QA',
        content: richTextFromParagraphs([
          'Shipping without a structured quality process means issues surface after release — when they’re most expensive to fix. The Testing & QA module establishes clear quality criteria, verification steps, and release gates before code reaches users.',
          'Who it’s for: teams that are shipping frequently and catching issues too late, or organisations preparing for a significant launch that cannot afford post-release rework.',
        ]),
      },
      {
        blockType: 'simpleTableSection',
        theme: 'white',
        heading: 'What it covers',
        columns: [{ label: 'What it covers' }],
        rows: [
          { cells: [{ value: 'Defining quality criteria and acceptance standards before development completes' }] },
          { cells: [{ value: 'Structured test planning: functional, regression, performance, and edge-case coverage' }] },
          { cells: [{ value: 'Release readiness checklists and sign-off processes.' }] },
          { cells: [{ value: 'Defect triage and prioritisation so teams know what must be fixed before launch' }] },
        ],
      },
      {
        blockType: 'richTextSection',
        theme: 'light',
        heading: 'Launch & Go-to-Market',
        content: richTextFromParagraphs([
          'A product can pass QA and still underperform at launch. Go-to-market failures are often structural — unclear positioning, undefined channels, or a launch day without operational readiness. The Launch & GTM module addresses each of these.',
          'Who it’s for: startups preparing for a first launch, product teams at SMEs rolling out a new offering, and enterprise groups managing a significant market entry.',
        ]),
      },
      {
        blockType: 'simpleTableSection',
        theme: 'light',
        heading: 'What it covers',
        columns: [{ label: 'What it covers' }],
        rows: [
          { cells: [{ value: 'Market positioning and messaging that reflects what the product actually does' }] },
          { cells: [{ value: 'Channel selection grounded in where your target audience can be reached' }] },
          { cells: [{ value: 'Launch sequencing and operational readiness — support, onboarding, and infrastructure' }] },
          { cells: [{ value: 'Post-launch review process to capture what worked and what to adjust' }] },
        ],
      },
      {
        blockType: 'richTextSection',
        theme: 'white',
        heading: 'Why a framework, not a one-off engagement',
        content: richTextFromParagraphs([
          'Ad-hoc approaches to testing and go-to-market work in isolation but don’t build repeatable capability. Each launch starts from scratch, and teams re-learn the same lessons.',
          'A structured framework means your team builds consistent habits — clear criteria before testing begins, defined channels before launch planning starts. It works for startups moving fast and for enterprises that need process rigour across multiple products.',
          'The framework is not prescriptive. It sets the structure; your team fills in the specifics.',
        ]),
      },
      {
        blockType: 'ctaSection',
        theme: 'navy',
        heading: 'Not sure yet?',
        body: 'Start with the guide — see the kinds of mistakes the framework is designed to prevent.',
        buttonLabel: 'Get the Free Guide',
        buttonHref: '/contact#guide',
      },
    ],
  },
  pricing: {
    title: 'Pricing',
    slug: 'pricing',
    pageMode: 'builder',
    isActive: true,
    sections: [
      {
        blockType: 'heroSection',
        theme: 'navy',
        eyebrow: 'Pricing',
        heading: "Let's find the right fit for your team.",
        subheading:
          "Pricing is tailored based on your team size and scope. Get in touch and we'll come back with a proposal.",
      },
      {
        blockType: 'simpleTableSection',
        theme: 'white',
        heading: 'Everything you need to ship with confidence.',
        columns: [
          { label: 'Included' },
          { label: 'Details' },
        ],
        rows: [
          {
            cells: [
              { value: 'Testing & QA Module' },
              { value: 'Quality criteria, structured test planning, release readiness checklists, and defect triage.' },
            ],
          },
          {
            cells: [
              { value: 'Launch & Go-to-Market Module' },
              { value: 'Positioning and messaging, channel strategy, launch sequencing, and operational readiness.' },
            ],
          },
          {
            cells: [
              { value: 'Onboarding support' },
              { value: 'Help your team adopt the framework from day one.' },
            ],
          },
        ],
      },
      {
        blockType: 'richTextSection',
        theme: 'white',
        content: richTextFromParagraphs([
          'Engagement is straightforward to start. The framework is accessible to teams of any size — no minimum headcount or project scale required.',
        ]),
      },
      {
        blockType: 'simpleTableSection',
        theme: 'light',
        heading: 'No minimum team size. Any stage.',
        columns: [
          { label: 'Team' },
          { label: 'Best fit' },
        ],
        rows: [
          {
            cells: [
              { value: 'Startups' },
              { value: 'Early-stage teams preparing for a first or major launch who need process without overhead.' },
            ],
          },
          {
            cells: [
              { value: 'SMEs' },
              { value: 'Mid-sized teams with established products moving into new markets or scaling delivery cadence.' },
            ],
          },
          {
            cells: [
              { value: 'Enterprises' },
              { value: 'Organizations that need repeatable launch quality and GTM structure across multiple teams.' },
            ],
          },
        ],
      },
      {
        blockType: 'ctaSection',
        theme: 'white',
        heading: 'Ready to talk?',
        body: "Tell us about your product and team and we'll come back with a proposal.",
        buttonLabel: 'Get in touch',
        buttonHref: '/contact',
      },
      {
        blockType: 'ctaSection',
        theme: 'light',
        heading: 'Not ready to talk yet?',
        body: 'Start with the free guide to get a sense of the problems the framework addresses.',
        buttonLabel: 'Get the free guide',
        buttonHref: '/contact#guide',
      },
    ],
  },
  contact: {
    title: 'Contact',
    slug: 'contact',
    pageMode: 'builder',
    isActive: true,
    sections: [
      {
        blockType: 'heroSection',
        theme: 'navy',
        eyebrow: 'Contact',
        heading: 'Let’s talk.',
        subheading:
          'Tell us about your product and team and we’ll get back to you within 2 business days.',
      },
      {
        blockType: 'guideFormSection',
        theme: 'light',
        anchorId: 'guide',
        label: 'Free resource',
        heading: 'Get the free guide',
        highlightText:
          'The 7 Most Common Product Development Mistakes — and How to Avoid Them.',
        body:
          'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent to your inbox automatically.',
      },
      {
        blockType: 'inquiryFormSection',
        theme: 'white',
        label: 'Send an inquiry',
        heading: 'Send a direct inquiry',
        subtext:
          'Tell us about your product, your team, and the challenge you’re working through. We’ll respond within 2 business days.',
      },
      {
        blockType: 'privacyNoteSection',
        theme: 'light',
        label: 'By submitting this form, you agree to our',
        policyLinkLabel: 'Privacy Policy',
        policyLinkHref: '/privacy',
      },
    ],
  },
};

function cloneDefaultSitePage(slug: string): SitePage | null {
  const page = DEFAULT_SITE_PAGES[slug];
  if (!page) return null;
  return {
    ...page,
    sections: Array.isArray(page.sections) ? page.sections.map((section) => ({ ...section })) : [],
  };
}

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

export const getSiteSettings = cache(async function getSiteSettings(): Promise<SiteSettings | null> {
  const cached = getFromCache(siteSettingsCache.entry);
  if (cached !== undefined) return cached;
  if (shouldSkipPayload()) return setCache(siteSettingsCache, null, 10_000);

  try {
    const payload = await getPayload();
    const data = await payload.findGlobal({ slug: 'site-settings' });
    if (!data) return setCache(siteSettingsCache, null);

    const d = data as Record<string, unknown>;
    return setCache(siteSettingsCache, {
      siteName: d.siteName as string | undefined,
      brandTagline: d.brandTagline as string | undefined,
      siteUrl: d.siteUrl as string | undefined,
      contactEmail: d.contactEmail as string | undefined,
      primaryCtaLabel: d.primaryCtaLabel as string | undefined,
      primaryCtaHref: d.primaryCtaHref as string | undefined,
      headerButtons: d.headerButtons as SiteSettings['headerButtons'],
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
    });
  } catch {
    markPayloadFailure();
    return setCache(siteSettingsCache, null, 10_000);
  }
});

export const getUISettings = cache(async function getUISettings(): Promise<UISettings | null> {
  const cached = getFromCache(uiSettingsCache.entry);
  if (cached !== undefined) return cached;
  if (shouldSkipPayload()) return setCache(uiSettingsCache, null, 10_000);

  try {
    const payload = await getPayload();
    const data = await payload.findGlobal({ slug: 'ui-settings' });
    if (!data) return setCache(uiSettingsCache, null);

    const d = data as Record<string, unknown>;
    return setCache(uiSettingsCache, {
      colors: d.colors as UISettings['colors'],
      typography: d.typography as UISettings['typography'],
      layout: d.layout as UISettings['layout'],
      buttons: d.buttons as UISettings['buttons'],
    });
  } catch {
    markPayloadFailure();
    return setCache(uiSettingsCache, null, 10_000);
  }
});

export const getSitePageBySlug = cache(async function getSitePageBySlug(slug: string): Promise<SitePage | null> {
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, '');
  const cached = getMapCache(pageCache, normalizedSlug);
  if (cached !== undefined) return cached;

  if (shouldSkipPayload()) {
    return setMapCache(pageCache, normalizedSlug, cloneDefaultSitePage(normalizedSlug), 10_000);
  }

  try {
    const payload = await getPayload();
    const result = await payload.find({
      collection: 'site-pages',
      where: {
        slug: { equals: normalizedSlug },
        isActive: { equals: true },
        workflowStatus: { equals: 'published' },
      },
      limit: 1,
      depth: 2,
    });
    const doc = result.docs[0];
    if (!doc) {
      return setMapCache(pageCache, normalizedSlug, cloneDefaultSitePage(normalizedSlug));
    }

    const d = doc as Record<string, unknown>;
    const fallback = cloneDefaultSitePage(normalizedSlug);
    const sections = Array.isArray(d.sections) ? d.sections.map(normalizeSection) : [];
    const resolvedSections = sections.length > 0 ? sections : (fallback?.sections ?? []);

    return setMapCache(pageCache, normalizedSlug, {
      id: String(d.id),
      title: (d.title as string | undefined) || fallback?.title,
      slug: (d.slug as string | undefined) || fallback?.slug,
      pageMode: d.pageMode as SitePage['pageMode'],
      templateKey: d.templateKey as SitePage['templateKey'],
      presetKey: d.presetKey as SitePage['presetKey'],
      presetContent: d.presetContent as SitePage['presetContent'],
      isActive: d.isActive as boolean | undefined,
      seo: normalizeSeo(d.seo),
      sections: resolvedSections,
    });
  } catch {
    markPayloadFailure();
    return setMapCache(pageCache, normalizedSlug, cloneDefaultSitePage(normalizedSlug), 10_000);
  }
});

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

function normalizeBlogPost(doc: Record<string, unknown>): BlogPost {
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
    resourceUrl: doc.resourceUrl as string | undefined,
    seo: normalizeSeo(doc.seo),
  };
}

function normalizeTestimonial(doc: Record<string, unknown>): Testimonial {
  return {
    id: String(doc.id),
    personName: doc.personName as string | undefined,
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

export const getCollectionData = cache(async function getCollectionData(): Promise<CollectionData> {
  const cached = getFromCache(collectionDataCache.entry);
  if (cached !== undefined) return cached;
  const emptyData: CollectionData = { serviceItems: [], blogPosts: [], testimonials: [] };
  if (shouldSkipPayload()) return setCache(collectionDataCache, emptyData, 10_000);

  try {
    const payload = await getPayload();
    const publishedFilter = { workflowStatus: { equals: 'published' } };
    const [serviceResult, blogResult, testimonialResult] = await Promise.all([
      payload.find({
        collection: 'service-items',
        where: publishedFilter,
        sort: '-updatedAt',
        limit: 100,
        depth: 1,
      }),
      payload.find({
        collection: 'blog-posts',
        where: publishedFilter,
        sort: '-publishedAt',
        limit: 100,
        depth: 1,
      }),
      payload.find({
        collection: 'testimonials',
        where: publishedFilter,
        sort: '-publishedAt',
        limit: 100,
        depth: 1,
      }),
    ]);

    return setCache(collectionDataCache, {
      serviceItems: serviceResult.docs.map((d) => normalizeServiceItem(d as unknown as Record<string, unknown>)),
      blogPosts: blogResult.docs.map((d) => normalizeBlogPost(d as unknown as Record<string, unknown>)),
      testimonials: testimonialResult.docs.map((d) => normalizeTestimonial(d as unknown as Record<string, unknown>)),
    });
  } catch {
    markPayloadFailure();
    return setCache(collectionDataCache, emptyData, 10_000);
  }
});

export const getServiceItemBySlug = cache(async function getServiceItemBySlug(slug: string): Promise<ServiceItem | null> {
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, '');
  const cached = getMapCache(serviceItemCache, normalizedSlug);
  if (cached !== undefined) return cached;
  if (shouldSkipPayload()) return setMapCache(serviceItemCache, normalizedSlug, null, 10_000);

  try {
    const payload = await getPayload();
    const result = await payload.find({
      collection: 'service-items',
      where: { slug: { equals: normalizedSlug }, workflowStatus: { equals: 'published' } },
      limit: 1,
      depth: 1,
    });
    const doc = result.docs[0];
    if (!doc) return setMapCache(serviceItemCache, normalizedSlug, null);
    return setMapCache(
      serviceItemCache,
      normalizedSlug,
      normalizeServiceItem(doc as unknown as Record<string, unknown>),
    );
  } catch {
    markPayloadFailure();
    return setMapCache(serviceItemCache, normalizedSlug, null, 10_000);
  }
});

export const getSitemapSlugs = cache(async function getSitemapSlugs(): Promise<SitemapQueryResult> {
  const cached = getFromCache(sitemapCache.entry);
  if (cached !== undefined) return cached;
  if (shouldSkipPayload()) {
    const fallback = {
      sitePages: Object.keys(DEFAULT_SITE_PAGES).map((slug) => ({ slug, includeInSitemap: true })),
      serviceItems: [],
    };
    return setCache(sitemapCache, fallback, 10_000);
  }

  try {
    const payload = await getPayload();
    const [pages, services] = await Promise.all([
      payload.find({ collection: 'site-pages', where: { isActive: { equals: true }, workflowStatus: { equals: 'published' } }, limit: 500 }),
      payload.find({ collection: 'service-items', where: { workflowStatus: { equals: 'published' } }, limit: 500 }),
    ]);

    const mapDoc = (d: Record<string, unknown>) => ({
      slug: d.slug as string | undefined,
      includeInSitemap: (d.seo as Record<string, unknown> | undefined)?.includeInSitemap as boolean | undefined ?? true,
      updatedAt: d.updatedAt as string | undefined,
    });

    return setCache(sitemapCache, {
      sitePages: pages.docs.map((d) => mapDoc(d as unknown as Record<string, unknown>)),
      serviceItems: services.docs.map((d) => mapDoc(d as unknown as Record<string, unknown>)),
    });
  } catch {
    markPayloadFailure();
    const fallback = {
      sitePages: Object.keys(DEFAULT_SITE_PAGES).map((slug) => ({ slug, includeInSitemap: true })),
      serviceItems: [],
    };
    return setCache(sitemapCache, fallback, 10_000);
  }
});

export const getRedirectRules = cache(async function getRedirectRules(): Promise<RedirectRule[]> {
  const cached = getFromCache(redirectRulesCache.entry);
  if (cached !== undefined) return cached;
  if (shouldSkipPayload()) return setCache(redirectRulesCache, [], 10_000);

  try {
    const payload = await getPayload();
    const result = await payload.find({
      collection: 'redirect-rules',
      where: { enabled: { equals: true } },
      limit: 500,
    });
    return setCache(
      redirectRulesCache,
      result.docs.map((d) => {
        const doc = d as unknown as Record<string, unknown>;
        return {
          fromPath: doc.fromPath as string | undefined,
          toPath: doc.toPath as string | undefined,
          isPermanent: doc.isPermanent as boolean | undefined,
          enabled: doc.enabled as boolean | undefined,
        };
      }),
    );
  } catch {
    markPayloadFailure();
    return setCache(redirectRulesCache, [], 10_000);
  }
});
