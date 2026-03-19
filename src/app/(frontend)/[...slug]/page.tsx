import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 60;
import UniversalSections from '@/components/cms/UniversalSections';
import { getCollectionData, getSitePageBySlug, getSiteSettings } from '@/payload/cms';

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
  if (!slug) return {};

  const [page, settings] = await Promise.all([
    getSitePageBySlug(slug),
    getSiteSettings(),
  ]);

  if (!page) return {};

  const seo = page.seo || {};
  const defaultSeo = settings?.defaultSeo || {};
  const title = seo.metaTitle || page.title || defaultSeo.metaTitle || settings?.siteName || 'Page';
  const description = seo.metaDescription || defaultSeo.metaDescription || settings?.brandTagline || '';
  const canonical = seo.canonicalUrl || canonicalForSlug(slug);
  const ogImage = seo.ogImage?.url || defaultSeo.ogImage?.url;

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

  const [page, collectionData, siteSettings] = await Promise.all([
    getSitePageBySlug(slug),
    getCollectionData(),
    getSiteSettings(),
  ]);

  if (!page || !Array.isArray(page.sections) || page.sections.length === 0) {
    notFound();
  }

  return (
    <UniversalSections
      documentId={page.id || 'sitePage'}
      documentType="site-pages"
      sections={page.sections}
      collections={collectionData}
      guideFormLabels={siteSettings?.guideForm}
      inquiryFormLabels={siteSettings?.inquiryForm}
    />
  );
}
