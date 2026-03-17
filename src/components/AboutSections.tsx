'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { createDataAttribute } from '@sanity/visual-editing';
import { useOptimistic } from '@sanity/visual-editing/react';

type AboutSectionBase = {
  _key?: string;
  _type:
    | 'aboutHeroSection'
    | 'aboutFocusSection'
    | 'aboutMissionSection'
    | 'aboutFounderSection'
    | 'aboutCtaSection';
};

export type AboutHeroSection = AboutSectionBase & {
  _type: 'aboutHeroSection';
  label?: string;
  heading?: string;
  paragraphs?: string[];
};

export type AboutFocusSection = AboutSectionBase & {
  _type: 'aboutFocusSection';
  label?: string;
  heading?: string;
  paragraphs?: string[];
  linkLabel?: string;
  linkHref?: string;
};

export type AboutMissionSection = AboutSectionBase & {
  _type: 'aboutMissionSection';
  label?: string;
  quote?: string;
};

export type AboutFounderSection = AboutSectionBase & {
  _type: 'aboutFounderSection';
  label?: string;
  heading?: string;
  founderName?: string;
  founderRole?: string;
  founderBio?: string;
};

export type AboutCtaSection = AboutSectionBase & {
  _type: 'aboutCtaSection';
  heading?: string;
  body?: string;
  primaryButtonLabel?: string;
  primaryButtonHref?: string;
  secondaryButtonLabel?: string;
  secondaryButtonHref?: string;
};

export type AboutSection =
  | AboutHeroSection
  | AboutFocusSection
  | AboutMissionSection
  | AboutFounderSection
  | AboutCtaSection;

interface AboutSectionsProps {
  documentId: string;
  documentType: string;
  sections: AboutSection[];
}

type DataPathSegment = string | number | { _key: string };

const inner: CSSProperties = { maxWidth: '1200px', margin: '0 auto' };
const narrow: CSSProperties = { maxWidth: '760px', margin: '0 auto' };

function isSectionList(value: unknown): value is AboutSection[] {
  return Array.isArray(value);
}

export default function AboutSections({
  documentId,
  documentType,
  sections,
}: AboutSectionsProps) {
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

        if (section._type === 'aboutHeroSection') {
          const paragraphs = section.paragraphs ?? [];

          return (
            <section
              key={key}
              aria-labelledby="about-hero-heading"
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
              <div style={{ ...narrow, position: 'relative', zIndex: 1 }}>
                <p
                  className="section-label animate-fade-in"
                  data-sanity={dataFor([...sectionPath, 'label'])}
                  style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '24px' }}
                >
                  {section.label || 'About'}
                </p>
                <h1
                  id="about-hero-heading"
                  className="animate-fade-up"
                  data-sanity={dataFor([...sectionPath, 'heading'])}
                  style={{
                    fontFamily: 'var(--font-display), Georgia, serif',
                    fontSize: 'clamp(36px, 5.5vw, 60px)',
                    fontWeight: 700,
                    color: '#ffffff',
                    lineHeight: 1.1,
                    letterSpacing: '-0.03em',
                    marginBottom: '32px',
                  }}
                >
                  {section.heading || 'Who we are'}
                </h1>
                {paragraphs.map((paragraph, paragraphIndex) => (
                  <p
                    key={paragraphIndex}
                    className={paragraphIndex === 0 ? 'animate-fade-up-delay-1' : 'animate-fade-up-delay-2'}
                    data-sanity={dataFor([...sectionPath, 'paragraphs', paragraphIndex])}
                    style={{
                      fontSize: '17px',
                      color: 'rgba(255,255,255,0.65)',
                      lineHeight: 1.7,
                      marginBottom: paragraphIndex === paragraphs.length - 1 ? '0' : '20px',
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          );
        }

        if (section._type === 'aboutFocusSection') {
          const paragraphs = section.paragraphs ?? [];

          return (
            <section
              key={key}
              aria-labelledby="focus-heading"
              data-sanity={dataFor(sectionPath)}
              style={{ padding: '100px 32px', backgroundColor: '#ffffff' }}
            >
              <div style={narrow}>
                <p
                  className="section-label"
                  data-sanity={dataFor([...sectionPath, 'label'])}
                  style={{ marginBottom: '16px' }}
                >
                  {section.label || 'Our Focus'}
                </p>
                <h2
                  id="focus-heading"
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
                  {section.heading || 'Narrow by design. Deep by necessity.'}
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
                {paragraphs.map((paragraph, paragraphIndex) => (
                  <p
                    key={paragraphIndex}
                    data-sanity={dataFor([...sectionPath, 'paragraphs', paragraphIndex])}
                    style={{
                      fontSize: '17px',
                      color: '#6B7280',
                      lineHeight: 1.7,
                      marginBottom: paragraphIndex === paragraphs.length - 1 ? '36px' : '20px',
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
                <Link
                  href={section.linkHref || '/services'}
                  data-sanity={dataFor([...sectionPath, 'linkLabel'])}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#1B2D4F',
                    fontWeight: 600,
                    fontSize: '15px',
                    textDecoration: 'none',
                  }}
                  className="text-link"
                >
                  {section.linkLabel || 'See how the two stages work ->'}
                </Link>
              </div>
            </section>
          );
        }

        if (section._type === 'aboutMissionSection') {
          return (
            <section
              key={key}
              aria-labelledby="mission-heading"
              data-sanity={dataFor(sectionPath)}
              style={{
                padding: '100px 32px',
                backgroundColor: '#F8F9FA',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '20px',
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: 'clamp(160px, 24vw, 320px)',
                  fontWeight: 700,
                  color: 'rgba(27,45,79,0.05)',
                  lineHeight: 1,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              >
                &ldquo;
              </div>
              <div style={{ ...narrow, position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <p
                  className="section-label"
                  data-sanity={dataFor([...sectionPath, 'label'])}
                  style={{ marginBottom: '32px' }}
                >
                  {section.label || 'What we believe'}
                </p>
                <h2
                  id="mission-heading"
                  data-sanity={dataFor([...sectionPath, 'quote'])}
                  style={{
                    fontFamily: 'var(--font-display), Georgia, serif',
                    fontSize: 'clamp(24px, 3.5vw, 36px)',
                    fontWeight: 700,
                    color: '#1B2D4F',
                    lineHeight: 1.35,
                    letterSpacing: '-0.02em',
                    fontStyle: 'italic',
                    maxWidth: '640px',
                    margin: '0 auto',
                  }}
                >
                  {section.quote}
                </h2>
              </div>
            </section>
          );
        }

        if (section._type === 'aboutFounderSection' && section.founderName) {
          return (
            <section
              key={key}
              aria-labelledby="team-heading"
              data-sanity={dataFor(sectionPath)}
              style={{ padding: '100px 32px', backgroundColor: '#ffffff' }}
            >
              <div style={narrow}>
                <p
                  className="section-label"
                  data-sanity={dataFor([...sectionPath, 'label'])}
                  style={{ marginBottom: '16px' }}
                >
                  {section.label || 'The Team'}
                </p>
                <h2
                  id="team-heading"
                  data-sanity={dataFor([...sectionPath, 'heading'])}
                  style={{
                    fontFamily: 'var(--font-display), Georgia, serif',
                    fontSize: 'clamp(26px, 3.5vw, 38px)',
                    fontWeight: 700,
                    color: '#1B2D4F',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    marginBottom: '40px',
                  }}
                >
                  {section.heading || 'The people behind the framework.'}
                </h2>
                <div
                  style={{
                    display: 'flex',
                    gap: '28px',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    padding: '36px',
                    border: '1px solid #E5E7EB',
                    borderTop: '3px solid #1B2D4F',
                    borderRadius: '4px',
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: '#E5E7EB',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-hidden="true"
                  >
                    <svg
                      width="26"
                      height="26"
                      fill="none"
                      stroke="#6B7280"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p
                      data-sanity={dataFor([...sectionPath, 'founderName'])}
                      style={{
                        fontFamily: 'var(--font-display), Georgia, serif',
                        fontWeight: 700,
                        fontSize: '18px',
                        color: '#1A1A1A',
                        letterSpacing: '-0.01em',
                        marginBottom: '4px',
                      }}
                    >
                      {section.founderName}
                    </p>
                    <p
                      data-sanity={dataFor([...sectionPath, 'founderRole'])}
                      style={{
                        fontSize: '13px',
                        color: '#6B7280',
                        marginBottom: '12px',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {section.founderRole} · Plenor Systems
                    </p>
                    <p
                      data-sanity={dataFor([...sectionPath, 'founderBio'])}
                      style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65 }}
                    >
                      {section.founderBio}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        if (section._type === 'aboutCtaSection') {
          return (
            <section
              key={key}
              aria-labelledby="about-cta-heading"
              data-sanity={dataFor(sectionPath)}
              style={{
                padding: '100px 32px',
                backgroundColor: '#1B2D4F',
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
              <div
                style={{
                  ...inner,
                  maxWidth: '600px',
                  textAlign: 'center',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <h2
                  id="about-cta-heading"
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
                  {section.heading || 'Want to work together?'}
                </h2>
                <p
                  data-sanity={dataFor([...sectionPath, 'body'])}
                  style={{
                    fontSize: '17px',
                    color: 'rgba(255,255,255,0.65)',
                    lineHeight: 1.65,
                    marginBottom: '36px',
                  }}
                >
                  {section.body || 'Get in touch to discuss your product and team, or start with the free guide.'}
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link
                    href={section.primaryButtonHref || '/contact'}
                    data-sanity={dataFor([...sectionPath, 'primaryButtonLabel'])}
                    className="btn-ghost"
                  >
                    {section.primaryButtonLabel || 'Get in touch'}
                  </Link>
                  <Link
                    href={section.secondaryButtonHref || '/contact#guide'}
                    data-sanity={dataFor([...sectionPath, 'secondaryButtonLabel'])}
                    style={{
                      display: 'inline-block',
                      color: 'rgba(255,255,255,0.75)',
                      fontSize: '15px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      padding: '14px 32px',
                      border: '1.5px solid rgba(255,255,255,0.3)',
                      borderRadius: '4px',
                      transition: 'color 0.2s ease, border-color 0.2s ease',
                    }}
                    className="ghost-outline"
                  >
                    {section.secondaryButtonLabel || 'Get the free guide'}
                  </Link>
                </div>
              </div>
            </section>
          );
        }

        return null;
      })}

      <style>{`
        .text-link:hover { opacity: 0.75; }
        .ghost-outline:hover { color: #ffffff !important; border-color: rgba(255,255,255,0.6) !important; }
      `}</style>
    </>
  );
}
