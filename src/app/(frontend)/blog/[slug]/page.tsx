import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import RichText from '@/components/cms/RichText';
import SectionHeading from '@/components/cms/sections/shared/SectionHeading';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { getBlogPostBySlug, getSiteSettings } from '@/payload/cms';
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
  const [post, settings] = await Promise.all([
    getBlogPostBySlug(resolvedParams.slug, cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);

  if (!post) return {};

  const siteUrl = resolveSiteUrl(settings);
  const seo = post.seo || {};
  const defaultSeo = settings?.defaultSeo || {};
  const title = seo.metaTitle || post.title || defaultSeo.metaTitle || 'Blog Post';
  const description = seo.metaDescription || post.excerpt || defaultSeo.metaDescription || '';
  const canonical = seo.canonicalUrl || `${siteUrl}/blog/${resolvedParams.slug}`;
  const ogImage = seo.ogImage?.url || post.coverImage?.url || defaultSeo.ogImage?.url;

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

export default async function BlogPostPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const resolvedParams = await params;
  const cmsReadOptions = await getCmsReadOptions();
  const [post, settings] = await Promise.all([
    getBlogPostBySlug(resolvedParams.slug, cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);

  if (!post) notFound();

  const siteUrl = resolveSiteUrl(settings);
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: 'Home', url: siteUrl },
    { name: 'Blog', url: `${siteUrl}/blog` },
    { name: post.title || 'Post', url: `${siteUrl}/blog/${resolvedParams.slug}` },
  ]);

  const tags = post.tags?.map((t) => t.tag).filter(Boolean) as string[] || [];
  const categoryName = typeof post.category === 'object' && post.category !== null
    ? (post.category as { name?: string }).name
    : undefined;
  const resourceHref = post.resourceUrl || post.resourceFile?.url;
  const resourceCtaLabel = post.resourceUrl ? 'View Resource →' : 'Download Resource →';

  return (
    <article style={{ maxWidth: '840px', margin: '0 auto', padding: '84px 24px 96px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <p className="section-label" style={{ marginBottom: '16px' }}>
        {categoryName || 'Blog'}
      </p>

      <SectionHeading
        tag="h1"
        style={{
          fontSize: 'clamp(32px, 5vw, 54px)',
          color: 'var(--ui-color-primary)',
          lineHeight: 1.08,
          marginBottom: '16px',
        }}
      >
        {post.title}
      </SectionHeading>

      {post.excerpt ? (
        <p
          style={{
            color: 'var(--ui-color-text-muted)',
            fontSize: '18px',
            lineHeight: 1.7,
            marginBottom: '24px',
          }}
        >
          {post.excerpt}
        </p>
      ) : null}

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            marginBottom: '28px',
            color: 'var(--ui-color-text-muted)',
            fontSize: '14px',
          }}
        >
        {post.publishedAt ? (
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        ) : null}
        {post.readingTimeMinutes ? (
          <span>{post.readingTimeMinutes} min read</span>
        ) : null}
      </div>

      {tags.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
          {tags.map((tag) => (
            <span key={tag} className="ui-chip">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {post.coverImage?.url ? (
        <Image
          src={post.coverImage.url}
          alt={post.coverImage.alt || post.title || ''}
          width={(post.coverImage as { width?: number }).width || 840}
          height={(post.coverImage as { height?: number }).height || 440}
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: 'var(--ui-card-radius, 8px)',
            border: '1px solid var(--ui-color-border)',
            marginBottom: '32px',
          }}
        />
      ) : null}

      <RichText data={post.body as SerializedEditorState} style={{ color: 'var(--ui-color-text)' }} />

      {resourceHref ? (
        <div
          style={{
            marginTop: '40px',
            paddingTop: '24px',
            borderTop: '1px solid var(--ui-color-border)',
          }}
        >
          <Link
            href={resourceHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            {resourceCtaLabel}
          </Link>
        </div>
      ) : null}

      <div
        style={{
          marginTop: '48px',
          paddingTop: '24px',
          borderTop: '1px solid var(--ui-color-border)',
        }}
      >
        <Link href="/blog" style={{ color: 'var(--ui-color-text-muted)', fontSize: '14px' }}>
          ← Back to Blog
        </Link>
      </div>
    </article>
  );
}
