import type { Metadata } from 'next';
import Link from 'next/link';
import { draftMode } from 'next/headers';
import { sanityFetch } from '@/sanity/client';

export const revalidate = 60;

interface ServicesPageData {
  heroHeading?: string;
  heroSubtext?: string;
  testingBody?: string;
  testingItems?: string[];
  testingWhoFor?: string;
  launchBody?: string;
  launchItems?: string[];
  launchWhoFor?: string;
  whyFrameworkHeading?: string;
  whyFrameworkBody1?: string;
  whyFrameworkBody2?: string;
  whyFrameworkBody3?: string;
  ctaHeading?: string;
  ctaBody?: string;
}

const defaults: Required<ServicesPageData> = {
  heroHeading: 'Two framework stages. The two that decide whether a product succeeds.',
  heroSubtext:
    'Testing & QA and Launch & Go-to-Market are where most product failures originate — not in design or development. Plenor Systems is built specifically for these stages.',
  testingBody:
    'Shipping without a structured quality process means issues surface after release — when they\u2019re most expensive to fix. The Testing & QA module establishes clear quality criteria, verification steps, and release gates before code reaches users.',
  testingItems: [
    'Defining quality criteria and acceptance standards before development completes',
    'Structured test planning: functional, regression, performance, and edge-case coverage',
    'Release readiness checklists and sign-off processes',
    'Defect triage and prioritisation so teams know what must be fixed before launch',
  ],
  testingWhoFor:
    'Teams that are shipping frequently and catching issues too late, or organisations preparing for a significant launch that cannot afford post-release rework.',
  launchBody:
    'A product can pass QA and still underperform at launch. Go-to-market failures are often structural \u2014 unclear positioning, undefined channels, or a launch day without operational readiness. The Launch & GTM module addresses each of these.',
  launchItems: [
    'Market positioning and messaging that reflects what the product actually does',
    'Channel selection grounded in where your target audience can be reached',
    'Launch sequencing and operational readiness \u2014 support, onboarding, and infrastructure',
    'Post-launch review process to capture what worked and what to adjust',
  ],
  launchWhoFor:
    'Startups preparing for a first launch, product teams at SMEs rolling out a new offering, and enterprise groups managing a significant market entry.',
  whyFrameworkHeading: 'Why a framework, not a one-off engagement',
  whyFrameworkBody1:
    'Ad-hoc approaches to testing and go-to-market work in isolation but don\u2019t build repeatable capability. Each launch starts from scratch, and teams re-learn the same lessons.',
  whyFrameworkBody2:
    'A structured framework means your team builds consistent habits \u2014 clear criteria before testing begins, defined channels before launch planning starts. It works for startups moving fast and for enterprises that need process rigour across multiple products.',
  whyFrameworkBody3:
    'The framework is not prescriptive. It sets the structure; your team fills in the specifics.',
  ctaHeading: 'Not sure yet?',
  ctaBody: 'Start with the guide \u2014 see the kinds of mistakes the framework is designed to prevent.',
};

export const metadata: Metadata = {
  title: 'Services — Testing & QA and Launch & Go-to-Market',
  description:
    'Plenor Systems covers two framework stages: Testing & QA and Launch & Go-to-Market. Learn what each stage covers, who it helps, and why a structured framework matters.',
  alternates: { canonical: 'https://plenor.ai/services' },
  openGraph: {
    title: 'Services — Testing & QA and Launch & Go-to-Market | Plenor Systems',
    description:
      'Plenor Systems covers two framework stages: Testing & QA and Launch & Go-to-Market. Learn what each stage covers, who it helps, and why a structured framework matters.',
    url: 'https://plenor.ai/services',
  },
};

const inner: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto' };
const narrow: React.CSSProperties = { maxWidth: '760px', margin: '0 auto' };

const listItem = (text: string) => (
  <li
    key={text}
    style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'flex-start',
      fontSize: '16px',
      color: '#6B7280',
      lineHeight: 1.65,
    }}
  >
    <span
      aria-hidden="true"
      style={{
        flexShrink: 0,
        marginTop: '8px',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: '#1B2D4F',
        display: 'inline-block',
      }}
    />
    {text}
  </li>
);

export default async function ServicesPage() {
  const { isEnabled: preview } = await draftMode();
  const cms = await sanityFetch<ServicesPageData>(`*[_type == "servicesPage"][0]`, { preview });
  const d: Required<ServicesPageData> = {
    ...defaults,
    ...Object.fromEntries(Object.entries(cms ?? {}).filter(([, v]) => v != null)),
  };

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
              url: 'https://plenor.ai',
            },
            description:
              'A structured framework covering Testing & QA and Launch & Go-to-Market stages of product development.',
            areaServed: 'Worldwide',
          }),
        }}
      />

      {/* 1. Page Hero */}
      <section
        aria-labelledby="services-hero-heading"
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
        <div style={{ ...inner, maxWidth: '760px', position: 'relative', zIndex: 1 }}>
          <p className="section-label animate-fade-in" style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '24px' }}>
            Framework Overview
          </p>
          <h1
            id="services-hero-heading"
            className="animate-fade-up"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(36px, 5.5vw, 60px)',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '24px',
            }}
          >
            {d.heroHeading}
          </h1>
          <p className="animate-fade-up-delay-1" style={{ fontSize: '18px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
            {d.heroSubtext}
          </p>
        </div>
      </section>

      {/* 2. Testing & QA Module */}
      <section
        aria-labelledby="testing-heading"
        style={{ padding: '100px 32px', backgroundColor: '#ffffff' }}
      >
        <div style={narrow}>
          {/* Large stage number */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0', marginBottom: '40px' }}>
            <span
              aria-hidden="true"
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: 'clamp(80px, 12vw, 140px)',
                fontWeight: 700,
                color: 'rgba(27,45,79,0.07)',
                lineHeight: 1,
                letterSpacing: '-0.04em',
                marginLeft: '-4px',
                userSelect: 'none',
              }}
            >
              01
            </span>
          </div>

          <p className="section-label" style={{ marginBottom: '16px' }}>Stage 1</p>
          <h2
            id="testing-heading"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 700,
              color: '#1B2D4F',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '20px',
            }}
          >
            Testing & QA
          </h2>
          <div style={{ width: '40px', height: '3px', backgroundColor: '#1B2D4F', marginBottom: '28px', borderRadius: '2px' }} aria-hidden="true" />
          <p style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.7, marginBottom: '36px' }}>
            {d.testingBody}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px',
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1A1A1A',
                  marginBottom: '16px',
                  letterSpacing: '-0.01em',
                }}
              >
                What it covers
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {d.testingItems.map(listItem)}
              </ul>
            </div>
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1A1A1A',
                  marginBottom: '16px',
                  letterSpacing: '-0.01em',
                }}
              >
                Who it&apos;s for
              </h3>
              <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.7 }}>
                {d.testingWhoFor}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Launch & GTM Module */}
      <section
        aria-labelledby="launch-heading"
        style={{ padding: '100px 32px', backgroundColor: '#F8F9FA' }}
      >
        <div style={narrow}>
          <div style={{ marginBottom: '40px' }}>
            <span
              aria-hidden="true"
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: 'clamp(80px, 12vw, 140px)',
                fontWeight: 700,
                color: 'rgba(27,45,79,0.07)',
                lineHeight: 1,
                letterSpacing: '-0.04em',
                marginLeft: '-4px',
                display: 'block',
                userSelect: 'none',
              }}
            >
              02
            </span>
          </div>

          <p className="section-label" style={{ marginBottom: '16px' }}>Stage 2</p>
          <h2
            id="launch-heading"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 700,
              color: '#1B2D4F',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '20px',
            }}
          >
            Launch & Go-to-Market
          </h2>
          <div style={{ width: '40px', height: '3px', backgroundColor: '#1B2D4F', marginBottom: '28px', borderRadius: '2px' }} aria-hidden="true" />
          <p style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.7, marginBottom: '36px' }}>
            {d.launchBody}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px',
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1A1A1A',
                  marginBottom: '16px',
                  letterSpacing: '-0.01em',
                }}
              >
                What it covers
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {d.launchItems.map(listItem)}
              </ul>
            </div>
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1A1A1A',
                  marginBottom: '16px',
                  letterSpacing: '-0.01em',
                }}
              >
                Who it&apos;s for
              </h3>
              <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.7 }}>
                {d.launchWhoFor}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Why a Framework */}
      <section
        aria-labelledby="why-framework-heading"
        style={{ padding: '100px 32px', backgroundColor: '#ffffff' }}
      >
        <div style={narrow}>
          <p className="section-label" style={{ marginBottom: '16px' }}>The Approach</p>
          <h2
            id="why-framework-heading"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(26px, 3.5vw, 38px)',
              fontWeight: 700,
              color: '#1B2D4F',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '20px',
            }}
          >
            {d.whyFrameworkHeading}
          </h2>
          <div style={{ width: '40px', height: '3px', backgroundColor: '#1B2D4F', marginBottom: '32px', borderRadius: '2px' }} aria-hidden="true" />
          <p style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.7, marginBottom: '20px' }}>
            {d.whyFrameworkBody1}
          </p>
          <p style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.7, marginBottom: '20px' }}>
            {d.whyFrameworkBody2}
          </p>
          <p style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.7 }}>
            {d.whyFrameworkBody3}
          </p>
        </div>
      </section>

      {/* Internal links */}
      <div
        style={{
          backgroundColor: '#F8F9FA',
          borderTop: '1px solid #E5E7EB',
          borderBottom: '1px solid #E5E7EB',
          padding: '20px 32px',
        }}
      >
        <div style={{ ...inner, display: 'flex', flexWrap: 'wrap', gap: '8px 32px', justifyContent: 'center' }}>
          <Link
            href="/about"
            style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}
            className="breadcrumb-link"
          >
            About Plenor Systems →
          </Link>
          <Link
            href="/pricing"
            style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}
            className="breadcrumb-link"
          >
            Pricing →
          </Link>
        </div>
      </div>

      {/* 5. CTA */}
      <section
        aria-labelledby="services-cta-heading"
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
            id="services-cta-heading"
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
            {d.ctaHeading}
          </h2>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: '36px' }}>
            {d.ctaBody}
          </p>
          <Link href="/contact#guide" className="btn-ghost">
            Get the Free Guide
          </Link>
        </div>
      </section>

      <style>{`
        .breadcrumb-link:hover { color: #1B2D4F !important; }
      `}</style>
    </>
  );
}
