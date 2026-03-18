'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import GuideForm from '@/components/GuideForm';
import InquiryForm from '@/components/InquiryForm';

type ContactSectionBase = {
  _key?: string;
  _type: 'contactHeroSection' | 'contactGuideSection' | 'contactInquirySection' | 'contactPrivacySection';
};

type SectionTheme = 'navy' | 'charcoal' | 'black' | 'white' | 'light';
type SectionSize = 'compact' | 'regular' | 'spacious';

export type ContactHeroSection = ContactSectionBase & {
  _type: 'contactHeroSection';
  label?: string;
  heading?: string;
  subtext?: string;
  theme?: SectionTheme;
  size?: SectionSize;
};

export type ContactGuideSection = ContactSectionBase & {
  _type: 'contactGuideSection';
  label?: string;
  heading?: string;
  highlightText?: string;
  body?: string;
  theme?: SectionTheme;
  size?: SectionSize;
};

export type ContactInquirySection = ContactSectionBase & {
  _type: 'contactInquirySection';
  label?: string;
  heading?: string;
  subtext?: string;
  nextStepsLabel?: string;
  nextStepsBody?: string;
  directEmailLabel?: string;
  emailAddress?: string;
  linkedinLabel?: string;
  linkedinHref?: string;
  theme?: SectionTheme;
  size?: SectionSize;
};

export type ContactPrivacySection = ContactSectionBase & {
  _type: 'contactPrivacySection';
  label?: string;
  policyLinkLabel?: string;
  policyLinkHref?: string;
  theme?: SectionTheme;
  size?: SectionSize;
};

export type ContactSection =
  | ContactHeroSection
  | ContactGuideSection
  | ContactInquirySection
  | ContactPrivacySection;

interface FormLabels {
  submitLabel?: string;
  submittingLabel?: string;
  successHeading?: string;
  successBody?: string;
  footerText?: string;
  consentText?: string;
  namePlaceholder?: string;
  emailPlaceholder?: string;
  companyPlaceholder?: string;
  challengePlaceholder?: string;
}

interface ContactSectionsProps {
  documentId: string;
  documentType: string;
  sections: ContactSection[];
  guideFormLabels?: FormLabels;
  inquiryFormLabels?: FormLabels;
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

export default function ContactSections({ documentId, documentType, sections, guideFormLabels, inquiryFormLabels }: ContactSectionsProps) {
  return (
    <>
      {sections.map((section, index) => {
        const key = section._key ?? `${section._type}-${index}`;

        if (section._type === 'contactHeroSection') {
          const heroTheme = getDarkBackgroundColor(section.theme);
          const heroSize = section.size ?? 'regular';

          return (
            <section
              key={key}
              aria-labelledby="contact-hero-heading"
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
              <div style={{ maxWidth: '680px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <p
                  className="section-label animate-fade-in"
                  style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '24px' }}
                >
                  {section.label || 'Contact'}
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
                  {section.heading}
                </h1>
                <p
                  className="animate-fade-up-delay-1"
                  style={{ fontSize: '18px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}
                >
                  {section.subtext}
                </p>
              </div>
            </section>
          );
        }

        if (section._type === 'contactGuideSection') {
          const guideSize = section.size ?? 'regular';
          const guideBackground = getLightBackgroundColor(section.theme, 'light');

          return (
            <section
              key={key}
              id="guide"
              aria-labelledby="guide-form-heading"
              style={{ padding: sectionPadding[guideSize], backgroundColor: guideBackground }}
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
                    <p className="section-label" style={{ marginBottom: '16px' }}>
                      {section.label || 'Free resource'}
                    </p>
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
                      {section.heading}
                    </h2>
                    <div style={{ width: '32px', height: '3px', backgroundColor: '#1B2D4F', marginBottom: '24px', borderRadius: '2px' }} aria-hidden="true" />
                    <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.7, marginBottom: '16px' }}>
                      <strong style={{ color: '#1A1A1A', fontWeight: 600 }}>
                        {section.highlightText || 'The 7 Most Common Product Development Mistakes — and How to Avoid Them.'}
                      </strong>
                    </p>
                    <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65 }}>
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
                    <GuideForm {...guideFormLabels} />
                  </div>
                </div>
              </div>
            </section>
          );
        }

        if (section._type === 'contactInquirySection') {
          const inquirySize = section.size ?? 'regular';
          const inquiryBackground = getLightBackgroundColor(section.theme, 'white');
          const emailAddress = section.emailAddress || 'hello@plenor.ai';

          return (
            <section
              key={key}
              aria-labelledby="inquiry-form-heading"
              style={{ padding: sectionPadding[inquirySize], backgroundColor: inquiryBackground }}
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
                    <p className="section-label" style={{ marginBottom: '16px' }}>
                      {section.label || 'Send an inquiry'}
                    </p>
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
                      {section.heading}
                    </h2>
                    <div style={{ width: '32px', height: '3px', backgroundColor: '#1B2D4F', marginBottom: '24px', borderRadius: '2px' }} aria-hidden="true" />
                    <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.65, marginBottom: '32px' }}>
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
                        {section.nextStepsLabel || 'What happens next'}
                      </p>
                      <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
                        {section.nextStepsBody || 'We review every inquiry and respond within 2 business days with initial thoughts or a proposal request.'}
                      </p>
                    </div>

                    <div>
                      <p style={{ fontWeight: 600, fontSize: '14px', color: '#1A1A1A', marginBottom: '8px' }}>
                        {section.directEmailLabel || 'Prefer email directly?'}
                      </p>
                      <a
                        href={`mailto:${emailAddress}`}
                        style={{ color: '#1B2D4F', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}
                        className="text-link"
                      >
                        {emailAddress}
                      </a>
                      <span style={{ color: '#E5E7EB', margin: '0 10px' }}>·</span>
                      <a
                        href={section.linkedinHref || 'https://www.linkedin.com/company/plenor-ai'}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'none' }}
                        className="text-link"
                      >
                        {section.linkedinLabel || 'LinkedIn →'}
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
                    <InquiryForm {...inquiryFormLabels} />
                  </div>
                </div>
              </div>
            </section>
          );
        }

        if (section._type === 'contactPrivacySection') {
          const privacySize = section.size ?? 'compact';
          const privacyBackground = getLightBackgroundColor(section.theme, 'light');

          return (
            <div
              key={key}
              style={{
                backgroundColor: privacyBackground,
                borderTop: '1px solid #E5E7EB',
                padding: privacySize === 'compact' ? '20px 32px' : sectionPadding[privacySize],
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>
                {section.label || 'By submitting this form, you agree to our'}{' '}
                <Link href={section.policyLinkHref || '/privacy'} style={{ color: '#6B7280', textDecoration: 'underline' }}>
                  {section.policyLinkLabel || 'Privacy Policy'}
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
