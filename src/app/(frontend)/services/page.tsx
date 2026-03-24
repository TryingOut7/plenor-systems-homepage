import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageChromeOverrides from '@/components/PageChromeOverrides';
import { getSitePageBySlug, getSiteSettings } from '@/payload/cms';
import { buildSitePageMetadata } from '@/lib/page-metadata';
import { resolveServicesPageData } from '@/lib/page-content/services';
import { resolveSiteName, resolveSiteUrl } from '@/lib/site-config';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [sitePage, settings] = await Promise.all([
    getSitePageBySlug('services'),
    getSiteSettings(),
  ]);
  const siteName = resolveSiteName(settings);
  return buildSitePageMetadata({
    slug: 'services',
    page: sitePage,
    settings,
    fallbackTitle: 'Services — Testing & QA and Launch & Go-to-Market',
    fallbackDescription:
      `${siteName} covers two framework stages: Testing & QA and Launch & Go-to-Market. Learn what each stage covers, who it helps, and why a structured framework matters.`,
  });
}

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
  const [sitePage, siteSettings] = await Promise.all([
    getSitePageBySlug('services'),
    getSiteSettings(),
  ]);

  if (!sitePage || !Array.isArray(sitePage.sections) || sitePage.sections.length === 0) {
    notFound();
  }

  const d = resolveServicesPageData(sitePage.sections);
  const siteName = resolveSiteName(siteSettings);
  const siteUrl = resolveSiteUrl(siteSettings);

  return (
    <>
      <PageChromeOverrides page={sitePage} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: `${siteName} Product Development Framework`,
            provider: {
              '@type': 'Organization',
              name: siteName,
              url: siteUrl,
            },
            description:
              'A structured framework covering Testing & QA and Launch & Go-to-Market stages of product development.',
            areaServed: 'Worldwide',
          }),
        }}
      />

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
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
        <div style={{ ...inner, maxWidth: '760px', position: 'relative', zIndex: 1 }}>
          <p className="section-label animate-fade-in" style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '24px' }}>
            {d.heroLabel}
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

      <section
        aria-labelledby="testing-heading"
        style={{ padding: '100px 32px', backgroundColor: '#ffffff' }}
      >
        <div style={narrow}>
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

          <p className="section-label" style={{ marginBottom: '16px' }}>{d.testingStageLabel}</p>
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
            {d.testingHeading}
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
                {d.testingCoverageHeading}
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
                {d.testingWhoHeading}
              </h3>
              <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.7 }}>
                {d.testingWhoFor}
              </p>
            </div>
          </div>
        </div>
      </section>

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

          <p className="section-label" style={{ marginBottom: '16px' }}>{d.launchStageLabel}</p>
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
            {d.launchHeading}
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
                {d.launchCoverageHeading}
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
                {d.launchWhoHeading}
              </h3>
              <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.7 }}>
                {d.launchWhoFor}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="why-framework-heading"
        style={{ padding: '100px 32px', backgroundColor: '#ffffff' }}
      >
        <div style={narrow}>
          <p className="section-label" style={{ marginBottom: '16px' }}>{d.approachLabel}</p>
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
            {`About ${siteName} →`}
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
          <Link href={d.ctaButtonHref} className="btn-ghost">
            {d.ctaButtonLabel}
          </Link>
        </div>
      </section>

      <style>{`
        .breadcrumb-link:hover { color: #1B2D4F !important; }
      `}</style>
    </>
  );
}
