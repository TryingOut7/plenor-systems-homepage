import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import GuideForm from '@/components/GuideForm';
import { getSitePageBySlug, getSiteSettings } from '@/payload/cms';
import { resolveSiteName, resolveSiteUrl } from '@/lib/site-config';
import { resolveHomePageData } from '@/lib/page-content/home';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = resolveSiteName(settings);
  const siteUrl = resolveSiteUrl(settings);
  const title = `${siteName} — Testing & QA and Launch & Go-to-Market Framework`;
  const description =
    `${siteName} brings structure to the two most failure-prone stages of product development: Testing & QA and Launch & Go-to-Market.`;

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/`,
    },
  };
}

const inner: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto' };

export default async function HomePage() {
  const [sitePage, siteSettings] = await Promise.all([getSitePageBySlug('home'), getSiteSettings()]);

  if (!sitePage || !Array.isArray(sitePage.sections) || sitePage.sections.length === 0) {
    notFound();
  }

  const d = resolveHomePageData(sitePage.sections);

  return (
    <>
      {sitePage.hideNavbar && (
        <style>{`header[role="banner"] { display: none !important; }`}</style>
      )}
      {sitePage.hideFooter && (
        <style>{`footer[role="contentinfo"] { display: none !important; }`}</style>
      )}
      {sitePage.pageBackgroundColor && (
        <style>{`body { background-color: ${sitePage.pageBackgroundColor} !important; }`}</style>
      )}
      {sitePage.customHeadScripts && (
        <div dangerouslySetInnerHTML={{ __html: sitePage.customHeadScripts }} style={{ display: 'none' }} />
      )}
      <section
        aria-labelledby="hero-heading"
        style={{
          backgroundColor: 'var(--ui-color-hero-bg)',
          padding: '120px 32px 128px',
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

        <div style={{ ...inner, position: 'relative', zIndex: 1 }}>
          <p
            className="section-label animate-fade-in"
            style={{
              color: 'rgba(255,255,255,0.45)',
              marginBottom: '28px',
              letterSpacing: '0.14em',
            }}
          >
            {d.heroEyebrow}
          </p>

          <h1
            id="hero-heading"
            className="animate-fade-up"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(40px, 6vw, 72px)',
              fontWeight: 700,
              color: 'var(--ui-color-dark-text)',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              marginBottom: '32px',
              maxWidth: '780px',
            }}
          >
            {d.heroHeading}
          </h1>

          <p
            className="animate-fade-up-delay-1"
            style={{
              fontSize: '20px',
              color: 'rgba(255,255,255,0.65)',
              marginBottom: '48px',
              lineHeight: 1.55,
              maxWidth: '520px',
            }}
          >
            {d.heroSubtext}
          </p>

          <div className="animate-fade-up-delay-2">
            <Link href={d.heroCtaHref} className="btn-ghost">
              {d.heroCtaLabel}
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="problem-heading"
        style={{ padding: '100px 32px', backgroundColor: 'var(--ui-color-background)' }}
      >
        <div style={{ ...inner, maxWidth: '760px' }}>
          <p className="section-label" style={{ marginBottom: '24px' }}>
            {d.problemLabel}
          </p>
          <h2
            id="problem-heading"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(30px, 4vw, 44px)',
              fontWeight: 700,
              color: 'var(--ui-color-primary)',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '28px',
            }}
          >
            {d.problemHeading}
          </h2>

          <div
            style={{
              width: '40px',
              height: '3px',
              backgroundColor: 'var(--ui-color-primary)',
              marginBottom: '32px',
              borderRadius: '2px',
            }}
            aria-hidden="true"
          />

          <p style={{ fontSize: '17px', color: 'var(--ui-color-text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
            {d.problemBody1}
          </p>
          <p style={{ fontSize: '17px', color: 'var(--ui-color-text-muted)', lineHeight: 1.7 }}>
            {d.problemBody2}
          </p>
        </div>
      </section>

      <section
        aria-labelledby="what-we-do-heading"
        style={{ padding: '100px 32px', backgroundColor: 'var(--ui-color-section-alt)' }}
      >
        <div style={inner}>
          <div style={{ marginBottom: '56px' }}>
            <p className="section-label" style={{ marginBottom: '12px' }}>
              {d.whatWeDoLabel}
            </p>
            <h2
              id="what-we-do-heading"
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: 700,
                color: 'var(--ui-color-primary)',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
            >
              {d.whatWeDoHeading}
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '28px',
            }}
          >
            <article
              className="feature-card"
              aria-labelledby="card-testing-label"
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: '120px',
                  fontWeight: 700,
                  color: 'rgba(27,45,79,0.05)',
                  lineHeight: 1,
                  userSelect: 'none',
                  letterSpacing: '-0.04em',
                }}
              >
                01
              </span>
              <p
                id="card-testing-label"
                className="section-label"
                style={{ marginBottom: '16px' }}
              >
                {d.testingStageLabel}
              </p>
              <h3
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: 'var(--ui-color-primary)',
                  marginBottom: '14px',
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                }}
              >
                {d.testingCardTitle}
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--ui-color-text-muted)', lineHeight: 1.65, marginBottom: '24px' }}>
                {d.testingCardBody}
              </p>
              <Link
                href={d.whatWeDoLinkHref}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--ui-color-primary)',
                  fontWeight: 600,
                  fontSize: '14px',
                  textDecoration: 'none',
                  letterSpacing: '0.01em',
                }}
                className="card-link"
              >
                {d.whatWeDoLinkLabel}
                <span aria-hidden="true">→</span>
              </Link>
            </article>

            <article
              className="feature-card"
              aria-labelledby="card-launch-label"
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: '120px',
                  fontWeight: 700,
                  color: 'rgba(27,45,79,0.05)',
                  lineHeight: 1,
                  userSelect: 'none',
                  letterSpacing: '-0.04em',
                }}
              >
                02
              </span>
              <p
                id="card-launch-label"
                className="section-label"
                style={{ marginBottom: '16px' }}
              >
                {d.launchStageLabel}
              </p>
              <h3
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: 'var(--ui-color-primary)',
                  marginBottom: '14px',
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                }}
              >
                {d.launchCardTitle}
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--ui-color-text-muted)', lineHeight: 1.65, marginBottom: '24px' }}>
                {d.launchCardBody}
              </p>
              <Link
                href={d.whatWeDoLinkHref}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--ui-color-primary)',
                  fontWeight: 600,
                  fontSize: '14px',
                  textDecoration: 'none',
                  letterSpacing: '0.01em',
                }}
                className="card-link"
              >
                {d.whatWeDoLinkLabel}
                <span aria-hidden="true">→</span>
              </Link>
            </article>
          </div>
        </div>

        <style>{`
          .card-link { transition: gap 0.2s ease; }
          .card-link:hover { gap: 10px !important; }
        `}</style>
      </section>

      <section
        aria-labelledby="who-heading"
        style={{ padding: '100px 32px', backgroundColor: 'var(--ui-color-background)' }}
      >
        <div style={inner}>
          <div style={{ marginBottom: '56px' }}>
            <p className="section-label" style={{ marginBottom: '12px' }}>
              {d.whoLabel}
            </p>
            <h2
              id="who-heading"
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: 700,
                color: 'var(--ui-color-primary)',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
            >
              {d.whoHeading}
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '0',
            }}
          >
            {d.audiences.map(({ label, copy }, i) => (
              <div
                key={label}
                style={{
                  padding: '40px 36px',
                  borderLeft: i === 0 ? '1px solid var(--ui-color-border)' : 'none',
                  borderRight: '1px solid var(--ui-color-border)',
                  borderTop: '3px solid transparent',
                  transition: 'border-top-color 0.2s ease, background-color 0.2s ease',
                }}
                className="who-card"
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-display), Georgia, serif',
                    fontSize: '22px',
                    fontWeight: 700,
                    color: 'var(--ui-color-primary)',
                    marginBottom: '12px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {label}
                </h3>
                <p style={{ fontSize: '15px', color: 'var(--ui-color-text-muted)', lineHeight: 1.65 }}>{copy}</p>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .who-card:hover { border-top-color: var(--ui-color-primary) !important; background-color: #FAFBFC; }
        `}</style>
      </section>

      <section
        aria-labelledby="guide-cta-heading"
        id="guide"
        style={{
          padding: '100px 32px',
          backgroundColor: 'var(--ui-color-dark-bg)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '-40px',
            right: '-20px',
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: 'clamp(120px, 18vw, 240px)',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.03)',
            lineHeight: 1,
            userSelect: 'none',
            letterSpacing: '-0.05em',
            pointerEvents: 'none',
          }}
        >
          Guide
        </div>

        <div style={{ ...inner, maxWidth: '640px', position: 'relative', zIndex: 1 }}>
          <p className="section-label" style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>
            {d.guideLabel}
          </p>
          <h2
            id="guide-cta-heading"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 700,
              color: 'var(--ui-color-dark-text)',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              marginBottom: '16px',
            }}
          >
            {d.guideCTAHeading}
          </h2>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, marginBottom: '48px' }}>
            <strong style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
              {d.guideHighlightText}
            </strong>{' '}
            {d.guideCTABody}
          </p>

          <div
            style={{
              backgroundColor: 'var(--ui-color-background)',
              borderRadius: '8px',
              padding: '40px',
            }}
          >
            <GuideForm {...siteSettings?.guideForm} />
          </div>
        </div>
      </section>
    </>
  );
}
