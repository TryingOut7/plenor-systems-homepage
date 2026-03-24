import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import RichText from '@/components/cms/RichText';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { getServiceItemBySlug, getSiteSettings } from '@/payload/cms';
import { buildBreadcrumbJsonLd } from '@/lib/breadcrumbs';
import { resolveSiteUrl } from '@/lib/site-config';

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
  const [item, settings] = await Promise.all([
    getServiceItemBySlug(resolvedParams.slug),
    getSiteSettings(),
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
  const [item, settings] = await Promise.all([
    getServiceItemBySlug(resolvedParams.slug),
    getSiteSettings(),
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
      <h1
        style={{
          fontFamily: 'var(--font-display), Georgia, serif',
          fontSize: 'clamp(36px, 5vw, 58px)',
          color: '#1B2D4F',
          lineHeight: 1.08,
          marginBottom: '16px',
        }}
      >
        {item.title}
      </h1>
      {item.summary ? (
        <p style={{ color: '#374151', fontSize: '18px', lineHeight: 1.7, marginBottom: '24px' }}>
          {item.summary}
        </p>
      ) : null}
      {typeof item.priceFrom === 'number' ? (
        <p style={{ color: '#6B7280', marginBottom: '24px' }}>
          Starting from {item.currency || 'USD'} {item.priceFrom}
        </p>
      ) : null}

      {tags.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
          {tags.map((tag) => (
            <span
              key={tag}
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#1B2D4F',
                backgroundColor: '#F3F4F6',
                borderRadius: '4px',
                letterSpacing: '0.02em',
              }}
            >
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
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            marginBottom: '28px',
          }}
        />
      ) : null}

      <RichText data={item.body as SerializedEditorState} style={{ color: '#1F2937' }} />
    </article>
  );
}
