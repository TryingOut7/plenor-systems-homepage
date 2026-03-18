import { sanityFetch } from './client';

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
    asset?: {
      url?: string;
    };
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
    _key?: string;
    label?: string;
    href?: string;
    isVisible?: boolean;
  }>;
  footerColumns?: Array<{
    _key?: string;
    title?: string;
    links?: Array<{ _key?: string; label?: string; href?: string }>;
  }>;
  socialLinks?: Array<{ _key?: string; label?: string; url?: string }>;
  copyrightText?: string;
  footerLegalLabel?: string;
  footerLegalHref?: string;
  jsonLd?: {
    organizationName?: string;
    organizationUrl?: string;
    organizationEmail?: string;
    sameAs?: string[];
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
  privacyPolicy?: unknown[];
  privacyLastUpdated?: string;
  notFoundPage?: {
    heading?: string;
    body?: string;
    buttonLabel?: string;
    buttonHref?: string;
  };
  analyticsId?: string;
};

export type DynamicListConfig = {
  source?: 'blogPost' | 'serviceItem' | 'testimonial';
  viewMode?: 'cards' | 'list' | 'table';
  filterField?: string;
  filterValue?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  enablePagination?: boolean;
};

export type PageSection = {
  _key?: string;
  _type: string;
  [key: string]: unknown;
};

export type SitePage = {
  _id?: string;
  _type?: string;
  title?: string;
  slug?: { current?: string };
  pageMode?: 'builder' | 'template';
  templateKey?: 'default' | 'landing' | 'article' | 'product';
  isActive?: boolean;
  seo?: SeoFields;
  sections?: PageSection[];
};

export type BlogPost = {
  _id?: string;
  _type?: 'blogPost';
  title?: string;
  slug?: { current?: string };
  excerpt?: string;
  isFeatured?: boolean;
  publishedAt?: string;
  publishDate?: string;
  readingTimeMinutes?: number;
  tags?: string[];
  body?: unknown[];
  seo?: SeoFields;
  coverImage?: {
    asset?: { url?: string };
    alt?: string;
  };
  resourceUrl?: string;
  resourceFile?: {
    asset?: { url?: string };
  };
};

export type ServiceItem = {
  _id?: string;
  _type?: 'serviceItem';
  title?: string;
  slug?: { current?: string };
  summary?: string;
  body?: unknown[];
  tags?: string[];
  isFeatured?: boolean;
  priceFrom?: number;
  currency?: string;
  seo?: SeoFields;
  heroImage?: {
    asset?: { url?: string };
    alt?: string;
  };
};

export type Testimonial = {
  _id?: string;
  _type?: 'testimonial';
  personName?: string;
  role?: string;
  company?: string;
  quote?: string;
  slug?: { current?: string };
  isFeatured?: boolean;
  rating?: number;
  tags?: string[];
  publishDate?: string;
  publishedAt?: string;
  details?: unknown[];
  seo?: SeoFields;
  avatar?: {
    asset?: { url?: string };
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

const SITE_SETTINGS_QUERY = `
*[_type == "siteSettings"][0]{
  siteName,
  brandTagline,
  siteUrl,
  contactEmail,
  primaryCtaLabel,
  primaryCtaHref,
  twitterHandle,
  defaultMetaDescription,
  copyrightText,
  footerLegalLabel,
  footerLegalHref,
  analyticsId,
  privacyLastUpdated,
  privacyPolicy,
  defaultSeo{
    metaTitle,
    metaDescription,
    ogTitle,
    ogDescription,
    canonicalUrl,
    noindex,
    nofollow,
    includeInSitemap,
    ogImage{alt, asset->{url}}
  },
  navigationLinks[]{_key, label, href, isVisible},
  footerColumns[]{
    _key,
    title,
    links[]{_key, label, href}
  },
  socialLinks[]{_key, label, url},
  jsonLd{
    organizationName,
    organizationUrl,
    organizationEmail,
    sameAs
  },
  guideForm{
    submitLabel,
    submittingLabel,
    successHeading,
    successBody,
    footerText,
    namePlaceholder,
    emailPlaceholder
  },
  inquiryForm{
    submitLabel,
    submittingLabel,
    successHeading,
    successBody,
    consentText,
    namePlaceholder,
    emailPlaceholder,
    companyPlaceholder,
    challengePlaceholder
  },
  cookieBanner{
    message,
    acceptLabel,
    declineLabel,
    privacyLabel,
    privacyHref
  },
  notFoundPage{
    heading,
    body,
    buttonLabel,
    buttonHref
  }
}`;

const SITE_PAGE_BY_SLUG_QUERY = `
*[_type == "sitePage" && slug.current == $slug && coalesce(isActive, true) == true][0]{
  _id,
  _type,
  title,
  slug,
  pageMode,
  templateKey,
  isActive,
  seo{
    metaTitle,
    metaDescription,
    ogTitle,
    ogDescription,
    canonicalUrl,
    noindex,
    nofollow,
    includeInSitemap,
    ogImage{alt, asset->{url}}
  },
  sections[]{
    ...,
    _type == "reusableSectionReference" => {
      ...,
      reusableSection->{
        _id,
        title,
        slug,
        sections[]{
          ...
        }
      }
    }
  }
}`;

const COLLECTION_DATA_QUERY = `
{
  "blogPosts": *[_type == "blogPost"] | order(coalesce(publishedAt, _createdAt) desc){
    _id,
    _type,
    title,
    slug,
    excerpt,
    isFeatured,
    publishedAt,
    publishDate,
    readingTimeMinutes,
    tags,
    coverImage{alt, asset->{url}}
  },
  "serviceItems": *[_type == "serviceItem"] | order(_updatedAt desc){
    _id,
    _type,
    title,
    slug,
    summary,
    tags,
    isFeatured,
    priceFrom,
    currency,
    heroImage{alt, asset->{url}}
  },
  "testimonials": *[_type == "testimonial"] | order(coalesce(publishedAt, _createdAt) desc){
    _id,
    _type,
    personName,
    role,
    company,
    quote,
    slug,
    isFeatured,
    rating,
    tags,
    publishDate,
    publishedAt,
    avatar{alt, asset->{url}}
  }
}`;

const BLOG_POST_BY_SLUG_QUERY = `
*[_type == "blogPost" && slug.current == $slug][0]{
  _id,
  _type,
  title,
  slug,
  excerpt,
  isFeatured,
  publishedAt,
  publishDate,
  readingTimeMinutes,
  tags,
  body,
  seo{
    metaTitle,
    metaDescription,
    ogTitle,
    ogDescription,
    canonicalUrl,
    noindex,
    nofollow,
    includeInSitemap,
    ogImage{alt, asset->{url}}
  },
  coverImage{alt, asset->{url}},
  resourceUrl,
  resourceFile{asset->{url}}
}`;

const SERVICE_ITEM_BY_SLUG_QUERY = `
*[_type == "serviceItem" && slug.current == $slug][0]{
  _id,
  _type,
  title,
  slug,
  summary,
  body,
  tags,
  isFeatured,
  priceFrom,
  currency,
  seo{
    metaTitle,
    metaDescription,
    ogTitle,
    ogDescription,
    canonicalUrl,
    noindex,
    nofollow,
    includeInSitemap,
    ogImage{alt, asset->{url}}
  },
  heroImage{alt, asset->{url}}
}`;

const TESTIMONIAL_BY_SLUG_QUERY = `
*[_type == "testimonial" && slug.current == $slug][0]{
  _id,
  _type,
  personName,
  role,
  company,
  quote,
  details,
  slug,
  isFeatured,
  rating,
  tags,
  publishDate,
  publishedAt,
  seo{
    metaTitle,
    metaDescription,
    ogTitle,
    ogDescription,
    canonicalUrl,
    noindex,
    nofollow,
    includeInSitemap,
    ogImage{alt, asset->{url}}
  },
  avatar{alt, asset->{url}}
}`;

const SITEMAP_SLUGS_QUERY = `
{
  "sitePages": *[_type == "sitePage" && coalesce(isActive, true) == true]{
    "slug": slug.current,
    "includeInSitemap": coalesce(seo.includeInSitemap, true),
    "_updatedAt": _updatedAt
  },
  "blogPosts": *[_type == "blogPost"]{
    "slug": slug.current,
    "includeInSitemap": coalesce(seo.includeInSitemap, true),
    "_updatedAt": _updatedAt
  },
  "serviceItems": *[_type == "serviceItem"]{
    "slug": slug.current,
    "includeInSitemap": coalesce(seo.includeInSitemap, true),
    "_updatedAt": _updatedAt
  },
  "testimonials": *[_type == "testimonial"]{
    "slug": slug.current,
    "includeInSitemap": coalesce(seo.includeInSitemap, true),
    "_updatedAt": _updatedAt
  }
}`;

export type SitemapQueryResult = {
  sitePages: Array<{ slug?: string; includeInSitemap?: boolean; _updatedAt?: string }>;
  blogPosts: Array<{ slug?: string; includeInSitemap?: boolean; _updatedAt?: string }>;
  serviceItems: Array<{ slug?: string; includeInSitemap?: boolean; _updatedAt?: string }>;
  testimonials: Array<{ slug?: string; includeInSitemap?: boolean; _updatedAt?: string }>;
};

export async function getSiteSettings(preview = false): Promise<SiteSettings | null> {
  return sanityFetch<SiteSettings>(SITE_SETTINGS_QUERY, { preview });
}

export async function getSitePageBySlug(slug: string, preview = false): Promise<SitePage | null> {
  return sanityFetch<SitePage>(SITE_PAGE_BY_SLUG_QUERY, { preview, params: { slug } });
}

export async function getCollectionData(preview = false): Promise<CollectionData> {
  const data = await sanityFetch<CollectionData>(COLLECTION_DATA_QUERY, { preview });
  return {
    blogPosts: data?.blogPosts || [],
    serviceItems: data?.serviceItems || [],
    testimonials: data?.testimonials || [],
  };
}

export async function getBlogPostBySlug(slug: string, preview = false): Promise<BlogPost | null> {
  return sanityFetch<BlogPost>(BLOG_POST_BY_SLUG_QUERY, { preview, params: { slug } });
}

export async function getServiceItemBySlug(slug: string, preview = false): Promise<ServiceItem | null> {
  return sanityFetch<ServiceItem>(SERVICE_ITEM_BY_SLUG_QUERY, { preview, params: { slug } });
}

export async function getTestimonialBySlug(slug: string, preview = false): Promise<Testimonial | null> {
  return sanityFetch<Testimonial>(TESTIMONIAL_BY_SLUG_QUERY, { preview, params: { slug } });
}

export async function getSitemapSlugs(): Promise<SitemapQueryResult> {
  const data = await sanityFetch<SitemapQueryResult>(SITEMAP_SLUGS_QUERY);
  return {
    sitePages: data?.sitePages || [],
    blogPosts: data?.blogPosts || [],
    serviceItems: data?.serviceItems || [],
    testimonials: data?.testimonials || [],
  };
}

export async function getRedirectRules(preview = false): Promise<RedirectRule[]> {
  const data = await sanityFetch<RedirectRule[]>(
    `*[_type == "redirectRule" && enabled == true]{fromPath, toPath, isPermanent, enabled}`,
    { preview }
  );
  return data || [];
}
