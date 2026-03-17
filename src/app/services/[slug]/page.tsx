import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import { getServiceItemBySlug, getSiteSettings } from '@/sanity/cms';

type RouteParams = {
  slug: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const { isEnabled: preview } = await draftMode();
  const [item, settings] = await Promise.all([
    getServiceItemBySlug(resolvedParams.slug, preview),
    getSiteSettings(preview),
  ]);

  if (!item) return {};

  const seo = item.seo || {};
  const defaultSeo = settings?.defaultSeo || {};
  const title = seo.metaTitle || item.title || defaultSeo.metaTitle || 'Service';
  const description = seo.metaDescription || item.summary || defaultSeo.metaDescription || '';
  const canonical = seo.canonicalUrl || `https://plenor.ai/services/${resolvedParams.slug}`;
  const ogImage = seo.ogImage?.asset?.url || item.heroImage?.asset?.url || defaultSeo.ogImage?.asset?.url;

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
  const { isEnabled: preview } = await draftMode();
  const item = await getServiceItemBySlug(resolvedParams.slug, preview);
  if (!item) notFound();

  return (
    <article style={{ maxWidth: '900px', margin: '0 auto', padding: '84px 24px 96px' }}>
      <p className="section-label" style={{ marginBottom: '16px' }}>
        Service
      </p>
      <h1
        style={{
          fontFamily: 'var(--font-display), Georgia, serif',
          fontSize: 'clamp(36px, 5vw, 58px)',
          color: '#1B2D4F',
          lineHeight: 1.08,
          marginBottom: '20px',
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

      {item.heroImage?.asset?.url ? (
        <img
          src={item.heroImage.asset.url}
          alt={item.heroImage.alt || item.title || ''}
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            marginBottom: '28px',
          }}
        />
      ) : null}

      <div style={{ color: '#1F2937' }}>
        <PortableText value={Array.isArray(item.body) ? (item.body as PortableTextBlock[]) : []} />
      </div>
    </article>
  );
}
