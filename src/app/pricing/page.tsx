import type { Metadata } from 'next';
import Link from 'next/link';
import { sanityFetch } from '@/sanity/client';

export const revalidate = 60;

interface PricingPageData {
  heroHeading?: string;
  heroSubtext?: string;
  includedItems?: { title: string; desc: string }[];
  includedBody?: string;
  audiences?: { label: string; copy: string }[];
  ctaHeading?: string;
  ctaBody?: string;
  notReadyHeading?: string;
  notReadyBody?: string;
}

const defaults: Required<PricingPageData> = {
  heroHeading: 'Let\u2019s find the right fit for your team.',
  heroSubtext:
    'Pricing is tailored based on your team size and scope. Get in touch and we\u2019ll come back with a proposal.',
  includedItems: [
    { title: 'Testing & QA Module', desc: 'Quality criteria, structured test planning, release readiness checklists, and defect triage.' },
    { title: 'Launch & Go-to-Market Module', desc: 'Positioning and messaging, channel strategy, launch sequencing, and operational readiness.' },
    { title: 'Onboarding support', desc: 'Get your team up and running with the framework from day one.' },
  ],
  includedBody:
    'Engagement is straightforward to start. The framework is accessible to teams of any size \u2014 no minimum headcount or project scale required.',
  audiences: [
    { label: 'Startups', copy: 'Early-stage teams preparing for a first or major launch who need process without overhead.' },
    { label: 'SMEs', copy: 'Mid-sized teams with established products moving into new markets or scaling delivery cadence.' },
    { label: 'Enterprises', copy: 'Larger organisations that need a repeatable framework across multiple product lines or teams.' },
  ],
  ctaHeading: 'Ready to talk?',
  ctaBody: 'Tell us about your product and team \u2014 we\u2019ll come back with a proposal.',
  notReadyHeading: 'Not ready to talk yet?',
  notReadyBody: 'Start with the free guide to get a sense of the problems the framework addresses.',
};

export const metadata: Metadata = {
  title: 'Pricing — Let\'s find the right fit for your team',
  description:
    'Plenor Systems pricing is tailored to your team size and scope. Get in touch to discuss your product and receive a proposal.',
  alternates: { canonical: 'https://plenor.ai/pricing' },
  openGraph: {
    title: 'Pricing | Plenor Systems',
    description:
      'Plenor Systems pricing is tailored to your team size and scope. Get in touch to discuss your product and receive a proposal.',
    url: 'https://plenor.ai/pricing',
  },
};

const inner: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto' };

export default async function PricingPage() {
  const cms = await sanityFetch<PricingPageData>(`*[_type == "pricingPage"][0]`);
  const d: Required<PricingPageData> = {
    ...defaults,
    ...Object.fromEntries(Object.entries(cms ?? {}).filter(([, v]) => v != null)),
  };

  return (
    <>
      {/* 1. Hero */}
      <section
        aria-labelledby="pricing-hero-heading"
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
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <p className="section-label animate-fade-in" style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '24px' }}>
            Pricing
          </p>
          <h1
            id="pricing-hero-heading"
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

      {/* 2. What's Included */}
      <section
        aria-labelledby="included-heading"
        style={{ padding: '100px 32px', backgroundColor: '#ffffff' }}
      >
        <div style={{ ...inner, maxWidth: '800px' }}>
          <p className="section-label" style={{ marginBottom: '16px' }}>What&apos;s included</p>
          <h2
            id="included-heading"
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
            Everything you need to ship with confidence.
          </h2>
          <div style={{ width: '40px', height: '3px', backgroundColor: '#1B2D4F', marginBottom: '40px', borderRadius: '2px' }} aria-hidden="true" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {d.includedItems.map(({ title, desc }, i) => (
              <div
                key={title}
                style={{
                  display: 'flex',
                  gap: '28px',
                  alignItems: 'flex-start',
                  padding: '28px 0',
                  borderBottom: i < 2 ? '1px solid #E5E7EB' : 'none',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#1B2D4F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '2px',
                  }}
                >
                  <svg width="14" height="14" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="12 3 5.5 9.5 2.5 6.5" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '16px', color: '#1A1A1A', marginBottom: '4px' }}>
                    {title}
                  </p>
                  <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65, marginTop: '32px' }}>
            {d.includedBody}
          </p>
        </div>
      </section>

      {/* 3. Who We Work With */}
      <section
        aria-labelledby="who-we-work-heading"
        style={{ padding: '100px 32px', backgroundColor: '#F8F9FA' }}
      >
        <div style={{ ...inner, maxWidth: '800px' }}>
          <p className="section-label" style={{ marginBottom: '16px' }}>Who we work with</p>
          <h2
            id="who-we-work-heading"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(26px, 3.5vw, 38px)',
              fontWeight: 700,
              color: '#1B2D4F',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              marginBottom: '48px',
            }}
          >
            No minimum team size. Any stage.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '2px',
              backgroundColor: '#E5E7EB',
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            {d.audiences.map(({ label, copy }) => (
              <div
                key={label}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '32px 28px',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-display), Georgia, serif',
                    fontWeight: 700,
                    fontSize: '20px',
                    color: '#1B2D4F',
                    marginBottom: '10px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {label}
                </p>
                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.65 }}>{copy}</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '20px' }}>
            There is no minimum team size requirement to work with us.
          </p>
        </div>
      </section>

      {/* 4. Contact CTA */}
      <section
        aria-labelledby="pricing-contact-heading"
        style={{ padding: '100px 32px', backgroundColor: '#ffffff' }}
      >
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2
            id="pricing-contact-heading"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(26px, 4vw, 38px)',
              fontWeight: 700,
              color: '#1B2D4F',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '16px',
            }}
          >
            {d.ctaHeading}
          </h2>
          <p style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.65, marginBottom: '36px' }}>
            {d.ctaBody}
          </p>
          <Link href="/contact" className="btn-secondary">
            Get in touch
          </Link>
          <div style={{ marginTop: '20px' }}>
            <Link
              href="/services"
              style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}
              className="breadcrumb-link"
            >
              ← Back to Services
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Free Guide Reminder */}
      <section
        aria-labelledby="pricing-guide-heading"
        style={{ padding: '64px 32px', backgroundColor: '#F8F9FA', borderTop: '1px solid #E5E7EB' }}
      >
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
          <h2
            id="pricing-guide-heading"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: '22px',
              fontWeight: 700,
              color: '#1B2D4F',
              letterSpacing: '-0.01em',
              marginBottom: '12px',
            }}
          >
            {d.notReadyHeading}
          </h2>
          <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65, marginBottom: '24px' }}>
            {d.notReadyBody}
          </p>
          <Link href="/contact#guide" className="btn-secondary" style={{ fontSize: '14px', padding: '10px 24px' }}>
            Get the free guide
          </Link>
        </div>
      </section>

      <style>{`
        .breadcrumb-link:hover { color: #1B2D4F !important; }
      `}</style>
    </>
  );
}
