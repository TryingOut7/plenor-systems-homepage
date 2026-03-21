import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 60;
import UniversalSections from '@/components/cms/UniversalSections';
import { getCollectionData, getSitePageBySlug, getSiteSettings } from '@/payload/cms';
import { buildBreadcrumbJsonLd } from '@/lib/breadcrumbs';

type RouteParams = {
  slug?: string[];
};

/** Paths handled by other route groups (e.g. Payload admin). */
const RESERVED_PREFIXES = ['admin', 'admin-diagnostics'];

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
  if (!slug || RESERVED_PREFIXES.includes(resolvedParams.slug?.[0] ?? '')) return {};

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

  // Build hreflang alternates from CMS locale data
  const languages: Record<string, string> = {};
  if (page.alternateLocales?.length) {
    for (const alt of page.alternateLocales) {
      if (alt.locale && alt.url) {
        languages[alt.locale] = alt.url;
      }
    }
  }
  // Add x-default pointing to canonical
  if (Object.keys(languages).length > 0) {
    languages['x-default'] = canonical;
  }

  return {
    title,
    description,
    alternates: {
      canonical,
      ...(Object.keys(languages).length > 0 ? { languages } : {}),
    },
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
  if (!slug || RESERVED_PREFIXES.includes(resolvedParams.slug?.[0] ?? '')) notFound();

  const [page, collectionData, siteSettings] = await Promise.all([
    getSitePageBySlug(slug),
    getCollectionData(),
    getSiteSettings(),
  ]);

  if (!page || !Array.isArray(page.sections) || page.sections.length === 0) {
    notFound();
  }

  const siteUrl = siteSettings?.siteUrl || 'https://plenor.ai';
  const segments = slug.split('/');
  const breadcrumbItems = [{ name: 'Home', url: siteUrl }];
  let path = '';
  for (const segment of segments) {
    path += `/${segment}`;
    breadcrumbItems.push({
      name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      url: `${siteUrl}${path}`,
    });
  }
  // Use the page title for the last breadcrumb
  breadcrumbItems[breadcrumbItems.length - 1].name = page.title || breadcrumbItems[breadcrumbItems.length - 1].name;
  const breadcrumbs = buildBreadcrumbJsonLd(breadcrumbItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <UniversalSections
        documentId={page.id || 'sitePage'}
        documentType="site-pages"
        sections={page.sections}
        collections={collectionData}
        guideFormLabels={siteSettings?.guideForm}
        inquiryFormLabels={siteSettings?.inquiryForm}
      />
    </>
  );
}
