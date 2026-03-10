import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing — Let\'s find the right fit for your team',
  description:
    'Plenor Systems pricing is tailored to your team size and scope. Get in touch to discuss your product and receive a proposal.',
  alternates: { canonical: 'https://plenorsystems.com/pricing' },
  openGraph: {
    title: 'Pricing | Plenor Systems',
    description:
      'Plenor Systems pricing is tailored to your team size and scope. Get in touch to discuss your product and receive a proposal.',
    url: 'https://plenorsystems.com/pricing',
  },
};

const bodyText: React.CSSProperties = { fontSize: '16px', color: '#6B7280', lineHeight: 1.6, margin: 0 };
const sectionPad: React.CSSProperties = { padding: '80px 24px' };

export default function PricingPage() {
  return (
    <>
      {/* 1. Hero */}
      <section aria-labelledby="pricing-hero-heading" style={{ ...sectionPad, backgroundColor: '#F8F9FA' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h1
            id="pricing-hero-heading"
            style={{
              fontSize: 'clamp(36px, 5vw, 48px)',
              fontWeight: 700,
              color: '#1B2D4F',
              lineHeight: 1.15,
              marginBottom: '20px',
            }}
          >
            Let&apos;s find the right fit for your team.
          </h1>
          <p style={{ fontSize: '18px', color: '#6B7280', lineHeight: 1.6 }}>
            Pricing is tailored based on your team size and scope. Get in touch and we&apos;ll come
            back with a proposal.
          </p>
        </div>
      </section>

      {/* 2. What's Included */}
      <section aria-labelledby="included-heading" style={{ ...sectionPad, backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2
            id="included-heading"
            style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700, color: '#1B2D4F', marginBottom: '24px' }}
          >
            What&apos;s included
          </h2>
          <ul
            style={{
              ...bodyText,
              paddingLeft: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <li>Testing & QA module — quality criteria, test planning, release readiness</li>
            <li>Launch & Go-to-Market module — positioning, channel strategy, launch sequencing</li>
            <li>Onboarding support to get your team up and running with the framework</li>
          </ul>
          <p style={bodyText}>
            Engagement is straightforward to start. The framework is accessible to teams of any
            size — no minimum headcount or project scale required.
          </p>
        </div>
      </section>

      {/* 3. Who We Work With */}
      <section aria-labelledby="who-we-work-heading" style={{ ...sectionPad, backgroundColor: '#F8F9FA' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2
            id="who-we-work-heading"
            style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700, color: '#1B2D4F', marginBottom: '24px' }}
          >
            Who we work with
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              {
                label: 'Startups',
                copy: 'Early-stage teams preparing for a first or major launch who need process without overhead.',
              },
              {
                label: 'SMEs',
                copy: 'Mid-sized teams with established products moving into new markets or scaling delivery cadence.',
              },
              {
                label: 'Enterprises',
                copy: 'Larger organisations that need a repeatable framework across multiple product lines or teams.',
              },
            ].map(({ label, copy }) => (
              <div key={label} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#1B2D4F',
                    marginTop: '10px',
                  }}
                  aria-hidden="true"
                />
                <div>
                  <strong style={{ color: '#1A1A1A', fontSize: '16px' }}>{label}:</strong>{' '}
                  <span style={{ color: '#6B7280', fontSize: '16px' }}>{copy}</span>
                </div>
              </div>
            ))}
          </div>
          <p style={{ ...bodyText, marginTop: '24px' }}>
            There is no minimum team size requirement to work with us.
          </p>
        </div>
      </section>

      {/* 4. Contact CTA */}
      <section aria-labelledby="pricing-contact-heading" style={{ ...sectionPad, backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2
            id="pricing-contact-heading"
            style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700, color: '#1B2D4F', marginBottom: '16px' }}
          >
            Ready to talk?
          </h2>
          <p style={{ ...bodyText, marginBottom: '32px' }}>
            Tell us about your product and team — we&apos;ll come back with a proposal.
          </p>
          <Link href="/contact" className="btn-secondary">
            Get in touch
          </Link>
          <div style={{ marginTop: '16px' }}>
            <Link
              href="/services"
              style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'underline' }}
            >
              ← Back to Services
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Free Guide Reminder */}
      <section aria-labelledby="pricing-guide-heading" style={{ ...sectionPad, backgroundColor: '#F8F9FA' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2
            id="pricing-guide-heading"
            style={{ fontSize: '20px', fontWeight: 700, color: '#1B2D4F', marginBottom: '12px' }}
          >
            Not ready to talk yet?
          </h2>
          <p style={{ ...bodyText, marginBottom: '20px' }}>
            Start with the free guide to get a sense of the problems the framework addresses.
          </p>
          <Link href="/contact#guide" className="btn-secondary" style={{ fontSize: '15px', padding: '10px 24px' }}>
            Get the free guide
          </Link>
        </div>
      </section>
    </>
  );
}
