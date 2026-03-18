import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RichText from '@/components/cms/RichText';
import { getSiteSettings, getTestimonialBySlug } from '@/payload/cms';

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
    getTestimonialBySlug(resolvedParams.slug),
    getSiteSettings(),
  ]);

  if (!item) return {};

  const seo = item.seo || {};
  const defaultSeo = settings?.defaultSeo || {};
  const title = seo.metaTitle || item.personName || defaultSeo.metaTitle || 'Testimonial';
  const description = seo.metaDescription || item.quote || defaultSeo.metaDescription || '';
  const canonical = seo.canonicalUrl || `https://plenor.ai/testimonials/${resolvedParams.slug}`;
  const ogImage = seo.ogImage?.url || item.avatar?.url || defaultSeo.ogImage?.url;

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
  const item = await getTestimonialBySlug(resolvedParams.slug);
  if (!item) notFound();

  const tags = item.tags?.map((t) => t.tag).filter(Boolean) as string[] || [];

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
      {item.avatar?.url ? (
        <img
          src={item.avatar.url}
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
      {typeof item.rating === 'number' && item.rating > 0 ? (
        <p style={{ fontSize: '20px', marginBottom: '20px', letterSpacing: '2px' }} aria-label={`Rating: ${item.rating} out of 5 stars`}>
          {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
        </p>
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
          &ldquo;{item.quote}&rdquo;
        </blockquote>
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

      <RichText data={item.details as any} style={{ color: '#1F2937' }} />
    </article>
  );
}
