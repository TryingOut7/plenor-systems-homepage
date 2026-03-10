import type { Metadata } from 'next';
import Link from 'next/link';
import GuideForm from '@/components/GuideForm';

export const metadata: Metadata = {
  title: 'Plenor Systems — Testing & QA and Launch & Go-to-Market Framework',
  description:
    'Plenor Systems brings structure to the two most failure-prone stages of product development: Testing & QA and Launch & Go-to-Market.',
  alternates: { canonical: 'https://plenorsystems.com/' },
  openGraph: {
    title: 'Plenor Systems — Testing & QA and Launch & Go-to-Market Framework',
    description:
      'Plenor Systems brings structure to the two most failure-prone stages of product development: Testing & QA and Launch & Go-to-Market.',
    url: 'https://plenorsystems.com/',
  },
};

const bodyText: React.CSSProperties = { fontSize: '16px', color: '#6B7280', lineHeight: 1.6, margin: 0 };
const h2Style: React.CSSProperties = { fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 700, color: '#1B2D4F', marginBottom: '16px', lineHeight: 1.25 };
const innerStyle: React.CSSProperties = { maxWidth: '1100px', margin: '0 auto' };
const sectionPad: React.CSSProperties = { padding: '80px 24px' };

export default function HomePage() {
  return (
    <>
      {/* Schema markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Plenor Systems',
              url: 'https://plenorsystems.com',
              sameAs: ['https://www.linkedin.com/company/plenorsystems'],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'hello@plenorsystems.com',
                contactType: 'customer service',
              },
            },
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Plenor Systems',
              url: 'https://plenorsystems.com',
            },
          ]),
        }}
      />

      {/* 1. Hero */}
      <section aria-labelledby="hero-heading" style={{ ...sectionPad, backgroundColor: '#F8F9FA' }}>
        <div style={{ ...innerStyle, display: 'flex', flexWrap: 'wrap', gap: '48px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 480px', minWidth: 0 }}>
            <h1
              id="hero-heading"
              style={{
                fontSize: 'clamp(36px, 5vw, 48px)',
                fontWeight: 700,
                color: '#1B2D4F',
                lineHeight: 1.15,
                marginBottom: '20px',
              }}
            >
              Plenor Systems brings structure to the two most failure-prone stages of product
              development.
            </h1>
            <p style={{ fontSize: '20px', color: '#6B7280', marginBottom: '36px', lineHeight: 1.5 }}>
              Testing & QA and Launch & Go-to-Market, done right.
            </p>
            <Link href="/contact#guide" className="btn-primary">
              Get the Free Guide
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Problem Statement */}
      <section aria-labelledby="problem-heading" style={{ ...sectionPad, backgroundColor: '#ffffff' }}>
        <div style={{ ...innerStyle, maxWidth: '720px' }}>
          <h2 id="problem-heading" style={h2Style}>
            Most product failures happen at the end, not the beginning.
          </h2>
          <p style={{ ...bodyText, marginBottom: '16px' }}>
            Teams spend months building a product, then rush testing, skip structured QA, and launch
            without a clear go-to-market plan. The result: bugs found by customers, positioning that
            misses the market, and launches that don&apos;t generate expected traction.
          </p>
          <p style={bodyText}>
            These aren&apos;t execution failures — they&apos;re structural ones. The final stages of
            product development are consistently underprepared. Plenor Systems is built specifically
            to fix that.
          </p>
        </div>
      </section>

      {/* 3. What We Do */}
      <section aria-labelledby="what-we-do-heading" style={{ ...sectionPad, backgroundColor: '#F8F9FA' }}>
        <div style={innerStyle}>
          <h2 id="what-we-do-heading" style={{ ...h2Style, textAlign: 'center', marginBottom: '48px' }}>
            What we do
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            <article className="feature-card" aria-labelledby="card-testing-label">
              <p
                id="card-testing-label"
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#6B7280',
                  marginBottom: '12px',
                }}
              >
                Stage 1
              </p>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1B2D4F', marginBottom: '12px' }}>
                Testing & QA that catches what matters before release.
              </h3>
              <p style={{ ...bodyText, marginBottom: '20px' }}>
                A structured approach to verification, quality criteria, and release readiness.
                Designed to reduce rework and give your team confidence before shipping.
              </p>
              <Link href="/services" style={{ color: '#1B2D4F', fontWeight: 600, fontSize: '14px', textDecoration: 'underline' }}>
                How it works →
              </Link>
            </article>

            <article className="feature-card" aria-labelledby="card-launch-label">
              <p
                id="card-launch-label"
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#6B7280',
                  marginBottom: '12px',
                }}
              >
                Stage 2
              </p>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1B2D4F', marginBottom: '12px' }}>
                Launch & Go-to-Market with a plan that holds up on launch day.
              </h3>
              <p style={{ ...bodyText, marginBottom: '20px' }}>
                From positioning and channel selection to operational readiness, the framework keeps
                go-to-market work structured rather than reactive.
              </p>
              <Link href="/services" style={{ color: '#1B2D4F', fontWeight: 600, fontSize: '14px', textDecoration: 'underline' }}>
                How it works →
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* 4. Who It's For */}
      <section aria-labelledby="who-heading" style={{ ...sectionPad, backgroundColor: '#ffffff' }}>
        <div style={innerStyle}>
          <h2 id="who-heading" style={{ ...h2Style, textAlign: 'center', marginBottom: '48px' }}>
            Who it&apos;s for
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '32px',
            }}
          >
            {[
              {
                label: 'Startups',
                copy: 'Moving fast but need a reliable process for the final stretch — before a launch defines your reputation.',
              },
              {
                label: 'SMEs',
                copy: 'Growing teams that have outpaced informal processes and need structure without slowing down delivery.',
              },
              {
                label: 'Enterprises',
                copy: 'Larger organisations that need a rigorous, repeatable framework that scales across products and teams.',
              },
            ].map(({ label, copy }) => (
              <div key={label}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1B2D4F', marginBottom: '10px' }}>
                  {label}
                </h3>
                <p style={bodyText}>{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Free Guide CTA */}
      <section aria-labelledby="guide-cta-heading" id="guide" style={{ ...sectionPad, backgroundColor: '#F8F9FA' }}>
        <div style={{ ...innerStyle, maxWidth: '600px', textAlign: 'center' }}>
          <h2 id="guide-cta-heading" style={{ ...h2Style, textAlign: 'center' }}>
            Get the free guide
          </h2>
          <p style={{ ...bodyText, marginBottom: '36px' }}>
            <strong style={{ color: '#1A1A1A' }}>
              The 7 Most Common Product Development Mistakes — and How to Avoid Them.
            </strong>{' '}
            The guide covers the specific errors teams make in Testing & QA and Launch &
            Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent to
            your inbox automatically.
          </p>
          <GuideForm />
        </div>
      </section>
    </>
  );
}
