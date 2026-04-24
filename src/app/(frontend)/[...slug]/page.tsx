import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageChromeOverrides from '@/components/PageChromeOverrides';
import UniversalSections from '@/components/cms/UniversalSections';
import { getCollectionData, getSitePageBySlug, getSiteSettings } from '@/payload/cms';
import { buildBreadcrumbJsonLd } from '@/lib/breadcrumbs';
import { buildSitePageMetadata } from '@/lib/page-metadata';
import { resolveSiteUrl } from '@/lib/site-config';
import { getCmsReadOptions } from '@/lib/cms-read-options';

export const revalidate = 60;

type RouteParams = {
  slug?: string[];
};

/** Paths handled by other route groups (e.g. Payload admin). */
const RESERVED_PREFIXES = ['admin', 'admin-diagnostics'];

function buildSlug(params: RouteParams): string {
  return params.slug?.join('/') || '';
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = buildSlug(resolvedParams);
  if (!slug || RESERVED_PREFIXES.includes(resolvedParams.slug?.[0] ?? '')) return {};

  const cmsReadOptions = await getCmsReadOptions();
  const [page, settings] = await Promise.all([
    getSitePageBySlug(slug, cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);

  if (!page) return {};

  return buildSitePageMetadata({
    slug,
    page,
    settings,
    fallbackTitle: 'Page',
    fallbackDescription: settings?.brandTagline,
  });
}

export default async function CmsDynamicPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const resolvedParams = await params;
  const slug = buildSlug(resolvedParams);
  if (!slug || RESERVED_PREFIXES.includes(resolvedParams.slug?.[0] ?? '')) notFound();

  const cmsReadOptions = await getCmsReadOptions();
  const [page, collectionData, siteSettings] = await Promise.all([
    getSitePageBySlug(slug, cmsReadOptions),
    getCollectionData(cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);

  if (!page || !Array.isArray(page.sections) || page.sections.length === 0) {
    notFound();
  }

  const siteUrl = resolveSiteUrl(siteSettings);
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

  const webpageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.seo?.metaDescription || siteSettings?.defaultMetaDescription || undefined,
    url: `${siteUrl}${path}`,
  };

  return (
    <>
      <PageChromeOverrides page={page} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }}
      />
      <UniversalSections
        sections={page.sections}
        collections={collectionData}
        guideFormLabels={siteSettings?.guideForm}
        inquiryFormLabels={siteSettings?.inquiryForm}
        pageSlug={slug}
      />
    </>
  );
}
