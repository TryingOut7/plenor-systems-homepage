import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getCollectionData, getSiteSettings } from '@/payload/cms';
import { buildSitePageMetadata } from '@/lib/page-metadata';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import type { BlogPost } from '@/payload/cms';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const cmsReadOptions = await getCmsReadOptions();
  const settings = await getSiteSettings(cmsReadOptions);
  return buildSitePageMetadata({
    slug: 'blog',
    settings,
    fallbackTitle: 'Blog',
    fallbackDescription: settings?.brandTagline,
  });
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; category?: string }>;
}) {
  const cmsReadOptions = await getCmsReadOptions();
  const resolvedParams = await searchParams;
  const activeTag = resolvedParams.tag?.trim().toLowerCase();
  const activeCategory = resolvedParams.category?.trim().toLowerCase();

  const [collectionData] = await Promise.all([
    getCollectionData(cmsReadOptions),
  ]);

  const allPosts = collectionData.blogPosts;

  const posts = allPosts.filter((post: BlogPost) => {
    if (activeTag) {
      const hasTag = post.tags?.some(
        (t) => (t.tag ?? '').toLowerCase() === activeTag,
      );
      if (!hasTag) return false;
    }
    if (activeCategory) {
      const catName =
        typeof post.category === 'object' && post.category !== null
          ? ((post.category as { name?: string }).name ?? '').toLowerCase()
          : '';
      const catSlug =
        typeof post.category === 'object' && post.category !== null
          ? ((post.category as { slug?: string }).slug ?? '').toLowerCase()
          : '';
      if (catName !== activeCategory && catSlug !== activeCategory) return false;
    }
    return true;
  });

  // Collect all unique tags for the filter bar.
  const allTags = [...new Set(
    allPosts.flatMap((p: BlogPost) => p.tags?.map((t) => t.tag ?? '').filter(Boolean) ?? []),
  )].sort() as string[];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '84px 24px 96px' }}>
      <p className="section-label" style={{ marginBottom: '16px' }}>Blog</p>
      <h1
        style={{
          fontFamily: 'var(--font-display), Georgia, serif',
          fontSize: 'clamp(32px, 5vw, 54px)',
          color: 'var(--ui-color-primary)',
          lineHeight: 1.08,
          marginBottom: '32px',
        }}
      >
        {activeTag ? `Posts tagged "${activeTag}"` : 'Latest Posts'}
      </h1>

      {allTags.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '40px' }}>
          <Link
            href="/blog"
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '4px',
              textDecoration: 'none',
              backgroundColor: !activeTag ? '#1B2D4F' : '#F3F4F6',
              color: !activeTag ? '#fff' : '#1B2D4F',
            }}
          >
            All
          </Link>
          {allTags.map((tag) => (
            <Link
              key={tag}
              href={`/blog?tag=${encodeURIComponent(tag)}`}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '4px',
                textDecoration: 'none',
                backgroundColor: activeTag === tag.toLowerCase() ? '#1B2D4F' : '#F3F4F6',
                color: activeTag === tag.toLowerCase() ? '#fff' : '#1B2D4F',
              }}
            >
              {tag}
            </Link>
          ))}
        </div>
      ) : null}

      {posts.length === 0 ? (
        <p style={{ color: '#6B7280' }}>No posts published yet.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '32px',
          }}
        >
          {posts.map((post) => {
            const resourceHref = post.resourceUrl || post.resourceFile?.url;
            const href = resourceHref || `/blog/${post.slug || ''}`;
            const isExternal = !!resourceHref;
            const ctaLabel = post.resourceUrl
              ? 'View Resource →'
              : post.resourceFile?.url
                ? 'Download Resource →'
                : 'Read more →';
            return (
              <article key={post.id} className="feature-card" style={{ display: 'flex', flexDirection: 'column' }}>
                {post.coverImage?.url ? (
                  <div
                    className="feature-card-media"
                    style={{
                      height: '200px',
                      borderRadius: '6px 6px 0 0',
                      marginBottom: '16px',
                    }}
                  >
                    <Image
                      src={post.coverImage.url}
                      alt={post.coverImage.alt || post.title || ''}
                      width={(post.coverImage as { width?: number }).width || 560}
                      height={(post.coverImage as { height?: number }).height || 280}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                ) : null}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h2 style={{ fontSize: '20px', color: 'var(--ui-color-primary)', margin: 0 }}>
                    {post.title}
                  </h2>
                  {post.excerpt ? (
                    <p style={{ color: '#374151', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
                      {post.excerpt}
                    </p>
                  ) : null}
                  <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                    <Link
                      href={href}
                      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      style={{ color: 'var(--ui-color-primary)', fontWeight: 600, fontSize: '14px' }}
                    >
                      {ctaLabel}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
