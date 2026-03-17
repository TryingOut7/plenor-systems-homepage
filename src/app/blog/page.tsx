import type { Metadata } from 'next';
import Link from 'next/link';
import { draftMode } from 'next/headers';
import { getCollectionData } from '@/sanity/cms';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Latest insights, announcements, and framework updates.',
  alternates: { canonical: 'https://plenor.ai/blog' },
};

export default async function BlogIndexPage() {
  const { isEnabled: preview } = await draftMode();
  const { blogPosts } = await getCollectionData(preview);

  return (
    <section style={{ padding: '84px 24px 96px', backgroundColor: '#ffffff' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <p className="section-label" style={{ marginBottom: '14px' }}>
          Blog
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: 'clamp(36px, 5vw, 56px)',
            color: '#1B2D4F',
            marginBottom: '20px',
          }}
        >
          Latest Articles
        </h1>
        <div style={{ display: 'grid', gap: '14px' }}>
          {blogPosts.map((post, index) => (
            <article key={post._id || index} style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '18px' }}>
              <h2 style={{ marginBottom: '8px', fontSize: '24px', color: '#1B2D4F' }}>
                <Link href={`/blog/${post.slug?.current || ''}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {post.title}
                </Link>
              </h2>
              <p style={{ color: '#6B7280', marginBottom: '8px' }}>{post.excerpt}</p>
              <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft'}
              </p>
            </article>
          ))}
          {blogPosts.length === 0 ? (
            <p style={{ color: '#6B7280', margin: 0 }}>
              No blog posts yet. Create one in Studio under Collections → Blog Posts.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
