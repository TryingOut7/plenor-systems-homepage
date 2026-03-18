'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { createDataAttribute } from '@sanity/visual-editing';
import { useOptimistic } from '@sanity/visual-editing/react';
import GuideForm from '@/components/GuideForm';

type HomeSectionBase = {
  _key?: string;
  _type:
    | 'homeHeroSection'
    | 'homeProblemSection'
    | 'homeWhatWeDoSection'
    | 'homeAudienceSection'
    | 'homeGuideSection';
};

type SectionTheme = 'navy' | 'charcoal' | 'black' | 'white' | 'light';
type SectionSize = 'compact' | 'regular' | 'spacious';

type AudienceItem = {
  _key?: string;
  label?: string;
  copy?: string;
};

export type HomeHeroSection = HomeSectionBase & {
  _type: 'homeHeroSection';
  heading?: string;
  subtext?: string;
  eyebrow?: string;
  ctaLabel?: string;
  ctaHref?: string;
  theme?: SectionTheme;
  size?: SectionSize;
};

export type HomeProblemSection = HomeSectionBase & {
  _type: 'homeProblemSection';
  heading?: string;
  body1?: string;
  body2?: string;
  label?: string;
  theme?: SectionTheme;
  size?: SectionSize;
};

export type HomeWhatWeDoSection = HomeSectionBase & {
  _type: 'homeWhatWeDoSection';
  heading?: string;
  testingCardTitle?: string;
  testingCardBody?: string;
  launchCardTitle?: string;
  launchCardBody?: string;
  label?: string;
  stage1Label?: string;
  stage2Label?: string;
  cardLinkLabel?: string;
  cardLinkHref?: string;
  theme?: SectionTheme;
  size?: SectionSize;
};

export type HomeAudienceSection = HomeSectionBase & {
  _type: 'homeAudienceSection';
  heading?: string;
  audiences?: AudienceItem[];
  label?: string;
  theme?: SectionTheme;
  size?: SectionSize;
};

export type HomeGuideSection = HomeSectionBase & {
  _type: 'homeGuideSection';
  heading?: string;
  body?: string;
  label?: string;
  highlightText?: string;
  theme?: SectionTheme;
  size?: SectionSize;
};

export type HomeSection =
  | HomeHeroSection
  | HomeProblemSection
  | HomeWhatWeDoSection
  | HomeAudienceSection
  | HomeGuideSection;

interface GuideFormLabels {
  submitLabel?: string;
  submittingLabel?: string;
  successHeading?: string;
  successBody?: string;
  footerText?: string;
  namePlaceholder?: string;
  emailPlaceholder?: string;
}

interface HomeSectionsProps {
  documentId: string;
  documentType: string;
  sections: HomeSection[];
  guideFormLabels?: GuideFormLabels;
}

type DataPathSegment = string | number | { _key: string };

const inner: CSSProperties = { maxWidth: '1200px', margin: '0 auto' };

const sectionPadding: Record<SectionSize, string> = {
  compact: '80px 32px',
  regular: '100px 32px',
  spacious: '124px 32px',
};

const heroPadding: Record<SectionSize, string> = {
  compact: '96px 32px 104px',
  regular: '120px 32px 128px',
  spacious: '140px 32px 152px',
};

function getHeroBackgroundColor(theme?: SectionTheme): string {
  if (theme === 'charcoal') return '#1F2937';
  if (theme === 'black') return '#111827';
  return '#1B2D4F';
}

function getLightBackgroundColor(theme: SectionTheme | undefined, fallback: 'white' | 'light'): string {
  if (theme === 'light') return '#F8F9FA';
  if (theme === 'white') return '#ffffff';
  return fallback === 'light' ? '#F8F9FA' : '#ffffff';
}

function isSectionList(value: unknown): value is HomeSection[] {
  return Array.isArray(value);
}

export default function HomeSections({ documentId, documentType, sections, guideFormLabels }: HomeSectionsProps) {
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

        if (section._type === 'homeHeroSection') {
          const heroTheme = getHeroBackgroundColor(section.theme);
          const heroSize = section.size ?? 'regular';

          return (
            <section
              key={key}
              aria-labelledby="hero-heading"
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

              <div style={{ ...inner, position: 'relative', zIndex: 1 }}>
                <p
                  className="section-label animate-fade-in"
                  data-sanity={dataFor([...sectionPath, 'eyebrow'])}
                  style={{
                    color: 'rgba(255,255,255,0.45)',
                    marginBottom: '28px',
                    letterSpacing: '0.14em',
                  }}
                >
                  {section.eyebrow || 'Product Development Framework'}
                </p>

                <h1
                  id="hero-heading"
                  className="animate-fade-up"
                  data-sanity={dataFor([...sectionPath, 'heading'])}
                  style={{
                    fontFamily: 'var(--font-display), Georgia, serif',
                    fontSize: 'clamp(40px, 6vw, 72px)',
                    fontWeight: 700,
                    color: '#ffffff',
                    lineHeight: 1.08,
                    letterSpacing: '-0.03em',
                    marginBottom: '32px',
                    maxWidth: '780px',
                  }}
                >
                  {section.heading}
                </h1>

                <p
                  className="animate-fade-up-delay-1"
                  data-sanity={dataFor([...sectionPath, 'subtext'])}
                  style={{
                    fontSize: '20px',
                    color: 'rgba(255,255,255,0.65)',
                    marginBottom: '48px',
                    lineHeight: 1.55,
                    maxWidth: '520px',
                  }}
                >
                  {section.subtext}
                </p>

                <div className="animate-fade-up-delay-2">
                  <Link href={section.ctaHref || '/contact#guide'} className="btn-ghost" data-sanity={dataFor([...sectionPath, 'ctaLabel'])}>
                    {section.ctaLabel || 'Get the Free Guide'}
                  </Link>
                </div>
              </div>
            </section>
          );
        }

        if (section._type === 'homeProblemSection') {
          const problemSize = section.size ?? 'regular';
          const problemBackground = getLightBackgroundColor(section.theme, 'white');

          return (
            <section
              key={key}
              aria-labelledby="problem-heading"
              data-sanity={dataFor(sectionPath)}
              style={{ padding: sectionPadding[problemSize], backgroundColor: problemBackground }}
            >
              <div style={{ ...inner, maxWidth: '760px' }}>
                <p className="section-label" data-sanity={dataFor([...sectionPath, 'label'])} style={{ marginBottom: '24px' }}>
                  {section.label || 'The Problem'}
                </p>
                <h2
                  id="problem-heading"
                  data-sanity={dataFor([...sectionPath, 'heading'])}
                  style={{
                    fontFamily: 'var(--font-display), Georgia, serif',
                    fontSize: 'clamp(30px, 4vw, 44px)',
                    fontWeight: 700,
                    color: '#1B2D4F',
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em',
                    marginBottom: '28px',
                  }}
                >
                  {section.heading}
                </h2>

                <div
                  style={{
                    width: '40px',
                    height: '3px',
                    backgroundColor: '#1B2D4F',
                    marginBottom: '32px',
                    borderRadius: '2px',
                  }}
                  aria-hidden="true"
                />

                <p
                  data-sanity={dataFor([...sectionPath, 'body1'])}
                  style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.7, marginBottom: '20px' }}
                >
                  {section.body1}
                </p>
                <p
                  data-sanity={dataFor([...sectionPath, 'body2'])}
                  style={{ fontSize: '17px', color: '#6B7280', lineHeight: 1.7 }}
                >
                  {section.body2}
                </p>
              </div>
            </section>
          );
        }

        if (section._type === 'homeWhatWeDoSection') {
          const whatWeDoSize = section.size ?? 'regular';
          const whatWeDoBackground = getLightBackgroundColor(section.theme, 'light');
          const cardLinkLabel = section.cardLinkLabel || 'How it works';
          const cardLinkHref = section.cardLinkHref || '/services';

          return (
            <section
              key={key}
              aria-labelledby="what-we-do-heading"
              data-sanity={dataFor(sectionPath)}
              style={{ padding: sectionPadding[whatWeDoSize], backgroundColor: whatWeDoBackground }}
            >
              <div style={inner}>
                <div style={{ marginBottom: '56px' }}>
                  <p className="section-label" data-sanity={dataFor([...sectionPath, 'label'])} style={{ marginBottom: '12px' }}>
                    {section.label || 'What We Do'}
                  </p>
                  <h2
                    id="what-we-do-heading"
                    data-sanity={dataFor([...sectionPath, 'heading'])}
                    style={{
                      fontFamily: 'var(--font-display), Georgia, serif',
                      fontSize: 'clamp(28px, 4vw, 40px)',
                      fontWeight: 700,
                      color: '#1B2D4F',
                      lineHeight: 1.15,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {section.heading}
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
                    <p id="card-testing-label" className="section-label" data-sanity={dataFor([...sectionPath, 'stage1Label'])} style={{ marginBottom: '16px' }}>
                      {section.stage1Label || 'Stage 1'}
                    </p>
                    <h3
                      data-sanity={dataFor([...sectionPath, 'testingCardTitle'])}
                      style={{
                        fontFamily: 'var(--font-display), Georgia, serif',
                        fontSize: '22px',
                        fontWeight: 700,
                        color: '#1B2D4F',
                        marginBottom: '14px',
                        lineHeight: 1.25,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {section.testingCardTitle}
                    </h3>
                    <p
                      data-sanity={dataFor([...sectionPath, 'testingCardBody'])}
                      style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65, marginBottom: '24px' }}
                    >
                      {section.testingCardBody}
                    </p>
                    <Link
                      href={cardLinkHref}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#1B2D4F',
                        fontWeight: 600,
                        fontSize: '14px',
                        textDecoration: 'none',
                        letterSpacing: '0.01em',
                      }}
                      className="card-link"
                      data-sanity={dataFor([...sectionPath, 'cardLinkLabel'])}
                    >
                      {cardLinkLabel}
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
                    <p id="card-launch-label" className="section-label" data-sanity={dataFor([...sectionPath, 'stage2Label'])} style={{ marginBottom: '16px' }}>
                      {section.stage2Label || 'Stage 2'}
                    </p>
                    <h3
                      data-sanity={dataFor([...sectionPath, 'launchCardTitle'])}
                      style={{
                        fontFamily: 'var(--font-display), Georgia, serif',
                        fontSize: '22px',
                        fontWeight: 700,
                        color: '#1B2D4F',
                        marginBottom: '14px',
                        lineHeight: 1.25,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {section.launchCardTitle}
                    </h3>
                    <p
                      data-sanity={dataFor([...sectionPath, 'launchCardBody'])}
                      style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65, marginBottom: '24px' }}
                    >
                      {section.launchCardBody}
                    </p>
                    <Link
                      href={cardLinkHref}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#1B2D4F',
                        fontWeight: 600,
                        fontSize: '14px',
                        textDecoration: 'none',
                        letterSpacing: '0.01em',
                      }}
                      className="card-link"
                      data-sanity={dataFor([...sectionPath, 'cardLinkLabel'])}
                    >
                      {cardLinkLabel}
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
          );
        }

        if (section._type === 'homeAudienceSection') {
          const audiences = section.audiences ?? [];
          const audienceSize = section.size ?? 'regular';
          const audienceBackground = getLightBackgroundColor(section.theme, 'white');

          return (
            <section
              key={key}
              aria-labelledby="who-heading"
              data-sanity={dataFor(sectionPath)}
              style={{ padding: sectionPadding[audienceSize], backgroundColor: audienceBackground }}
            >
              <div style={inner}>
                <div style={{ marginBottom: '56px' }}>
                  <p className="section-label" data-sanity={dataFor([...sectionPath, 'label'])} style={{ marginBottom: '12px' }}>
                    {section.label || "Who It's For"}
                  </p>
                  <h2
                    id="who-heading"
                    data-sanity={dataFor([...sectionPath, 'heading'])}
                    style={{
                      fontFamily: 'var(--font-display), Georgia, serif',
                      fontSize: 'clamp(28px, 4vw, 40px)',
                      fontWeight: 700,
                      color: '#1B2D4F',
                      lineHeight: 1.15,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {section.heading}
                  </h2>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '0',
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
                          padding: '40px 36px',
                          borderLeft: audienceIndex === 0 ? '1px solid #E5E7EB' : 'none',
                          borderRight: '1px solid #E5E7EB',
                          borderTop: '3px solid transparent',
                          transition: 'border-top-color 0.2s ease, background-color 0.2s ease',
                        }}
                        className="who-card"
                      >
                        <h3
                          data-sanity={dataFor([...audiencePath, 'label'])}
                          style={{
                            fontFamily: 'var(--font-display), Georgia, serif',
                            fontSize: '22px',
                            fontWeight: 700,
                            color: '#1B2D4F',
                            marginBottom: '12px',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {audience.label}
                        </h3>
                        <p
                          data-sanity={dataFor([...audiencePath, 'copy'])}
                          style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65 }}
                        >
                          {audience.copy}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <style>{`
                .who-card:hover { border-top-color: #1B2D4F !important; background-color: #FAFBFC; }
              `}</style>
            </section>
          );
        }

        if (section._type === 'homeGuideSection') {
          const guideSize = section.size ?? 'regular';
          const guideBackground = getHeroBackgroundColor(section.theme);

          return (
            <section
              key={key}
              aria-labelledby="guide-cta-heading"
              id="guide"
              data-sanity={dataFor(sectionPath)}
              style={{
                padding: sectionPadding[guideSize],
                backgroundColor: guideBackground,
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
                <p className="section-label" data-sanity={dataFor([...sectionPath, 'label'])} style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>
                  {section.label || 'Free Resource'}
                </p>
                <h2
                  id="guide-cta-heading"
                  data-sanity={dataFor([...sectionPath, 'heading'])}
                  style={{
                    fontFamily: 'var(--font-display), Georgia, serif',
                    fontSize: 'clamp(28px, 4vw, 40px)',
                    fontWeight: 700,
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    marginBottom: '16px',
                  }}
                >
                  {section.heading}
                </h2>
                <p
                  data-sanity={dataFor([...sectionPath, 'body'])}
                  style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, marginBottom: '48px' }}
                >
                  <strong data-sanity={dataFor([...sectionPath, 'highlightText'])} style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    {section.highlightText || 'The 7 Most Common Product Development Mistakes — and How to Avoid Them.'}
                  </strong>{' '}
                  {section.body}
                </p>

                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    padding: '40px',
                  }}
                >
                  <GuideForm {...guideFormLabels} />
                </div>
              </div>
            </section>
          );
        }

        return null;
      })}
    </>
  );
}
