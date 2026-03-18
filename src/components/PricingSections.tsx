'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
type PricingSectionBase = {
  _key?: string;
  _type:
    | 'pricingHeroSection'
    | 'pricingIncludedSection'
    | 'pricingAudienceSection'
    | 'pricingCtaSection'
    | 'pricingGuideSection';
};

type SectionTheme = 'navy' | 'charcoal' | 'black' | 'white' | 'light';
type SectionSize = 'compact' | 'regular' | 'spacious';

type IncludedItem = { _key?: string; title?: string; desc?: string } | string;
type AudienceItem = { _key?: string; label?: string; copy?: string };

export type PricingHeroSection = PricingSectionBase & {
  _type: 'pricingHeroSection';
  label?: string;
  heading?: string;
  subtext?: string;
  theme?: SectionTheme;
  size?: SectionSize;
};

export type PricingIncludedSection = PricingSectionBase & {
  _type: 'pricingIncludedSection';
  label?: string;
  heading?: string;
  items?: IncludedItem[];
  body?: string;
  theme?: SectionTheme;
  size?: SectionSize;
};

export type PricingAudienceSection = PricingSectionBase & {
  _type: 'pricingAudienceSection';
  label?: string;
  heading?: string;
  audiences?: AudienceItem[];
  note?: string;
  theme?: SectionTheme;
  size?: SectionSize;
};

export type PricingCtaSection = PricingSectionBase & {
  _type: 'pricingCtaSection';
  heading?: string;
  body?: string;
  primaryButtonLabel?: string;
  primaryButtonHref?: string;
  secondaryLinkLabel?: string;
  secondaryLinkHref?: string;
  theme?: SectionTheme;
  size?: SectionSize;
};

export type PricingGuideSection = PricingSectionBase & {
  _type: 'pricingGuideSection';
  heading?: string;
  body?: string;
  buttonLabel?: string;
  buttonHref?: string;
  theme?: SectionTheme;
  size?: SectionSize;
};

export type PricingSection =
  | PricingHeroSection
  | PricingIncludedSection
  | PricingAudienceSection
  | PricingCtaSection
  | PricingGuideSection;

interface PricingSectionsProps {
  documentId: string;
  documentType: string;
  sections: PricingSection[];
}

const inner: CSSProperties = { maxWidth: '1200px', margin: '0 auto' };

const sectionPadding: Record<SectionSize, string> = {
  compact: '80px 32px',
  regular: '100px 32px',
  spacious: '124px 32px',
};

const heroPadding: Record<SectionSize, string> = {
  compact: '96px 32px 104px',
  regular: '100px 32px 108px',
  spacious: '124px 32px 132px',
};

function getDarkBackgroundColor(theme?: SectionTheme): string {
  if (theme === 'charcoal') return '#1F2937';
  if (theme === 'black') return '#111827';
  return '#1B2D4F';
}

function getLightBackgroundColor(theme: SectionTheme | undefined, fallback: 'white' | 'light'): string {
  if (theme === 'light') return '#F8F9FA';
  if (theme === 'white') return '#ffffff';
  return fallback === 'light' ? '#F8F9FA' : '#ffffff';
}

export default function PricingSections({ documentId, documentType, sections }: PricingSectionsProps) {
  return (
    <>
      {sections.map((section, index) => {
        const key = section._key ?? `${section._type}-${index}`;

        if (section._type === 'pricingHeroSection') {
          const heroTheme = getDarkBackgroundColor(section.theme);
          const heroSize = section.size ?? 'regular';

          return (
            <section
              key={key}
              aria-labelledby="pricing-hero-heading"
              data-sanity={dataFor(sectionPath)}
              style={{
                backgroundColor: heroTheme,
                padding: heroPadding[heroSize],
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
              <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <p
                  className="section-label animate-fade-in"
                  data-sanity={dataFor([...sectionPath, 'label'])}
                  style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '24px' }}
                >
                  {section.label || 'Pricing'}
                </p>
                <h1
                  id="pricing-hero-heading"
                  className="animate-fade-up"
                  data-sanity={dataFor([...sectionPath, 'heading'])}
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
                  {section.heading}
                </h1>
                <p
                  className="animate-fade-up-delay-1"
                  data-sanity={dataFor([...sectionPath, 'subtext'])}
                  style={{ fontSize: '18px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}
                >
                  {section.subtext}
                </p>
              </div>
            </section>
          );
        }

        if (section._type === 'pricingIncludedSection') {
          const items = section.items ?? [];
          const includedSize = section.size ?? 'regular';
          const includedBackground = getLightBackgroundColor(section.theme, 'white');

          return (
            <section
              key={key}
              aria-labelledby="included-heading"
              data-sanity={dataFor(sectionPath)}
              style={{ padding: sectionPadding[includedSize], backgroundColor: includedBackground }}
            >
              <div style={{ ...inner, maxWidth: '800px' }}>
                <p className="section-label" data-sanity={dataFor([...sectionPath, 'label'])} style={{ marginBottom: '16px' }}>
                  {section.label || "What's included"}
                </p>
                <h2
                  id="included-heading"
                  data-sanity={dataFor([...sectionPath, 'heading'])}
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
                  {section.heading}
                </h2>
                <div style={{ width: '40px', height: '3px', backgroundColor: '#1B2D4F', marginBottom: '40px', borderRadius: '2px' }} aria-hidden="true" />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {items.map((item, itemIndex) => {
                    const itemPath: DataPathSegment[] =
                      typeof item === 'object' && item && '_key' in item && item._key
                        ? [...sectionPath, 'items', { _key: item._key }]
                        : [...sectionPath, 'items', itemIndex];
                    const title = typeof item === 'string' ? item : item.title || '';
                    const desc = typeof item === 'string' ? '' : item.desc || '';

                    return (
                      <div
                        key={typeof item === 'string' ? `${item}-${itemIndex}` : item._key || `${title}-${itemIndex}`}
                        data-sanity={dataFor(itemPath)}
                        style={{
                          display: 'flex',
                          gap: '28px',
                          alignItems: 'flex-start',
                          padding: '28px 0',
                          borderBottom: itemIndex < items.length - 1 ? '1px solid #E5E7EB' : 'none',
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
                          <p
                            data-sanity={typeof item === 'string' ? dataFor(itemPath) : dataFor([...itemPath, 'title'])}
                            style={{ fontWeight: 600, fontSize: '16px', color: '#1A1A1A', marginBottom: desc ? '4px' : 0 }}
                          >
                            {title}
                          </p>
                          {desc ? (
                            <p data-sanity={dataFor([...itemPath, 'desc'])} style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65 }}>
                              {desc}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p data-sanity={dataFor([...sectionPath, 'body'])} style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65, marginTop: '32px' }}>
                  {section.body}
                </p>
              </div>
            </section>
          );
        }

        if (section._type === 'pricingAudienceSection') {
          const audiences = section.audiences ?? [];
          const audienceSize = section.size ?? 'regular';
          const audienceBackground = getLightBackgroundColor(section.theme, 'light');

          return (
            <section
              key={key}
              aria-labelledby="who-we-work-heading"
              data-sanity={dataFor(sectionPath)}
              style={{ padding: sectionPadding[audienceSize], backgroundColor: audienceBackground }}
            >
              <div style={{ ...inner, maxWidth: '800px' }}>
                <p className="section-label" data-sanity={dataFor([...sectionPath, 'label'])} style={{ marginBottom: '16px' }}>
                  {section.label || 'Who we work with'}
                </p>
                <h2
                  id="who-we-work-heading"
                  data-sanity={dataFor([...sectionPath, 'heading'])}
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
                  {section.heading}
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
                  {audiences.map((audience, audienceIndex) => {
                    const audiencePath: DataPathSegment[] = audience._key
                      ? [...sectionPath, 'audiences', { _key: audience._key }]
                      : [...sectionPath, 'audiences', audienceIndex];

                    return (
                      <div
                        key={audience._key ?? `${audience.label}-${audienceIndex}`}
                        data-sanity={dataFor(audiencePath)}
                        style={{
                          backgroundColor: '#ffffff',
                          padding: '32px 28px',
                        }}
                      >
                        <p
                          data-sanity={dataFor([...audiencePath, 'label'])}
                          style={{
                            fontFamily: 'var(--font-display), Georgia, serif',
                            fontWeight: 700,
                            fontSize: '20px',
                            color: '#1B2D4F',
                            marginBottom: '10px',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {audience.label}
                        </p>
                        <p data-sanity={dataFor([...audiencePath, 'copy'])} style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.65 }}>
                          {audience.copy}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <p data-sanity={dataFor([...sectionPath, 'note'])} style={{ fontSize: '14px', color: '#6B7280', marginTop: '20px' }}>
                  {section.note || 'There is no minimum team size requirement to work with us.'}
                </p>
              </div>
            </section>
          );
        }

        if (section._type === 'pricingCtaSection') {
          const ctaSize = section.size ?? 'regular';
          const ctaBackground = getLightBackgroundColor(section.theme, 'white');

          return (
            <section
              key={key}
              aria-labelledby="pricing-contact-heading"
              data-sanity={dataFor(sectionPath)}
              style={{ padding: sectionPadding[ctaSize], backgroundColor: ctaBackground }}
            >
              <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                <h2
                  id="pricing-contact-heading"
                  data-sanity={dataFor([...sectionPath, 'heading'])}
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
                  {section.heading}
                </h2>
                <p data-sanity={dataFor([...sectionPath, 'body'])} style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.65, marginBottom: '36px' }}>
                  {section.body}
                </p>
                <Link href={section.primaryButtonHref || '/contact'} className="btn-secondary" data-sanity={dataFor([...sectionPath, 'primaryButtonLabel'])}>
                  {section.primaryButtonLabel || 'Get in touch'}
                </Link>
                <div style={{ marginTop: '20px' }}>
                  <Link
                    href={section.secondaryLinkHref || '/services'}
                    data-sanity={dataFor([...sectionPath, 'secondaryLinkLabel'])}
                    style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}
                    className="breadcrumb-link"
                  >
                    {section.secondaryLinkLabel || '← Back to Services'}
                  </Link>
                </div>
              </div>
            </section>
          );
        }

        if (section._type === 'pricingGuideSection') {
          const guideSize = section.size ?? 'compact';
          const guideBackground = getLightBackgroundColor(section.theme, 'light');

          return (
            <section
              key={key}
              aria-labelledby="pricing-guide-heading"
              data-sanity={dataFor(sectionPath)}
              style={{
                padding: guideSize === 'compact' ? '64px 32px' : sectionPadding[guideSize],
                backgroundColor: guideBackground,
                borderTop: '1px solid #E5E7EB',
              }}
            >
              <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
                <h2
                  id="pricing-guide-heading"
                  data-sanity={dataFor([...sectionPath, 'heading'])}
                  style={{
                    fontFamily: 'var(--font-display), Georgia, serif',
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#1B2D4F',
                    letterSpacing: '-0.01em',
                    marginBottom: '12px',
                  }}
                >
                  {section.heading}
                </h2>
                <p data-sanity={dataFor([...sectionPath, 'body'])} style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65, marginBottom: '24px' }}>
                  {section.body}
                </p>
                <Link
                  href={section.buttonHref || '/contact#guide'}
                  data-sanity={dataFor([...sectionPath, 'buttonLabel'])}
                  className="btn-secondary"
                  style={{ fontSize: '14px', padding: '10px 24px' }}
                >
                  {section.buttonLabel || 'Get the free guide'}
                </Link>
              </div>
            </section>
          );
        }

        return null;
      })}

      <style>{`
        .breadcrumb-link:hover { color: #1B2D4F !important; }
      `}</style>
    </>
  );
}
