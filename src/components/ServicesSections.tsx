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

type SectionTheme = 'navy' | 'charcoal' | 'black' | 'white' | 'light';
type SectionSize = 'compact' | 'regular' | 'spacious';

export type ServicesHeroSection = ServicesSectionBase & {
  _type: 'servicesHeroSection';
  label?: string;
  heading?: string;
  subtext?: string;
  theme?: SectionTheme;
  size?: SectionSize;
};

export type ServicesTestingSection = ServicesSectionBase & {
  _type: 'servicesTestingSection';
  label?: string;
  stageNumber?: string;
  heading?: string;
  body?: string;
  items?: string[];
  itemsHeading?: string;
  whoFor?: string;
  whoForHeading?: string;
  theme?: SectionTheme;
  size?: SectionSize;
};

export type ServicesLaunchSection = ServicesSectionBase & {
  _type: 'servicesLaunchSection';
  label?: string;
  stageNumber?: string;
  heading?: string;
  body?: string;
  items?: string[];
  itemsHeading?: string;
  whoFor?: string;
  whoForHeading?: string;
  theme?: SectionTheme;
  size?: SectionSize;
};

export type ServicesWhySection = ServicesSectionBase & {
  _type: 'servicesWhySection';
  label?: string;
  heading?: string;
  body1?: string;
  body2?: string;
  body3?: string;
  theme?: SectionTheme;
  size?: SectionSize;
};

export type ServicesLinksSection = ServicesSectionBase & {
  _type: 'servicesLinksSection';
  leftLinkLabel?: string;
  leftLinkHref?: string;
  rightLinkLabel?: string;
  rightLinkHref?: string;
  theme?: SectionTheme;
  size?: SectionSize;
};

export type ServicesCtaSection = ServicesSectionBase & {
  _type: 'servicesCtaSection';
  heading?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  theme?: SectionTheme;
  size?: SectionSize;
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
          const heroTheme = getDarkBackgroundColor(section.theme);
          const heroSize = section.size ?? 'regular';

          return (
            <section
              key={key}
              aria-labelledby="services-hero-heading"
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
              <div style={{ ...inner, maxWidth: '760px', position: 'relative', zIndex: 1 }}>
                <p
                  className="section-label animate-fade-in"
                  data-sanity={dataFor([...sectionPath, 'label'])}
                  style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '24px' }}
                >
                  {section.label || 'Framework Overview'}
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
          const testingSize = section.size ?? 'regular';
          const testingBackground = getLightBackgroundColor(section.theme, 'white');

          return (
            <section
              key={key}
              aria-labelledby="testing-heading"
              data-sanity={dataFor(sectionPath)}
              style={{ padding: sectionPadding[testingSize], backgroundColor: testingBackground }}
            >
              <div style={narrow}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0', marginBottom: '40px' }}>
                  <span
                    data-sanity={dataFor([...sectionPath, 'stageNumber'])}
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
                    {section.stageNumber || '01'}
                  </span>
                </div>

                <p className="section-label" data-sanity={dataFor([...sectionPath, 'label'])} style={{ marginBottom: '16px' }}>
                  {section.label || 'Stage 1'}
                </p>
                <h2
                  id="testing-heading"
                  data-sanity={dataFor([...sectionPath, 'heading'])}
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
                  {section.heading || 'Testing & QA'}
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
                      data-sanity={dataFor([...sectionPath, 'itemsHeading'])}
                      style={{
                        fontFamily: 'var(--font-display), Georgia, serif',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#1A1A1A',
                        marginBottom: '16px',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {section.itemsHeading || 'What it covers'}
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {items.map((item, itemIndex) => listItem(item, dataFor([...sectionPath, 'items', itemIndex])))}
                    </ul>
                  </div>
                  <div>
                    <h3
                      data-sanity={dataFor([...sectionPath, 'whoForHeading'])}
                      style={{
                        fontFamily: 'var(--font-display), Georgia, serif',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#1A1A1A',
                        marginBottom: '16px',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {section.whoForHeading || "Who it's for"}
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
          const launchSize = section.size ?? 'regular';
          const launchBackground = getLightBackgroundColor(section.theme, 'light');

          return (
            <section
              key={key}
              aria-labelledby="launch-heading"
              data-sanity={dataFor(sectionPath)}
              style={{ padding: sectionPadding[launchSize], backgroundColor: launchBackground }}
            >
              <div style={narrow}>
                <div style={{ marginBottom: '40px' }}>
                  <span
                    data-sanity={dataFor([...sectionPath, 'stageNumber'])}
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
                    {section.stageNumber || '02'}
                  </span>
                </div>

                <p className="section-label" data-sanity={dataFor([...sectionPath, 'label'])} style={{ marginBottom: '16px' }}>
                  {section.label || 'Stage 2'}
                </p>
                <h2
                  id="launch-heading"
                  data-sanity={dataFor([...sectionPath, 'heading'])}
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
                  {section.heading || 'Launch & Go-to-Market'}
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
                      data-sanity={dataFor([...sectionPath, 'itemsHeading'])}
                      style={{
                        fontFamily: 'var(--font-display), Georgia, serif',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#1A1A1A',
                        marginBottom: '16px',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {section.itemsHeading || 'What it covers'}
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {items.map((item, itemIndex) => listItem(item, dataFor([...sectionPath, 'items', itemIndex])))}
                    </ul>
                  </div>
                  <div>
                    <h3
                      data-sanity={dataFor([...sectionPath, 'whoForHeading'])}
                      style={{
                        fontFamily: 'var(--font-display), Georgia, serif',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#1A1A1A',
                        marginBottom: '16px',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {section.whoForHeading || "Who it's for"}
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
          const whySize = section.size ?? 'regular';
          const whyBackground = getLightBackgroundColor(section.theme, 'white');

          return (
            <section
              key={key}
              aria-labelledby="why-framework-heading"
              data-sanity={dataFor(sectionPath)}
              style={{ padding: sectionPadding[whySize], backgroundColor: whyBackground }}
            >
              <div style={narrow}>
                <p className="section-label" data-sanity={dataFor([...sectionPath, 'label'])} style={{ marginBottom: '16px' }}>
                  {section.label || 'The Approach'}
                </p>
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
          const linksSize = section.size ?? 'compact';
          const linksBackground = getLightBackgroundColor(section.theme, 'light');

          return (
            <div
              key={key}
              data-sanity={dataFor(sectionPath)}
              style={{
                backgroundColor: linksBackground,
                borderTop: '1px solid #E5E7EB',
                borderBottom: '1px solid #E5E7EB',
                padding: linksSize === 'compact' ? '20px 32px' : sectionPadding[linksSize],
              }}
            >
              <div style={{ ...inner, display: 'flex', flexWrap: 'wrap', gap: '8px 32px', justifyContent: 'center' }}>
                <Link
                  href={section.leftLinkHref || '/about'}
                  data-sanity={dataFor([...sectionPath, 'leftLinkLabel'])}
                  style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}
                  className="breadcrumb-link"
                >
                  {section.leftLinkLabel || 'About Plenor Systems'} →
                </Link>
                <Link
                  href={section.rightLinkHref || '/pricing'}
                  data-sanity={dataFor([...sectionPath, 'rightLinkLabel'])}
                  style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}
                  className="breadcrumb-link"
                >
                  {section.rightLinkLabel || 'Pricing'} →
                </Link>
              </div>
            </div>
          );
        }

        if (section._type === 'servicesCtaSection') {
          const ctaSize = section.size ?? 'regular';
          const ctaBackground = getDarkBackgroundColor(section.theme);

          return (
            <section
              key={key}
              aria-labelledby="services-cta-heading"
              data-sanity={dataFor(sectionPath)}
              style={{
                padding: sectionPadding[ctaSize],
                backgroundColor: ctaBackground,
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
                <Link href={section.ctaHref || '/contact#guide'} className="btn-ghost" data-sanity={dataFor([...sectionPath, 'ctaLabel'])}>
                  {section.ctaLabel || 'Get the Free Guide'}
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
