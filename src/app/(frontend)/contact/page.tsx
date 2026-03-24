import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import GuideForm from '@/components/GuideForm';
import InquiryForm from '@/components/InquiryForm';
import PageChromeOverrides from '@/components/PageChromeOverrides';
import { getSitePageBySlug, getSiteSettings } from '@/payload/cms';
import { buildSitePageMetadata } from '@/lib/page-metadata';
import { resolveSiteName } from '@/lib/site-config';
import { resolveContactPageData } from '@/lib/page-content/contact';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [sitePage, settings] = await Promise.all([
    getSitePageBySlug('contact'),
    getSiteSettings(),
  ]);
  const siteName = resolveSiteName(settings);
  return buildSitePageMetadata({
    slug: 'contact',
    page: sitePage,
    settings,
    fallbackTitle: 'Contact — Send an Inquiry',
    fallbackDescription:
      `Send a direct inquiry to ${siteName}. Tell us about your product and team.`,
  });
}

const inner: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto' };

export default async function ContactPage() {
  const [sitePage, siteSettings] = await Promise.all([getSitePageBySlug('contact'), getSiteSettings()]);

  if (!sitePage || !Array.isArray(sitePage.sections) || sitePage.sections.length === 0) {
    notFound();
  }

  const d = resolveContactPageData(sitePage.sections);

  return (
    <>
      <PageChromeOverrides page={sitePage} />
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
            {d.heroLabel}
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
            <div>
              <p className="section-label" style={{ marginBottom: '16px' }}>{d.guideLabel}</p>
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
                {d.guideHeading}
              </h2>
              <div style={{ width: '32px', height: '3px', backgroundColor: '#1B2D4F', marginBottom: '24px', borderRadius: '2px' }} aria-hidden="true" />
              <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.7, marginBottom: '16px' }}>
                <strong style={{ color: '#1A1A1A', fontWeight: 600 }}>
                  {d.guideHighlightText}
                </strong>
              </p>
              <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65 }}>
                {d.guideBody}
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #E5E7EB',
                borderTop: '3px solid #1B2D4F',
                borderRadius: '4px',
                padding: '36px',
              }}
            >
              <GuideForm {...siteSettings?.guideForm} />
            </div>
          </div>
        </div>
      </section>

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
            <div>
              <p className="section-label" style={{ marginBottom: '16px' }}>{d.inquiryLabel}</p>
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
                  {d.nextStepsLabel}
                </p>
                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
                  {d.nextStepsBody}
                </p>
              </div>

              {(d.emailAddress || d.linkedinHref) ? (
                <div>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: '#1A1A1A', marginBottom: '8px' }}>
                    {d.directEmailLabel}
                  </p>
                  {d.emailAddress ? (
                    <a
                      href={`mailto:${d.emailAddress}`}
                      style={{ color: '#1B2D4F', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}
                      className="text-link"
                    >
                      {d.emailAddress}
                    </a>
                  ) : null}
                  {(d.emailAddress && d.linkedinHref) ? (
                    <span style={{ color: '#E5E7EB', margin: '0 10px' }}>·</span>
                  ) : null}
                  {d.linkedinHref ? (
                    <a
                      href={d.linkedinHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'none' }}
                      className="text-link"
                    >
                      {d.linkedinLabel}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #E5E7EB',
                borderTop: '3px solid #1B2D4F',
                borderRadius: '4px',
                padding: '36px',
              }}
            >
              <InquiryForm {...siteSettings?.inquiryForm} />
            </div>
          </div>
        </div>
      </section>

      <div
        style={{
          backgroundColor: '#F8F9FA',
          borderTop: '1px solid #E5E7EB',
          padding: '20px 32px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>
          {(siteSettings?.inquiryForm?.consentText || d.privacyNoteLabel)}{' '}
          <Link
            href={siteSettings?.inquiryForm?.privacyHref || d.privacyPolicyHref}
            style={{ color: '#6B7280', textDecoration: 'underline' }}
          >
            {siteSettings?.inquiryForm?.privacyLabel || d.privacyPolicyLabel}
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
