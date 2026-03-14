import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — Who We Are and Why We Built This',
  description:
    'Plenor Systems was built to address the two stages of product development most likely to cause failure: Testing & QA and Launch & Go-to-Market.',
  alternates: { canonical: 'https://plenor.ai/about' },
  openGraph: {
    title: 'About Plenor Systems',
    description:
      'Plenor Systems was built to address the two stages of product development most likely to cause failure: Testing & QA and Launch & Go-to-Market.',
    url: 'https://plenor.ai/about',
  },
};

const inner: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto' };
const narrow: React.CSSProperties = { maxWidth: '760px', margin: '0 auto' };

export default function AboutPage() {
  return (
    <>
      {/* 1. Who We Are */}
      <section
        aria-labelledby="about-hero-heading"
        style={{
          backgroundColor: '#1B2D4F',
          padding: '100px 32px 108px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
        <div style={{ ...narrow, position: 'relative', zIndex: 1 }}>
          <p className="section-label animate-fade-in" style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '24px' }}>
            About
          </p>
          <h1
            id="about-hero-heading"
            className="animate-fade-up"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(36px, 5.5vw, 60px)',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '32px',
            }}
          >
            Who we are
          </h1>
          <p className="animate-fade-up-delay-1" style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: '20px' }}>
            Plenor Systems is a product development framework built around a specific observation:
            the stages most likely to cause a launch to fail are Testing & QA and Go-to-Market —
            and they&apos;re consistently the least structured.
          </p>
          <p className="animate-fade-up-delay-2" style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: '20px' }}>
            Most frameworks cover the full development lifecycle. Plenor Systems covers only the
            final two stages — not because the others don&apos;t matter, but because these two are
            where structure is most absent and most needed.
          </p>
          <p className="animate-fade-up-delay-2" style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
            The framework is used by teams ranging from early-stage startups to enterprise product
            groups who need a repeatable, structured process for the stretch of work between build
            completion and a successful launch.
          </p>
        </div>
      </section>

      {/* 2. Our Focus */}
      <section
        aria-labelledby="focus-heading"
        style={{ padding: '100px 32px', backgroundColor: '#ffffff' }}
      >
        <div style={narrow}>
          <p className="section-label" style={{ marginBottom: '16px' }}>Our Focus</p>
          <h2
            id="focus-heading"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(26px, 3.5vw, 38px)',
              fontWeight: 700,
              color: '#1B2D4F',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              marginBottom: '20px',
            }}
          >
            Narrow by design. Deep by necessity.
          </h2>
          <div style={{ width: '40px', height: '3px', backgroundColor: '#1B2D4F', marginBottom: '32px', borderRadius: '2px' }} aria-hidden="true" />
          <p style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.7, marginBottom: '20px' }}>
            Plenor Systems covers two stages: Testing & QA and Launch & Go-to-Market. That scope is
            intentional.
          </p>
          <p style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.7, marginBottom: '20px' }}>
            Narrowing to two stages means the framework goes deep rather than broad. Each module is
            specific — built from observed patterns of what goes wrong and why. It is not a general
            project management tool dressed as a product framework.
          </p>
          <p style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.7, marginBottom: '36px' }}>
            The narrow focus is a strength, not a limitation. Teams get a framework that is actually
            applicable to the work at hand, not a set of generic principles that need extensive
            interpretation.
          </p>
          <Link
            href="/services"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#1B2D4F',
              fontWeight: 600,
              fontSize: '15px',
              textDecoration: 'none',
            }}
            className="text-link"
          >
            See how the two stages work →
          </Link>
        </div>
      </section>

      {/* 3. Mission Statement — full-bleed quote */}
      <section
        aria-labelledby="mission-heading"
        style={{
          padding: '100px 32px',
          backgroundColor: '#F8F9FA',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Oversized decorative quotation mark */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-20px',
            left: '20px',
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: 'clamp(160px, 24vw, 320px)',
            fontWeight: 700,
            color: 'rgba(27,45,79,0.05)',
            lineHeight: 1,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          &ldquo;
        </div>
        <div style={{ ...narrow, position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <p className="section-label" style={{ marginBottom: '32px' }}>What we believe</p>
          <h2
            id="mission-heading"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(24px, 3.5vw, 36px)',
              fontWeight: 700,
              color: '#1B2D4F',
              lineHeight: 1.35,
              letterSpacing: '-0.02em',
              fontStyle: 'italic',
              maxWidth: '640px',
              margin: '0 auto',
            }}
          >
            A well-built product deserves a structured path to market — and consistent quality
            standards before it gets there.
          </h2>
        </div>
      </section>

      {/* 4. Team / Founder */}
      <section
        aria-labelledby="team-heading"
        style={{ padding: '100px 32px', backgroundColor: '#ffffff' }}
      >
        <div style={narrow}>
          <p className="section-label" style={{ marginBottom: '16px' }}>The Team</p>
          <h2
            id="team-heading"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(26px, 3.5vw, 38px)',
              fontWeight: 700,
              color: '#1B2D4F',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              marginBottom: '40px',
            }}
          >
            The people behind the framework.
          </h2>

          <div
            style={{
              display: 'flex',
              gap: '28px',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              padding: '36px',
              border: '1px solid #E5E7EB',
              borderTop: '3px solid #1B2D4F',
              borderRadius: '4px',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#E5E7EB',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-hidden="true"
            >
              <svg width="26" height="26" fill="none" stroke="#6B7280" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: '#1A1A1A',
                  letterSpacing: '-0.01em',
                  marginBottom: '4px',
                }}
              >
                [Founder Name]
              </p>
              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px', letterSpacing: '0.02em' }}>
                [Role] · Plenor Systems
              </p>
              <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65 }}>
                [One-line background — update this via the CMS before going live.]
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA */}
      <section
        aria-labelledby="about-cta-heading"
        style={{ padding: '100px 32px', backgroundColor: '#1B2D4F', position: 'relative', overflow: 'hidden' }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
        <div style={{ ...inner, maxWidth: '600px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2
            id="about-cta-heading"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(26px, 4vw, 38px)',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '16px',
            }}
          >
            Want to work together?
          </h2>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, marginBottom: '36px' }}>
            Get in touch to discuss your product and team, or start with the free guide.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/contact" className="btn-ghost">
              Get in touch
            </Link>
            <Link
              href="/contact#guide"
              style={{
                display: 'inline-block',
                color: 'rgba(255,255,255,0.75)',
                fontSize: '15px',
                fontWeight: 600,
                textDecoration: 'none',
                padding: '14px 32px',
                border: '1.5px solid rgba(255,255,255,0.3)',
                borderRadius: '4px',
                transition: 'color 0.2s ease, border-color 0.2s ease',
              }}
              className="ghost-outline"
            >
              Get the free guide
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .text-link:hover { opacity: 0.75; }
        .ghost-outline:hover { color: #ffffff !important; border-color: rgba(255,255,255,0.6) !important; }
      `}</style>
    </>
  );
}
