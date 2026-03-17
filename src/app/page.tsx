import type { Metadata } from 'next';
import Link from 'next/link';
import { draftMode } from 'next/headers';
import GuideForm from '@/components/GuideForm';
import { sanityFetch } from '@/sanity/client';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Plenor Systems — Testing & QA and Launch & Go-to-Market Framework',
  description:
    'Plenor Systems brings structure to the two most failure-prone stages of product development: Testing & QA and Launch & Go-to-Market.',
  alternates: { canonical: 'https://plenor.ai/' },
  openGraph: {
    title: 'Plenor Systems — Testing & QA and Launch & Go-to-Market Framework',
    description:
      'Plenor Systems brings structure to the two most failure-prone stages of product development: Testing & QA and Launch & Go-to-Market.',
    url: 'https://plenor.ai/',
  },
};

interface HomePageData {
  heroHeading?: string;
  heroSubtext?: string;
  problemHeading?: string;
  problemBody1?: string;
  problemBody2?: string;
  testingCardTitle?: string;
  testingCardBody?: string;
  launchCardTitle?: string;
  launchCardBody?: string;
  audiences?: { label: string; copy: string }[];
  guideCTAHeading?: string;
  guideCTABody?: string;
}

const inner: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto' };

const defaults: Required<HomePageData> = {
  heroHeading: 'Plenor Systems brings structure to the two most failure-prone stages of product development.',
  heroSubtext: 'Testing & QA and Launch & Go-to-Market, done right.',
  problemHeading: 'Most product failures happen at the end, not the beginning.',
  problemBody1: "Teams spend months building a product, then rush testing, skip structured QA, and launch without a clear go-to-market plan. The result: bugs found by customers, positioning that misses the market, and launches that don't generate expected traction.",
  problemBody2: "These aren't execution failures — they're structural ones. The final stages of product development are consistently underprepared. Plenor Systems is built specifically to fix that.",
  testingCardTitle: 'Testing & QA that catches what matters before release.',
  testingCardBody: 'A structured approach to verification, quality criteria, and release readiness. Designed to reduce rework and give your team confidence before shipping.',
  launchCardTitle: 'Launch & Go-to-Market with a plan that holds up on launch day.',
  launchCardBody: 'From positioning and channel selection to operational readiness, the framework keeps go-to-market work structured rather than reactive.',
  audiences: [
    { label: 'Startups', copy: 'Moving fast but need a reliable process for the final stretch — before a launch defines your reputation.' },
    { label: 'SMEs', copy: 'Growing teams that have outpaced informal processes and need structure without slowing down delivery.' },
    { label: 'Enterprises', copy: 'Larger organisations that need a rigorous, repeatable framework that scales across products and teams.' },
  ],
  guideCTAHeading: 'Get the free guide',
  guideCTABody: 'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent to your inbox automatically.',
};

export default async function HomePage() {
  const { isEnabled: preview } = await draftMode();
  const cms = await sanityFetch<HomePageData>(`*[_type == "homePage"][0]`, { preview });
  const d: Required<HomePageData> = {
    ...defaults,
    ...Object.fromEntries(Object.entries(cms ?? {}).filter(([, v]) => v != null)),
  };
  return (
    <>
      {/* Schema markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Plenor Systems',
            url: 'https://plenor.ai',
            sameAs: ['https://www.linkedin.com/company/plenor-ai'],
            contactPoint: {
              '@type': 'ContactPoint',
              email: 'hello@plenor.ai',
              contactType: 'customer service',
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Plenor Systems',
            url: 'https://plenor.ai',
          }),
        }}
      />

      {/* 1. Hero — full navy */}
      <section
        aria-labelledby="hero-heading"
        style={{
          backgroundColor: '#1B2D4F',
          padding: '120px 32px 128px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Geometric background lines */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }} />

        <div style={{ ...inner, position: 'relative', zIndex: 1 }}>
          {/* Eyebrow */}
          <p
            className="section-label animate-fade-in"
            style={{
              color: 'rgba(255,255,255,0.45)',
              marginBottom: '28px',
              letterSpacing: '0.14em',
            }}
          >
            Product Development Framework
          </p>

          <h1
            id="hero-heading"
            className="animate-fade-up"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(40px, 6vw, 72px)',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              marginBottom: '32px',
              maxWidth: '780px',
            }}
          >
            {d.heroHeading}
          </h1>

          <p
            className="animate-fade-up-delay-1"
            style={{
              fontSize: '20px',
              color: 'rgba(255,255,255,0.65)',
              marginBottom: '48px',
              lineHeight: 1.55,
              maxWidth: '520px',
            }}
          >
            {d.heroSubtext}
          </p>

          <div className="animate-fade-up-delay-2">
            <Link href="/contact#guide" className="btn-ghost">
              Get the Free Guide
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Problem Statement */}
      <section
        aria-labelledby="problem-heading"
        style={{ padding: '100px 32px', backgroundColor: '#ffffff' }}
      >
        <div style={{ ...inner, maxWidth: '760px' }}>
          <p className="section-label" style={{ marginBottom: '24px' }}>
            The Problem
          </p>
          <h2
            id="problem-heading"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(30px, 4vw, 44px)',
              fontWeight: 700,
              color: '#1B2D4F',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '28px',
            }}
          >
            {d.problemHeading}
          </h2>

          <div
            style={{
              width: '40px',
              height: '3px',
              backgroundColor: '#1B2D4F',
              marginBottom: '32px',
              borderRadius: '2px',
            }}
            aria-hidden="true"
          />

          <p style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.7, marginBottom: '20px' }}>
            {d.problemBody1}
          </p>
          <p style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.7 }}>
            {d.problemBody2}
          </p>
        </div>
      </section>

      {/* 3. What We Do */}
      <section
        aria-labelledby="what-we-do-heading"
        style={{ padding: '100px 32px', backgroundColor: '#F8F9FA' }}
      >
        <div style={inner}>
          <div style={{ marginBottom: '56px' }}>
            <p className="section-label" style={{ marginBottom: '12px' }}>
              What We Do
            </p>
            <h2
              id="what-we-do-heading"
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: 700,
                color: '#1B2D4F',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
            >
              Two stages. Both critical.
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '28px',
            }}
          >
            {/* Card 1 */}
            <article
              className="feature-card"
              aria-labelledby="card-testing-label"
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: '120px',
                  fontWeight: 700,
                  color: 'rgba(27,45,79,0.05)',
                  lineHeight: 1,
                  userSelect: 'none',
                  letterSpacing: '-0.04em',
                }}
              >
                01
              </span>
              <p
                id="card-testing-label"
                className="section-label"
                style={{ marginBottom: '16px' }}
              >
                Stage 1
              </p>
              <h3
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#1B2D4F',
                  marginBottom: '14px',
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                }}
              >
                {d.testingCardTitle}
              </h3>
              <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65, marginBottom: '24px' }}>
                {d.testingCardBody}
              </p>
              <Link
                href="/services"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#1B2D4F',
                  fontWeight: 600,
                  fontSize: '14px',
                  textDecoration: 'none',
                  letterSpacing: '0.01em',
                }}
                className="card-link"
              >
                How it works
                <span aria-hidden="true">→</span>
              </Link>
            </article>

            {/* Card 2 */}
            <article
              className="feature-card"
              aria-labelledby="card-launch-label"
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: '120px',
                  fontWeight: 700,
                  color: 'rgba(27,45,79,0.05)',
                  lineHeight: 1,
                  userSelect: 'none',
                  letterSpacing: '-0.04em',
                }}
              >
                02
              </span>
              <p
                id="card-launch-label"
                className="section-label"
                style={{ marginBottom: '16px' }}
              >
                Stage 2
              </p>
              <h3
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#1B2D4F',
                  marginBottom: '14px',
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                }}
              >
                {d.launchCardTitle}
              </h3>
              <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65, marginBottom: '24px' }}>
                {d.launchCardBody}
              </p>
              <Link
                href="/services"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#1B2D4F',
                  fontWeight: 600,
                  fontSize: '14px',
                  textDecoration: 'none',
                  letterSpacing: '0.01em',
                }}
                className="card-link"
              >
                How it works
                <span aria-hidden="true">→</span>
              </Link>
            </article>
          </div>
        </div>

        <style>{`
          .card-link { transition: gap 0.2s ease; }
          .card-link:hover { gap: 10px !important; }
        `}</style>
      </section>

      {/* 4. Who It's For */}
      <section
        aria-labelledby="who-heading"
        style={{ padding: '100px 32px', backgroundColor: '#ffffff' }}
      >
        <div style={inner}>
          <div style={{ marginBottom: '56px' }}>
            <p className="section-label" style={{ marginBottom: '12px' }}>
              Who It&apos;s For
            </p>
            <h2
              id="who-heading"
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: 700,
                color: '#1B2D4F',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
            >
              Built for teams at every stage.
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '0',
            }}
          >
            {d.audiences.map(({ label, copy }, i) => (
              <div
                key={label}
                style={{
                  padding: '40px 36px',
                  borderLeft: i === 0 ? '1px solid #E5E7EB' : 'none',
                  borderRight: '1px solid #E5E7EB',
                  borderTop: '3px solid transparent',
                  transition: 'border-top-color 0.2s ease, background-color 0.2s ease',
                }}
                className="who-card"
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-display), Georgia, serif',
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#1B2D4F',
                    marginBottom: '12px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {label}
                </h3>
                <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65 }}>{copy}</p>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .who-card:hover { border-top-color: #1B2D4F !important; background-color: #FAFBFC; }
        `}</style>
      </section>

      {/* 5. Free Guide CTA */}
      <section
        aria-labelledby="guide-cta-heading"
        id="guide"
        style={{ padding: '100px 32px', backgroundColor: '#1B2D4F', position: 'relative', overflow: 'hidden' }}
      >
        {/* Decorative large text background */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '-40px',
            right: '-20px',
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: 'clamp(120px, 18vw, 240px)',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.03)',
            lineHeight: 1,
            userSelect: 'none',
            letterSpacing: '-0.05em',
            pointerEvents: 'none',
          }}
        >
          Guide
        </div>

        <div style={{ ...inner, maxWidth: '640px', position: 'relative', zIndex: 1 }}>
          <p className="section-label" style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>
            Free Resource
          </p>
          <h2
            id="guide-cta-heading"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              marginBottom: '16px',
            }}
          >
            {d.guideCTAHeading}
          </h2>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, marginBottom: '48px' }}>
            <strong style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
              The 7 Most Common Product Development Mistakes — and How to Avoid Them.
            </strong>{' '}
            The guide covers the specific errors teams make in Testing & QA and Launch &
            Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent to
            your inbox automatically.
          </p>

          {/* Light-surface form card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '40px',
            }}
          >
            <GuideForm />
          </div>
        </div>
      </section>
    </>
  );
}
