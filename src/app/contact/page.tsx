import type { Metadata } from 'next';
import Link from 'next/link';
import InquiryForm from '@/components/InquiryForm';

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

const bodyText: React.CSSProperties = { fontSize: '16px', color: '#6B7280', lineHeight: 1.6, margin: 0 };
const sectionPad: React.CSSProperties = { padding: '80px 24px' };

export default function ContactPage() {
  return (
    <>
      {/* 1. Hero */}
      <section aria-labelledby="contact-hero-heading" style={{ ...sectionPad, backgroundColor: '#F8F9FA', paddingBottom: '40px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h1
            id="contact-hero-heading"
            style={{
              fontSize: 'clamp(36px, 5vw, 48px)',
              fontWeight: 700,
              color: '#1B2D4F',
              lineHeight: 1.15,
              marginBottom: '16px',
            }}
          >
            Let&apos;s talk.
          </h1>
          <p style={{ fontSize: '18px', color: '#6B7280', lineHeight: 1.6 }}>
            Tell us about your product and team and we&apos;ll get back to you within 2 business days.
          </p>
        </div>
      </section>

      {/* 2. Direct Inquiry Form */}
      <section
        aria-labelledby="inquiry-form-heading"
        style={{ ...sectionPad, backgroundColor: '#ffffff' }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2
            id="inquiry-form-heading"
            style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700, color: '#1B2D4F', marginBottom: '12px' }}
          >
            Send a direct inquiry
          </h2>
          <p style={{ ...bodyText, marginBottom: '32px' }}>
            Tell us about your product, your team, and the challenge you&apos;re working through.
            We&apos;ll respond within 2 business days.
          </p>
          <InquiryForm />
        </div>
      </section>

      {/* 3. What Happens Next */}
      <section aria-labelledby="next-steps-heading" style={{ ...sectionPad, backgroundColor: '#F8F9FA' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2
            id="next-steps-heading"
            style={{ fontSize: '20px', fontWeight: 700, color: '#1B2D4F', marginBottom: '12px' }}
          >
            What happens next
          </h2>
          <p style={bodyText}>
            We review every inquiry and respond within 2 business days with initial thoughts or a
            proposal request.
          </p>
        </div>
      </section>

      {/* 4. Alternative Contact */}
      <section aria-labelledby="alt-contact-heading" style={{ padding: '0 24px 80px', backgroundColor: '#F8F9FA' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2
            id="alt-contact-heading"
            style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}
          >
            Prefer email directly?
          </h2>
          <p style={{ ...bodyText, marginBottom: '8px' }}>
            <a
              href="mailto:hello@plenor.ai"
              style={{ color: '#1B2D4F', fontWeight: 600, textDecoration: 'underline' }}
            >
              hello@plenor.ai
            </a>
          </p>
          <a
            href="https://www.linkedin.com/company/plenor-ai"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'underline' }}
          >
            LinkedIn →
          </a>
          <p style={{ ...bodyText, fontSize: '13px', marginTop: '20px' }}>
            By submitting this form, you agree to our{' '}
            <Link href="/privacy" style={{ color: '#6B7280', textDecoration: 'underline' }}>
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
