import type { Metadata } from 'next';
import type { SeoFields, SitePage, SiteSettings } from '@/payload/cms';
import { resolveSiteUrl } from '@/lib/site-config';

type MetadataPage = Pick<SitePage, 'title' | 'seo'>;

export type BuildSitePageMetadataInput = {
  slug: string;
  settings: SiteSettings | null | undefined;
  page?: MetadataPage | null;
  fallbackTitle: string;
  fallbackDescription?: string;
  fallbackNoindex?: boolean;
  fallbackNofollow?: boolean;
};

function asNonEmptyString(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function canonicalForSlug(baseUrl: string, slug: string): string {
  const normalized = slug.replace(/^\/+|\/+$/g, '');
  return normalized ? `${baseUrl}/${normalized}` : `${baseUrl}/`;
}

export function buildSitePageMetadata(input: BuildSitePageMetadataInput): Metadata {
  const { slug, settings, page, fallbackTitle, fallbackDescription } = input;
  const seo: SeoFields = page?.seo || {};
  const defaultSeo: SeoFields = settings?.defaultSeo || {};

  const siteUrl = resolveSiteUrl(settings);
  const title =
    asNonEmptyString(seo.metaTitle) ||
    asNonEmptyString(page?.title) ||
    asNonEmptyString(defaultSeo.metaTitle) ||
    fallbackTitle;
  const description =
    asNonEmptyString(seo.metaDescription) ||
    asNonEmptyString(defaultSeo.metaDescription) ||
    asNonEmptyString(fallbackDescription) ||
    asNonEmptyString(settings?.brandTagline);
  const canonical =
    asNonEmptyString(seo.canonicalUrl) || canonicalForSlug(siteUrl, slug);
  const ogTitle = asNonEmptyString(seo.ogTitle) || title;
  const ogDescription = asNonEmptyString(seo.ogDescription) || description;
  const ogImageUrl =
    asNonEmptyString(seo.ogImage?.url) || asNonEmptyString(defaultSeo.ogImage?.url);
  const ogImageAlt =
    asNonEmptyString(seo.ogImage?.alt) ||
    asNonEmptyString(defaultSeo.ogImage?.alt) ||
    title;
  const noindex = seo.noindex ?? input.fallbackNoindex ?? false;
  const nofollow = seo.nofollow ?? input.fallbackNofollow ?? false;

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: !noindex, follow: !nofollow },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      images: ogImageUrl ? [{ url: ogImageUrl, alt: ogImageAlt }] : undefined,
    },
  };
}
