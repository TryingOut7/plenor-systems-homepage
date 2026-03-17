import type { Metadata } from 'next';
import Link from 'next/link';
import { draftMode } from 'next/headers';
import { getCollectionData } from '@/sanity/cms';

export const metadata: Metadata = {
  title: 'Testimonials',
  description: 'Read what teams say about working with Plenor Systems.',
  alternates: { canonical: 'https://plenor.ai/testimonials' },
};

export default async function TestimonialsIndexPage() {
  const { isEnabled: preview } = await draftMode();
  const { testimonials } = await getCollectionData(preview);

  return (
    <section style={{ padding: '84px 24px 96px', backgroundColor: '#F8F9FA' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <p className="section-label" style={{ marginBottom: '14px' }}>
          Testimonials
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: 'clamp(36px, 5vw, 56px)',
            color: '#1B2D4F',
            marginBottom: '20px',
          }}
        >
          What Teams Say
        </h1>
        <div style={{ display: 'grid', gap: '14px' }}>
          {testimonials.map((entry, index) => (
            <article key={entry._id || index} className="feature-card">
              <h2 style={{ marginBottom: '4px', fontSize: '24px', color: '#1B2D4F' }}>
                <Link href={`/testimonials/${entry.slug?.current || ''}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {entry.personName}
                </Link>
              </h2>
              <p style={{ color: '#6B7280', marginBottom: '8px' }}>
                {[entry.role, entry.company].filter(Boolean).join(' · ')}
              </p>
              <p style={{ color: '#374151', margin: 0 }}>
                {entry.quote}
              </p>
            </article>
          ))}
          {testimonials.length === 0 ? (
            <p style={{ color: '#6B7280', margin: 0 }}>
              No testimonials yet. Create one in Studio under Collections → Testimonials.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
