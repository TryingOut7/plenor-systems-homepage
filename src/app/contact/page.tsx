import type { Metadata } from 'next';
import Link from 'next/link';
import GuideForm from '@/components/GuideForm';
import InquiryForm from '@/components/InquiryForm';
import { sanityFetch } from '@/sanity/client';

export const revalidate = 60;

interface ContactPageData {
  heroHeading?: string;
  heroSubtext?: string;
  inquiryHeading?: string;
  inquirySubtext?: string;
}

const defaults: Required<ContactPageData> = {
  heroHeading: 'Let\u2019s talk.',
  heroSubtext: 'Tell us about your product and team and we\u2019ll get back to you within 2 business days.',
  inquiryHeading: 'Send a direct inquiry',
  inquirySubtext:
    'Tell us about your product, your team, and the challenge you\u2019re working through. We\u2019ll respond within 2 business days.',
};

export const metadata: Metadata = {
  title: 'Contact — Send an Inquiry',
  description:
    'Send a direct inquiry to Plenor Systems. Tell us about your product and team.',
  alternates: { canonical: 'https://plenor.ai/contact' },
  openGraph: {
    title: 'Contact Plenor Systems',
    description:
      'Send a direct inquiry to Plenor Systems. Tell us about your product and team.',
    url: 'https://plenor.ai/contact',
  },
};

const inner: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto' };

export default async function ContactPage() {
  const cms = await sanityFetch<ContactPageData>(`*[_type == "contactPage"][0]`);
  const d: Required<ContactPageData> = {
    ...defaults,
    ...Object.fromEntries(Object.entries(cms ?? {}).filter(([, v]) => v != null)),
  };

  return (
    <>
      {/* 1. Hero */}
      <section
        aria-labelledby="contact-hero-heading"
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
        <div style={{ maxWidth: '680px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p className="section-label animate-fade-in" style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '24px' }}>
            Contact
          </p>
          <h1
            id="contact-hero-heading"
            className="animate-fade-up"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(40px, 6vw, 72px)',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              marginBottom: '20px',
            }}
          >
            {d.heroHeading}
          </h1>
          <p className="animate-fade-up-delay-1" style={{ fontSize: '18px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
            {d.heroSubtext}
          </p>
        </div>
      </section>

      {/* 2. Guide form */}
      <section
        id="guide"
        aria-labelledby="guide-form-heading"
        style={{ padding: '100px 32px', backgroundColor: '#F8F9FA' }}
      >
        <div style={{ ...inner, maxWidth: '860px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '64px',
              alignItems: 'start',
            }}
          >
            {/* Left: copy */}
            <div>
              <p className="section-label" style={{ marginBottom: '16px' }}>Free resource</p>
              <h2
                id="guide-form-heading"
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: 'clamp(24px, 3vw, 34px)',
                  fontWeight: 700,
                  color: '#1B2D4F',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  marginBottom: '20px',
                }}
              >
                Get the free guide
              </h2>
              <div style={{ width: '32px', height: '3px', backgroundColor: '#1B2D4F', marginBottom: '24px', borderRadius: '2px' }} aria-hidden="true" />
              <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.7, marginBottom: '16px' }}>
                <strong style={{ color: '#1A1A1A', fontWeight: 600 }}>
                  The 7 Most Common Product Development Mistakes — and How to Avoid Them.
                </strong>
              </p>
              <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65 }}>
                The guide covers the specific errors teams make in Testing & QA and Launch &
                Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent
                to your inbox automatically.
              </p>
            </div>

            {/* Right: form */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #E5E7EB',
                borderTop: '3px solid #1B2D4F',
                borderRadius: '4px',
                padding: '36px',
              }}
            >
              <GuideForm />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Direct Inquiry Form */}
      <section
        aria-labelledby="inquiry-form-heading"
        style={{ padding: '100px 32px', backgroundColor: '#ffffff' }}
      >
        <div style={{ ...inner, maxWidth: '860px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '64px',
              alignItems: 'start',
            }}
          >
            {/* Left: copy */}
            <div>
              <p className="section-label" style={{ marginBottom: '16px' }}>Send an inquiry</p>
              <h2
                id="inquiry-form-heading"
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: 'clamp(24px, 3vw, 34px)',
                  fontWeight: 700,
                  color: '#1B2D4F',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  marginBottom: '20px',
                }}
              >
                {d.inquiryHeading}
              </h2>
              <div style={{ width: '32px', height: '3px', backgroundColor: '#1B2D4F', marginBottom: '24px', borderRadius: '2px' }} aria-hidden="true" />
              <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65, marginBottom: '32px' }}>
                {d.inquirySubtext}
              </p>

              {/* What happens next */}
              <div
                style={{
                  padding: '20px 24px',
                  backgroundColor: '#F8F9FA',
                  borderLeft: '3px solid #1B2D4F',
                  borderRadius: '0 4px 4px 0',
                  marginBottom: '28px',
                }}
              >
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#1B2D4F',
                    marginBottom: '6px',
                  }}
                >
                  What happens next
                </p>
                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
                  We review every inquiry and respond within 2 business days with initial thoughts or a
                  proposal request.
                </p>
              </div>

              {/* Alt contact */}
              <div>
                <p style={{ fontWeight: 600, fontSize: '14px', color: '#1A1A1A', marginBottom: '8px' }}>
                  Prefer email directly?
                </p>
                <a
                  href="mailto:hello@plenor.ai"
                  style={{ color: '#1B2D4F', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}
                  className="text-link"
                >
                  hello@plenor.ai
                </a>
                <span style={{ color: '#E5E7EB', margin: '0 10px' }}>·</span>
                <a
                  href="https://www.linkedin.com/company/plenor-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'none' }}
                  className="text-link"
                >
                  LinkedIn →
                </a>
              </div>
            </div>

            {/* Right: form */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #E5E7EB',
                borderTop: '3px solid #1B2D4F',
                borderRadius: '4px',
                padding: '36px',
              }}
            >
              <InquiryForm />
            </div>
          </div>
        </div>
      </section>

      {/* Privacy note */}
      <div
        style={{
          backgroundColor: '#F8F9FA',
          borderTop: '1px solid #E5E7EB',
          padding: '20px 32px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>
          By submitting this form, you agree to our{' '}
          <Link href="/privacy" style={{ color: '#6B7280', textDecoration: 'underline' }}>
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      <style>{`
        .text-link:hover { opacity: 0.75; }
      `}</style>
    </>
  );
}
