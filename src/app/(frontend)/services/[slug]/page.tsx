import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import RichText from '@/components/cms/RichText';
import SectionHeading from '@/components/cms/sections/shared/SectionHeading';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { getServiceItemBySlug, getSiteSettings } from '@/payload/cms';
import { buildBreadcrumbJsonLd } from '@/lib/breadcrumbs';
import { resolveSiteUrl } from '@/lib/site-config';
import { getCmsReadOptions } from '@/lib/cms-read-options';

export const revalidate = 60;

type RouteParams = {
  slug: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const cmsReadOptions = await getCmsReadOptions();
  const [item, settings] = await Promise.all([
    getServiceItemBySlug(resolvedParams.slug, cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);

  if (!item) return {};

  const siteUrl = resolveSiteUrl(settings);
  const seo = item.seo || {};
  const defaultSeo = settings?.defaultSeo || {};
  const title = seo.metaTitle || item.title || defaultSeo.metaTitle || 'Service';
  const description = seo.metaDescription || item.summary || defaultSeo.metaDescription || '';
  const canonical = seo.canonicalUrl || `${siteUrl}/services/${resolvedParams.slug}`;
  const ogImage = seo.ogImage?.url || item.heroImage?.url || defaultSeo.ogImage?.url;

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: !seo.noindex, follow: !seo.nofollow },
    openGraph: {
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function ServiceItemPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const resolvedParams = await params;
  const cmsReadOptions = await getCmsReadOptions();
  const [item, settings] = await Promise.all([
    getServiceItemBySlug(resolvedParams.slug, cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);
  if (!item) notFound();

  const siteUrl = resolveSiteUrl(settings);
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: 'Home', url: siteUrl },
    { name: 'Services', url: `${siteUrl}/services` },
    { name: item.title || 'Service', url: `${siteUrl}/services/${resolvedParams.slug}` },
  ]);

  const tags = item.tags?.map((t) => t.tag).filter(Boolean) as string[] || [];

  return (
    <article style={{ maxWidth: '840px', margin: '0 auto', padding: '84px 24px 96px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <p className="section-label" style={{ marginBottom: '16px' }}>
        Service
      </p>
      <SectionHeading
        tag="h1"
        style={{
          fontSize: 'clamp(34px, 5vw, 54px)',
          color: 'var(--ui-color-primary)',
          lineHeight: 1.08,
          marginBottom: '16px',
        }}
      >
        {item.title}
      </SectionHeading>
      {item.summary ? (
        <p
          style={{
            color: 'var(--ui-color-text-muted)',
            fontSize: '18px',
            lineHeight: 1.7,
            marginBottom: '24px',
          }}
        >
          {item.summary}
        </p>
      ) : null}
      {typeof item.priceFrom === 'number' ? (
        <p style={{ color: 'var(--ui-color-text-muted)', marginBottom: '24px' }}>
          Starting from {item.currency || 'USD'} {item.priceFrom}
        </p>
      ) : null}

      {tags.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
          {tags.map((tag) => (
            <span key={tag} className="ui-chip">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {item.heroImage?.url ? (
        <Image
          src={item.heroImage.url}
          alt={item.heroImage.alt || item.title || ''}
          width={0}
          height={0}
          sizes="100vw"
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: 'var(--ui-card-radius, 8px)',
            border: '1px solid var(--ui-color-border)',
            marginBottom: '28px',
          }}
        />
      ) : null}

      <RichText data={item.body as SerializedEditorState} style={{ color: 'var(--ui-color-text)' }} />
    </article>
  );
}
