import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import { getSiteSettings, getTestimonialBySlug } from '@/sanity/cms';

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
    getTestimonialBySlug(resolvedParams.slug, preview),
    getSiteSettings(preview),
  ]);

  if (!item) return {};

  const seo = item.seo || {};
  const defaultSeo = settings?.defaultSeo || {};
  const title =
    seo.metaTitle ||
    item.personName ||
    defaultSeo.metaTitle ||
    'Testimonial';
  const description = seo.metaDescription || item.quote || defaultSeo.metaDescription || '';
  const canonical = seo.canonicalUrl || `https://plenor.ai/testimonials/${resolvedParams.slug}`;
  const ogImage = seo.ogImage?.asset?.url || item.avatar?.asset?.url || defaultSeo.ogImage?.asset?.url;

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

export default async function TestimonialPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const resolvedParams = await params;
  const { isEnabled: preview } = await draftMode();
  const item = await getTestimonialBySlug(resolvedParams.slug, preview);
  if (!item) notFound();

  return (
    <article style={{ maxWidth: '840px', margin: '0 auto', padding: '84px 24px 96px' }}>
      <p className="section-label" style={{ marginBottom: '16px' }}>
        Testimonial
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
        {item.personName}
      </h1>
      <p style={{ color: '#6B7280', marginBottom: '24px' }}>
        {[item.role, item.company].filter(Boolean).join(' · ')}
      </p>
      {item.avatar?.asset?.url ? (
        <img
          src={item.avatar.asset.url}
          alt={item.avatar.alt || item.personName || ''}
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '9999px',
            objectFit: 'cover',
            border: '1px solid #E5E7EB',
            marginBottom: '20px',
          }}
        />
      ) : null}
      {item.quote ? (
        <blockquote
          style={{
            margin: '0 0 24px',
            fontSize: '22px',
            lineHeight: 1.5,
            color: '#374151',
            fontFamily: 'var(--font-display), Georgia, serif',
          }}
        >
          “{item.quote}”
        </blockquote>
      ) : null}
      <div style={{ color: '#1F2937' }}>
        <PortableText value={Array.isArray(item.details) ? (item.details as PortableTextBlock[]) : []} />
      </div>
    </article>
  );
}
