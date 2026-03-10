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

const bodyText: React.CSSProperties = { fontSize: '16px', color: '#6B7280', lineHeight: 1.6, margin: 0 };
const h2Style: React.CSSProperties = { fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700, color: '#1B2D4F', marginBottom: '16px', lineHeight: 1.25 };
const innerStyle: React.CSSProperties = { maxWidth: '720px', margin: '0 auto' };
const sectionPad: React.CSSProperties = { padding: '80px 24px' };

export default function AboutPage() {
  return (
    <>
      {/* 1. Who We Are */}
      <section aria-labelledby="about-hero-heading" style={{ ...sectionPad, backgroundColor: '#F8F9FA' }}>
        <div style={innerStyle}>
          <h1
            id="about-hero-heading"
            style={{
              fontSize: 'clamp(36px, 5vw, 48px)',
              fontWeight: 700,
              color: '#1B2D4F',
              lineHeight: 1.15,
              marginBottom: '24px',
            }}
          >
            Who we are
          </h1>
          <p style={{ ...bodyText, marginBottom: '16px' }}>
            Plenor Systems is a product development framework built around a specific observation:
            the stages most likely to cause a launch to fail are Testing & QA and Go-to-Market —
            and they&apos;re consistently the least structured.
          </p>
          <p style={{ ...bodyText, marginBottom: '16px' }}>
            Most frameworks cover the full development lifecycle. Plenor Systems covers only the
            final two stages — not because the others don&apos;t matter, but because these two are
            where structure is most absent and most needed.
          </p>
          <p style={bodyText}>
            The framework is used by teams ranging from early-stage startups to enterprise product
            groups who need a repeatable, structured process for the stretch of work between build
            completion and a successful launch.
          </p>
        </div>
      </section>

      {/* 2. Our Focus */}
      <section aria-labelledby="focus-heading" style={{ ...sectionPad, backgroundColor: '#ffffff' }}>
        <div style={innerStyle}>
          <h2 id="focus-heading" style={h2Style}>
            Our focus
          </h2>
          <p style={{ ...bodyText, marginBottom: '16px' }}>
            Plenor Systems covers two stages: Testing & QA and Launch & Go-to-Market. That scope is
            intentional.
          </p>
          <p style={{ ...bodyText, marginBottom: '16px' }}>
            Narrowing to two stages means the framework goes deep rather than broad. Each module is
            specific — built from observed patterns of what goes wrong and why. It is not a general
            project management tool dressed as a product framework.
          </p>
          <p style={{ ...bodyText, marginBottom: '24px' }}>
            The narrow focus is a strength, not a limitation. Teams get a framework that is actually
            applicable to the work at hand, not a set of generic principles that need extensive
            interpretation.
          </p>
          <Link href="/services" style={{ color: '#1B2D4F', fontWeight: 600, fontSize: '15px', textDecoration: 'underline' }}>
            See how the two stages work →
          </Link>
        </div>
      </section>

      {/* 3. Mission Statement */}
      <section aria-labelledby="mission-heading" style={{ ...sectionPad, backgroundColor: '#F8F9FA' }}>
        <div style={innerStyle}>
          <h2 id="mission-heading" style={h2Style}>
            What we believe
          </h2>
          <blockquote
            style={{
              borderLeft: '3px solid #1B2D4F',
              paddingLeft: '24px',
              margin: 0,
            }}
          >
            <p style={{ fontSize: '20px', color: '#1B2D4F', fontWeight: 600, lineHeight: 1.5 }}>
              A well-built product deserves a structured path to market — and consistent quality
              standards before it gets there.
            </p>
          </blockquote>
        </div>
      </section>

      {/* 4. Team / Founder */}
      <section aria-labelledby="team-heading" style={{ ...sectionPad, backgroundColor: '#ffffff' }}>
        <div style={innerStyle}>
          <h2 id="team-heading" style={h2Style}>
            The team
          </h2>
          <div
            style={{
              display: 'flex',
              gap: '24px',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#E5E7EB',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-hidden="true"
            >
              <svg width="24" height="24" fill="none" stroke="#6B7280" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '17px', color: '#1A1A1A', marginBottom: '4px' }}>
                [Founder Name]
              </p>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                [Role] · Plenor Systems
              </p>
              <p style={bodyText}>
                [One-line background — update this via the CMS before going live.]
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA */}
      <section aria-labelledby="about-cta-heading" style={{ ...sectionPad, backgroundColor: '#F8F9FA' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 id="about-cta-heading" style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 700, color: '#1B2D4F', marginBottom: '16px' }}>
            Want to work together?
          </h2>
          <p style={{ ...bodyText, marginBottom: '28px' }}>
            Get in touch to discuss your product and team, or start with the free guide.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/contact" className="btn-primary">
              Get in touch
            </Link>
            <Link href="/contact#guide" className="btn-secondary">
              Get the free guide
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
