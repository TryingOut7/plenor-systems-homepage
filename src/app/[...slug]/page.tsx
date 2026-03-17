import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import UniversalSections from '@/components/cms/UniversalSections';
import { getCollectionData, getSitePageBySlug, getSiteSettings } from '@/sanity/cms';

type RouteParams = {
  slug?: string[];
};

function buildSlug(params: RouteParams): string {
  return params.slug?.join('/') || '';
}

function canonicalForSlug(slug: string): string {
  return `https://plenor.ai/${slug.replace(/^\/+/, '')}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = buildSlug(resolvedParams);
  if (!slug) {
    return {};
  }

  const { isEnabled: preview } = await draftMode();
  const [page, settings] = await Promise.all([
    getSitePageBySlug(slug, preview),
    getSiteSettings(preview),
  ]);

  if (!page) return {};

  const seo = page.seo || {};
  const defaultSeo = settings?.defaultSeo || {};
  const title = seo.metaTitle || page.title || defaultSeo.metaTitle || settings?.siteName || 'Page';
  const description = seo.metaDescription || defaultSeo.metaDescription || settings?.brandTagline || '';
  const canonical = seo.canonicalUrl || canonicalForSlug(slug);
  const ogImage = seo.ogImage?.asset?.url || defaultSeo.ogImage?.asset?.url;

  return {
    title,
    description,
    alternates: { canonical },
    robots: {
      index: !seo.noindex,
      follow: !seo.nofollow,
    },
    openGraph: {
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      url: canonical,
      images: ogImage ? [{ url: ogImage, alt: seo.ogImage?.alt || defaultSeo.ogImage?.alt || title }] : undefined,
    },
  };
}

export default async function CmsDynamicPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const resolvedParams = await params;
  const slug = buildSlug(resolvedParams);
  if (!slug) notFound();

  const { isEnabled: preview } = await draftMode();
  const [page, collectionData] = await Promise.all([
    getSitePageBySlug(slug, preview),
    getCollectionData(preview),
  ]);

  if (!page || !Array.isArray(page.sections) || page.sections.length === 0) {
    notFound();
  }

  return (
    <UniversalSections
      documentId={page._id || 'sitePage'}
      documentType={page._type || 'sitePage'}
      sections={page.sections}
      collections={collectionData}
    />
  );
}
