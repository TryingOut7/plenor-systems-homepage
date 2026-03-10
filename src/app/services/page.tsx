import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Services — Testing & QA and Launch & Go-to-Market',
  description:
    'Plenor Systems covers two framework stages: Testing & QA and Launch & Go-to-Market. Learn what each stage covers, who it helps, and why a structured framework matters.',
  alternates: { canonical: 'https://plenorsystems.com/services' },
  openGraph: {
    title: 'Services — Testing & QA and Launch & Go-to-Market | Plenor Systems',
    description:
      'Plenor Systems covers two framework stages: Testing & QA and Launch & Go-to-Market. Learn what each stage covers, who it helps, and why a structured framework matters.',
    url: 'https://plenorsystems.com/services',
  },
};

const bodyText: React.CSSProperties = { fontSize: '16px', color: '#6B7280', lineHeight: 1.6, margin: 0 };
const h2Style: React.CSSProperties = { fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 700, color: '#1B2D4F', marginBottom: '16px', lineHeight: 1.25 };
const innerStyle: React.CSSProperties = { maxWidth: '1100px', margin: '0 auto' };
const sectionPad: React.CSSProperties = { padding: '80px 24px' };

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Plenor Systems Product Development Framework',
            provider: {
              '@type': 'Organization',
              name: 'Plenor Systems',
              url: 'https://plenorsystems.com',
            },
            description:
              'A structured framework covering Testing & QA and Launch & Go-to-Market stages of product development.',
            areaServed: 'Worldwide',
          }),
        }}
      />

      {/* 1. Page Hero */}
      <section aria-labelledby="services-hero-heading" style={{ ...sectionPad, backgroundColor: '#F8F9FA' }}>
        <div style={{ ...innerStyle, maxWidth: '720px' }}>
          <h1
            id="services-hero-heading"
            style={{
              fontSize: 'clamp(36px, 5vw, 48px)',
              fontWeight: 700,
              color: '#1B2D4F',
              lineHeight: 1.15,
              marginBottom: '20px',
            }}
          >
            Two framework stages. The two that decide whether a product succeeds.
          </h1>
          <p style={{ fontSize: '20px', color: '#6B7280', lineHeight: 1.5 }}>
            Testing & QA and Launch & Go-to-Market are where most product failures originate — not
            in design or development. Plenor Systems is built specifically for these stages.
          </p>
        </div>
      </section>

      {/* 2. Testing & QA Module */}
      <section aria-labelledby="testing-heading" style={{ ...sectionPad, backgroundColor: '#ffffff' }}>
        <div style={{ ...innerStyle, maxWidth: '720px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7280', marginBottom: '12px' }}>
            Stage 1
          </p>
          <h2 id="testing-heading" style={h2Style}>
            Testing & QA
          </h2>
          <p style={{ ...bodyText, marginBottom: '24px' }}>
            Shipping without a structured quality process means issues surface after release — when
            they&apos;re most expensive to fix. The Testing & QA module establishes clear quality
            criteria, verification steps, and release gates before code reaches users.
          </p>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', marginBottom: '12px' }}>
              What it covers
            </h3>
            <ul style={{ ...bodyText, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Defining quality criteria and acceptance standards before development completes</li>
              <li>Structured test planning: functional, regression, performance, and edge-case coverage</li>
              <li>Release readiness checklists and sign-off processes</li>
              <li>Defect triage and prioritisation so teams know what must be fixed before launch</li>
            </ul>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', marginBottom: '12px' }}>
              Who it&apos;s for
            </h3>
            <p style={bodyText}>
              Teams that are shipping frequently and catching issues too late, or organisations
              preparing for a significant launch that cannot afford post-release rework.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Launch & GTM Module */}
      <section aria-labelledby="launch-heading" style={{ ...sectionPad, backgroundColor: '#F8F9FA' }}>
        <div style={{ ...innerStyle, maxWidth: '720px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7280', marginBottom: '12px' }}>
            Stage 2
          </p>
          <h2 id="launch-heading" style={h2Style}>
            Launch & Go-to-Market
          </h2>
          <p style={{ ...bodyText, marginBottom: '24px' }}>
            A product can pass QA and still underperform at launch. Go-to-market failures are often
            structural — unclear positioning, undefined channels, or a launch day without operational
            readiness. The Launch & GTM module addresses each of these.
          </p>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', marginBottom: '12px' }}>
              What it covers
            </h3>
            <ul style={{ ...bodyText, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Market positioning and messaging that reflects what the product actually does</li>
              <li>Channel selection grounded in where your target audience can be reached</li>
              <li>Launch sequencing and operational readiness — support, onboarding, and infrastructure</li>
              <li>Post-launch review process to capture what worked and what to adjust</li>
            </ul>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', marginBottom: '12px' }}>
              Who it&apos;s for
            </h3>
            <p style={bodyText}>
              Startups preparing for a first launch, product teams at SMEs rolling out a new
              offering, and enterprise groups managing a significant market entry.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Why a Framework */}
      <section aria-labelledby="why-framework-heading" style={{ ...sectionPad, backgroundColor: '#ffffff' }}>
        <div style={{ ...innerStyle, maxWidth: '720px' }}>
          <h2 id="why-framework-heading" style={h2Style}>
            Why a framework, not a one-off engagement
          </h2>
          <p style={{ ...bodyText, marginBottom: '16px' }}>
            Ad-hoc approaches to testing and go-to-market work in isolation but don&apos;t build
            repeatable capability. Each launch starts from scratch, and teams re-learn the same
            lessons.
          </p>
          <p style={{ ...bodyText, marginBottom: '16px' }}>
            A structured framework means your team builds consistent habits — clear criteria before
            testing begins, defined channels before launch planning starts. It works for startups
            moving fast and for enterprises that need process rigour across multiple products.
          </p>
          <p style={bodyText}>
            The framework is not prescriptive. It sets the structure; your team fills in the
            specifics.
          </p>
        </div>
      </section>

      {/* Internal links for partner path */}
      <div style={{ backgroundColor: '#F8F9FA', padding: '24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ ...innerStyle, display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
          <Link href="/about" style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'underline' }}>
            About Plenor Systems →
          </Link>
          <Link href="/pricing" style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'underline' }}>
            Pricing →
          </Link>
        </div>
      </div>

      {/* 5. CTA */}
      <section aria-labelledby="services-cta-heading" style={{ ...sectionPad, backgroundColor: '#1B2D4F' }}>
        <div style={{ ...innerStyle, maxWidth: '600px', textAlign: 'center' }}>
          <h2
            id="services-cta-heading"
            style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}
          >
            Not sure yet?
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: '32px' }}>
            Start with the guide — see the kinds of mistakes the framework is designed to prevent.
          </p>
          <Link href="/contact#guide" className="btn-primary" style={{ backgroundColor: '#ffffff', color: '#1B2D4F' }}>
            Get the Free Guide
          </Link>
        </div>
      </section>
    </>
  );
}
