'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { createDataAttribute } from '@sanity/visual-editing';
import { useOptimistic } from '@sanity/visual-editing/react';
import GuideForm from '@/components/GuideForm';
import InquiryForm from '@/components/InquiryForm';

type ContactSectionBase = {
  _key?: string;
  _type: 'contactHeroSection' | 'contactGuideSection' | 'contactInquirySection' | 'contactPrivacySection';
};

export type ContactHeroSection = ContactSectionBase & {
  _type: 'contactHeroSection';
  heading?: string;
  subtext?: string;
};

export type ContactGuideSection = ContactSectionBase & {
  _type: 'contactGuideSection';
  heading?: string;
  body?: string;
};

export type ContactInquirySection = ContactSectionBase & {
  _type: 'contactInquirySection';
  heading?: string;
  subtext?: string;
};

export type ContactPrivacySection = ContactSectionBase & {
  _type: 'contactPrivacySection';
  label?: string;
};

export type ContactSection =
  | ContactHeroSection
  | ContactGuideSection
  | ContactInquirySection
  | ContactPrivacySection;

interface ContactSectionsProps {
  documentId: string;
  documentType: string;
  sections: ContactSection[];
}

type DataPathSegment = string | number | { _key: string };

const inner: CSSProperties = { maxWidth: '1200px', margin: '0 auto' };

function isSectionList(value: unknown): value is ContactSection[] {
  return Array.isArray(value);
}

export default function ContactSections({ documentId, documentType, sections }: ContactSectionsProps) {
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

        if (section._type === 'contactHeroSection') {
          return (
            <section
              key={key}
              aria-labelledby="contact-hero-heading"
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
              <div style={{ maxWidth: '680px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <p className="section-label animate-fade-in" style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '24px' }}>
                  Contact
                </p>
                <h1
                  id="contact-hero-heading"
                  className="animate-fade-up"
                  data-sanity={dataFor([...sectionPath, 'heading'])}
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

        if (section._type === 'contactGuideSection') {
          return (
            <section
              key={key}
              id="guide"
              aria-labelledby="guide-form-heading"
              data-sanity={dataFor(sectionPath)}
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
                    <p className="section-label" style={{ marginBottom: '16px' }}>Free resource</p>
                    <h2
                      id="guide-form-heading"
                      data-sanity={dataFor([...sectionPath, 'heading'])}
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
                      {section.heading}
                    </h2>
                    <div style={{ width: '32px', height: '3px', backgroundColor: '#1B2D4F', marginBottom: '24px', borderRadius: '2px' }} aria-hidden="true" />
                    <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.7, marginBottom: '16px' }}>
                      <strong style={{ color: '#1A1A1A', fontWeight: 600 }}>
                        The 7 Most Common Product Development Mistakes — and How to Avoid Them.
                      </strong>
                    </p>
                    <p data-sanity={dataFor([...sectionPath, 'body'])} style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65 }}>
                      {section.body}
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
                    <GuideForm />
                  </div>
                </div>
              </div>
            </section>
          );
        }

        if (section._type === 'contactInquirySection') {
          return (
            <section
              key={key}
              aria-labelledby="inquiry-form-heading"
              data-sanity={dataFor(sectionPath)}
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
                    <p className="section-label" style={{ marginBottom: '16px' }}>Send an inquiry</p>
                    <h2
                      id="inquiry-form-heading"
                      data-sanity={dataFor([...sectionPath, 'heading'])}
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
                      {section.heading}
                    </h2>
                    <div style={{ width: '32px', height: '3px', backgroundColor: '#1B2D4F', marginBottom: '24px', borderRadius: '2px' }} aria-hidden="true" />
                    <p data-sanity={dataFor([...sectionPath, 'subtext'])} style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65, marginBottom: '32px' }}>
                      {section.subtext}
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
                        What happens next
                      </p>
                      <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
                        We review every inquiry and respond within 2 business days with initial thoughts or a proposal request.
                      </p>
                    </div>

                    <div>
                      <p style={{ fontWeight: 600, fontSize: '14px', color: '#1A1A1A', marginBottom: '8px' }}>
                        Prefer email directly?
                      </p>
                      <a
                        href="mailto:hello@plenor.ai"
                        style={{ color: '#1B2D4F', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}
                        className="text-link"
                      >
                        hello@plenor.ai
                      </a>
                      <span style={{ color: '#E5E7EB', margin: '0 10px' }}>·</span>
                      <a
                        href="https://www.linkedin.com/company/plenor-ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'none' }}
                        className="text-link"
                      >
                        LinkedIn →
                      </a>
                    </div>
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
                    <InquiryForm />
                  </div>
                </div>
              </div>
            </section>
          );
        }

        if (section._type === 'contactPrivacySection') {
          return (
            <div
              key={key}
              data-sanity={dataFor(sectionPath)}
              style={{
                backgroundColor: '#F8F9FA',
                borderTop: '1px solid #E5E7EB',
                padding: '20px 32px',
                textAlign: 'center',
              }}
            >
              <p data-sanity={dataFor([...sectionPath, 'label'])} style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>
                {section.label || 'By submitting this form, you agree to our'}{' '}
                <Link href="/privacy" style={{ color: '#6B7280', textDecoration: 'underline' }}>
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          );
        }

        return null;
      })}

      <style>{`
        .text-link:hover { opacity: 0.75; }
      `}</style>
    </>
  );
}
