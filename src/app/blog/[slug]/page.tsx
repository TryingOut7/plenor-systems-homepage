import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import { getBlogPostBySlug, getSiteSettings } from '@/sanity/cms';

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
  const [post, settings] = await Promise.all([
    getBlogPostBySlug(resolvedParams.slug, preview),
    getSiteSettings(preview),
  ]);

  if (!post) return {};

  const seo = post.seo || {};
  const defaultSeo = settings?.defaultSeo || {};
  const title = seo.metaTitle || post.title || defaultSeo.metaTitle || 'Blog Post';
  const description = seo.metaDescription || post.excerpt || defaultSeo.metaDescription || '';
  const canonical = seo.canonicalUrl || `https://plenor.ai/blog/${resolvedParams.slug}`;
  const ogImage = seo.ogImage?.asset?.url || post.coverImage?.asset?.url || defaultSeo.ogImage?.asset?.url;

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
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const resolvedParams = await params;
  const { isEnabled: preview } = await draftMode();
  const post = await getBlogPostBySlug(resolvedParams.slug, preview);

  if (!post) notFound();

  return (
    <article style={{ maxWidth: '840px', margin: '0 auto', padding: '84px 24px 96px' }}>
      <p className="section-label" style={{ marginBottom: '16px' }}>
        Blog
      </p>
      <h1
        style={{
          fontFamily: 'var(--font-display), Georgia, serif',
          fontSize: 'clamp(36px, 5vw, 58px)',
          lineHeight: 1.08,
          marginBottom: '16px',
          color: '#1B2D4F',
        }}
      >
        {post.title}
      </h1>
      <p style={{ color: '#6B7280', marginBottom: '32px' }}>
        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}{' '}
        {post.readingTimeMinutes ? `· ${post.readingTimeMinutes} min read` : ''}
      </p>

      {post.coverImage?.asset?.url ? (
        <img
          src={post.coverImage.asset.url}
          alt={post.coverImage.alt || post.title || ''}
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            marginBottom: '28px',
          }}
        />
      ) : null}

      {Array.isArray(post.tags) && post.tags.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
          {post.tags.map((tag) => (
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

      {post.excerpt ? (
        <p style={{ color: '#374151', fontSize: '18px', lineHeight: 1.7, marginBottom: '28px' }}>
          {post.excerpt}
        </p>
      ) : null}

      <div style={{ color: '#1F2937' }}>
        <PortableText value={Array.isArray(post.body) ? (post.body as PortableTextBlock[]) : []} />
      </div>

      {(post.resourceUrl || post.resourceFile?.asset?.url) ? (
        <div style={{ marginTop: '32px', padding: '20px', backgroundColor: '#F8F9FA', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '18px', color: '#1B2D4F', marginBottom: '12px' }}>Resources</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {post.resourceUrl ? (
              <a
                href={post.resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}
              >
                External Resource &rarr;
              </a>
            ) : null}
            {post.resourceFile?.asset?.url ? (
              <a
                href={post.resourceFile.asset.url}
                download
                style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}
              >
                Download File &darr;
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}
