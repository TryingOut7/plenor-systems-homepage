import type { Metadata } from 'next';
import Link from 'next/link';
import GuideForm from '@/components/GuideForm';
import InquiryForm from '@/components/InquiryForm';

export const metadata: Metadata = {
  title: 'Contact — Get the Guide or Send an Inquiry',
  description:
    'Download the free guide or send a direct inquiry to Plenor Systems. Two options, no commitment required.',
  alternates: { canonical: 'https://plenor.ai/contact' },
  openGraph: {
    title: 'Contact Plenor Systems',
    description:
      'Download the free guide or send a direct inquiry to Plenor Systems. Two options, no commitment required.',
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
            Let&apos;s talk — or start with the free guide.
          </h1>
          <p style={{ fontSize: '18px', color: '#6B7280', lineHeight: 1.6 }}>
            Two options below: download the free guide with just your name and email, or send a
            direct inquiry if you&apos;re ready to talk about your product and team.
          </p>
        </div>
      </section>

      {/* 2. Free Guide Form */}
      <section
        aria-labelledby="guide-form-heading"
        id="guide"
        style={{ ...sectionPad, backgroundColor: '#ffffff' }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2
            id="guide-form-heading"
            style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700, color: '#1B2D4F', marginBottom: '12px' }}
          >
            Get the free guide
          </h2>
          <p style={{ ...bodyText, marginBottom: '32px' }}>
            <strong style={{ color: '#1A1A1A' }}>
              The 7 Most Common Product Development Mistakes — and How to Avoid Them.
            </strong>{' '}
            No commitment required — just your name and email. The PDF is sent to you automatically.
          </p>
          <GuideForm />
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}>
        <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB' }} />
      </div>

      {/* 3. Direct Inquiry Form */}
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

      {/* 4. What Happens Next */}
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

      {/* 5. Alternative Contact */}
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
            By submitting either form, you agree to our{' '}
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
