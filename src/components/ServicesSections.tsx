'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { createDataAttribute } from '@sanity/visual-editing';
import { useOptimistic } from '@sanity/visual-editing/react';

type ServicesSectionBase = {
  _key?: string;
  _type:
    | 'servicesHeroSection'
    | 'servicesTestingSection'
    | 'servicesLaunchSection'
    | 'servicesWhySection'
    | 'servicesLinksSection'
    | 'servicesCtaSection';
};

export type ServicesHeroSection = ServicesSectionBase & {
  _type: 'servicesHeroSection';
  heading?: string;
  subtext?: string;
};

export type ServicesTestingSection = ServicesSectionBase & {
  _type: 'servicesTestingSection';
  body?: string;
  items?: string[];
  whoFor?: string;
};

export type ServicesLaunchSection = ServicesSectionBase & {
  _type: 'servicesLaunchSection';
  body?: string;
  items?: string[];
  whoFor?: string;
};

export type ServicesWhySection = ServicesSectionBase & {
  _type: 'servicesWhySection';
  heading?: string;
  body1?: string;
  body2?: string;
  body3?: string;
};

export type ServicesLinksSection = ServicesSectionBase & {
  _type: 'servicesLinksSection';
};

export type ServicesCtaSection = ServicesSectionBase & {
  _type: 'servicesCtaSection';
  heading?: string;
  body?: string;
};

export type ServicesSection =
  | ServicesHeroSection
  | ServicesTestingSection
  | ServicesLaunchSection
  | ServicesWhySection
  | ServicesLinksSection
  | ServicesCtaSection;

interface ServicesSectionsProps {
  documentId: string;
  documentType: string;
  sections: ServicesSection[];
}

type DataPathSegment = string | number | { _key: string };

const inner: CSSProperties = { maxWidth: '1200px', margin: '0 auto' };
const narrow: CSSProperties = { maxWidth: '760px', margin: '0 auto' };

function isSectionList(value: unknown): value is ServicesSection[] {
  return Array.isArray(value);
}

function listItem(text: string, dataSanity?: string) {
  return (
    <li
      key={dataSanity || text}
      data-sanity={dataSanity}
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
}

export default function ServicesSections({ documentId, documentType, sections }: ServicesSectionsProps) {
  const dataAttribute = createDataAttribute({ id: documentId, type: documentType });
  const optimisticSections = useOptimistic(sections, (current, action) => {
    if (action.id !== documentId || action.type !== documentType) return current;
    const maybeSections = (action.document as { sections?: unknown })?.sections;
    return isSectionList(maybeSections) ? maybeSections : current;
  });

  const dataFor = (path: DataPathSegment[]) => dataAttribute(path);

  return (
    <>
      {optimisticSections.map((section, index) => {
        const key = section._key ?? `${section._type}-${index}`;
        const sectionPath: DataPathSegment[] = section._key
          ? ['sections', { _key: section._key }]
          : ['sections', index];

        if (section._type === 'servicesHeroSection') {
          return (
            <section
              key={key}
              aria-labelledby="services-hero-heading"
              data-sanity={dataFor(sectionPath)}
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
                  Framework Overview
                </p>
                <h1
                  id="services-hero-heading"
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

        if (section._type === 'servicesTestingSection') {
          const items = section.items ?? [];

          return (
            <section
              key={key}
              aria-labelledby="testing-heading"
              data-sanity={dataFor(sectionPath)}
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

                <p className="section-label" style={{ marginBottom: '16px' }}>Stage 1</p>
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
                  Testing & QA
                </h2>
                <div style={{ width: '40px', height: '3px', backgroundColor: '#1B2D4F', marginBottom: '28px', borderRadius: '2px' }} aria-hidden="true" />
                <p data-sanity={dataFor([...sectionPath, 'body'])} style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.7, marginBottom: '36px' }}>
                  {section.body}
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
                      What it covers
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {items.map((item, itemIndex) => listItem(item, dataFor([...sectionPath, 'items', itemIndex])))}
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
                      Who it&apos;s for
                    </h3>
                    <p data-sanity={dataFor([...sectionPath, 'whoFor'])} style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.7 }}>
                      {section.whoFor}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        if (section._type === 'servicesLaunchSection') {
          const items = section.items ?? [];

          return (
            <section
              key={key}
              aria-labelledby="launch-heading"
              data-sanity={dataFor(sectionPath)}
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

                <p className="section-label" style={{ marginBottom: '16px' }}>Stage 2</p>
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
                  Launch & Go-to-Market
                </h2>
                <div style={{ width: '40px', height: '3px', backgroundColor: '#1B2D4F', marginBottom: '28px', borderRadius: '2px' }} aria-hidden="true" />
                <p data-sanity={dataFor([...sectionPath, 'body'])} style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.7, marginBottom: '36px' }}>
                  {section.body}
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
                      What it covers
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {items.map((item, itemIndex) => listItem(item, dataFor([...sectionPath, 'items', itemIndex])))}
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
                      Who it&apos;s for
                    </h3>
                    <p data-sanity={dataFor([...sectionPath, 'whoFor'])} style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.7 }}>
                      {section.whoFor}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        if (section._type === 'servicesWhySection') {
          return (
            <section
              key={key}
              aria-labelledby="why-framework-heading"
              data-sanity={dataFor(sectionPath)}
              style={{ padding: '100px 32px', backgroundColor: '#ffffff' }}
            >
              <div style={narrow}>
                <p className="section-label" style={{ marginBottom: '16px' }}>The Approach</p>
                <h2
                  id="why-framework-heading"
                  data-sanity={dataFor([...sectionPath, 'heading'])}
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
                  {section.heading}
                </h2>
                <div style={{ width: '40px', height: '3px', backgroundColor: '#1B2D4F', marginBottom: '32px', borderRadius: '2px' }} aria-hidden="true" />
                <p data-sanity={dataFor([...sectionPath, 'body1'])} style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.7, marginBottom: '20px' }}>
                  {section.body1}
                </p>
                <p data-sanity={dataFor([...sectionPath, 'body2'])} style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.7, marginBottom: '20px' }}>
                  {section.body2}
                </p>
                <p data-sanity={dataFor([...sectionPath, 'body3'])} style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.7 }}>
                  {section.body3}
                </p>
              </div>
            </section>
          );
        }

        if (section._type === 'servicesLinksSection') {
          return (
            <div
              key={key}
              data-sanity={dataFor(sectionPath)}
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
                  About Plenor Systems →
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
          );
        }

        if (section._type === 'servicesCtaSection') {
          return (
            <section
              key={key}
              aria-labelledby="services-cta-heading"
              data-sanity={dataFor(sectionPath)}
              style={{ padding: '100px 32px', backgroundColor: '#1B2D4F', position: 'relative', overflow: 'hidden' }}
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
              <div style={{ ...inner, maxWidth: '600px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <h2
                  id="services-cta-heading"
                  data-sanity={dataFor([...sectionPath, 'heading'])}
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
                  {section.heading}
                </h2>
                <p data-sanity={dataFor([...sectionPath, 'body'])} style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: '36px' }}>
                  {section.body}
                </p>
                <Link href="/contact#guide" className="btn-ghost">
                  Get the Free Guide
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
