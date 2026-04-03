import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageChromeOverrides from '@/components/PageChromeOverrides';
import CmsPreviewDiffBanner from '@/components/CmsPreviewDiffBanner';
import UniversalSections from '@/components/cms/UniversalSections';
import { getCollectionData, getSitePageBySlug, getSiteSettings } from '@/payload/cms';
import { buildSitePageMetadata } from '@/lib/page-metadata';
import { resolvePricingPageData } from '@/lib/page-content/pricing';
import { resolveSiteName } from '@/lib/site-config';
import { getCmsReadOptions } from '@/lib/cms-read-options';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const cmsReadOptions = await getCmsReadOptions();
  const [sitePage, settings] = await Promise.all([
    getSitePageBySlug('pricing', cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);
  const siteName = resolveSiteName(settings);
  return buildSitePageMetadata({
    slug: 'pricing',
    page: sitePage,
    settings,
    fallbackTitle: "Pricing — Let's find the right fit for your team",
    fallbackDescription:
      `${siteName} pricing is tailored to your team size and scope. Get in touch to discuss your product and receive a proposal.`,
  });
}

const inner: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto' };

export default async function PricingPage() {
  const useUniversalRenderer = process.env.CMS_CORE_PAGE_RENDER_MODE === 'universal';
  const cmsReadOptions = await getCmsReadOptions();
  const [sitePage, siteSettings] = await Promise.all([
    getSitePageBySlug('pricing', cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);

  if (!sitePage || !Array.isArray(sitePage.sections) || sitePage.sections.length === 0) {
    notFound();
  }

  if (useUniversalRenderer) {
    const collectionData = await getCollectionData(cmsReadOptions);
    return (
      <>
        <PageChromeOverrides page={sitePage} />
        <CmsPreviewDiffBanner summary={(sitePage as Record<string, unknown>).previewDiffSummary} />
        <UniversalSections
          documentId={sitePage.id || 'pricing'}
          documentType="site-pages"
          sections={sitePage.sections}
          collections={collectionData}
          guideFormLabels={siteSettings?.guideForm}
          inquiryFormLabels={siteSettings?.inquiryForm}
        />
      </>
    );
  }

  const d = resolvePricingPageData(sitePage.sections);

  return (
    <>
      <PageChromeOverrides page={sitePage} />
      <CmsPreviewDiffBanner summary={(sitePage as Record<string, unknown>).previewDiffSummary} />
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
            {d.heroLabel}
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

      <section
        aria-labelledby="included-heading"
        style={{ padding: '100px 32px', backgroundColor: '#ffffff' }}
      >
        <div style={{ ...inner, maxWidth: '800px' }}>
          <p className="section-label" style={{ marginBottom: '16px' }}>{d.includedLabel}</p>
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
            {d.includedHeading}
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
                  borderBottom: i < d.includedItems.length - 1 ? '1px solid #E5E7EB' : 'none',
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

      <section
        aria-labelledby="who-we-work-heading"
        style={{ padding: '100px 32px', backgroundColor: '#F8F9FA' }}
      >
        <div style={{ ...inner, maxWidth: '800px' }}>
          <p className="section-label" style={{ marginBottom: '16px' }}>{d.audiencesLabel}</p>
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
            {d.audiencesHeading}
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
            {d.noMinimumNote}
          </p>
        </div>
      </section>

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
          <Link href={d.ctaButtonHref} className="btn-secondary">
            {d.ctaButtonLabel}
          </Link>
          <div style={{ marginTop: '20px' }}>
            <Link
              href={d.backLinkHref}
              style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}
              className="breadcrumb-link"
            >
              {d.backLinkLabel}
            </Link>
          </div>
        </div>
      </section>

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
          <Link href={d.notReadyButtonHref} className="btn-secondary" style={{ fontSize: '14px', padding: '10px 24px' }}>
            {d.notReadyButtonLabel}
          </Link>
        </div>
      </section>

      <style>{`
        .breadcrumb-link:hover { color: #1B2D4F !important; }
      `}</style>
    </>
  );
}
