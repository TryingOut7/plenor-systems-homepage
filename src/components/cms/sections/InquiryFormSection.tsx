import InquiryForm from '@/components/InquiryForm';
import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

export default function InquiryFormSection({
  section,
  sectionKey,
  sectionStyle,
  theme,
  innerStyle,
  inquiryFormLabels,
  resolvedHeadingColor,
  resolvedBodyColor,
  resolvedMutedColor,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const emailAddress =
    typeof sectionRecord.emailAddress === 'string' && sectionRecord.emailAddress.trim()
      ? sectionRecord.emailAddress.trim()
      : '';
  const linkedinHref =
    typeof sectionRecord.linkedinHref === 'string' && sectionRecord.linkedinHref.trim()
      ? sectionRecord.linkedinHref.trim()
      : '';
  const linkedinLabel =
    typeof sectionRecord.linkedinLabel === 'string' && sectionRecord.linkedinLabel.trim()
      ? sectionRecord.linkedinLabel.trim()
      : 'LinkedIn';

  return (
    <section
      key={sectionKey}
      id={typeof sectionRecord.anchorId === 'string' ? sectionRecord.anchorId : undefined}
      style={sectionStyle}
      className={
        typeof sectionRecord.customClassName === 'string'
          ? sectionRecord.customClassName
          : undefined
      }
    >
      <div style={{ ...innerStyle, maxWidth: '860px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '64px',
            alignItems: 'start',
          }}
        >
          <div>
            <p className="section-label" style={{ marginBottom: '16px', color: resolvedMutedColor }}>
              {String(sectionRecord.label || 'Send an inquiry')}
            </p>
            <h2
              style={{
                fontFamily: 'var(--ui-font-display)',
                fontSize: 'clamp(24px, 3vw, 34px)',
                fontWeight: 700,
                color: resolvedHeadingColor,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                marginBottom: '20px',
              }}
            >
              {String(sectionRecord.heading || 'Send a direct inquiry')}
            </h2>
            {sectionRecord.subtext ? (
              <p style={{ fontSize: '15px', color: resolvedBodyColor, lineHeight: 1.65, marginBottom: '32px' }}>
                {String(sectionRecord.subtext)}
              </p>
            ) : null}

            <div
              style={{
                padding: '20px 24px',
                backgroundColor:
                  theme === 'white' || theme === 'light'
                    ? 'var(--ui-color-section-alt)'
                    : 'rgba(255,255,255,0.08)',
                borderLeft: '3px solid var(--ui-color-primary)',
                borderRadius: '0 var(--ui-button-radius) var(--ui-button-radius) 0',
                marginBottom: '28px',
              }}
            >
              <p
                style={{
                  fontWeight: 600,
                  fontSize: '14px',
                  color: resolvedHeadingColor,
                  marginBottom: '6px',
                }}
              >
                {String(sectionRecord.nextStepsLabel || 'What happens next')}
              </p>
              <p style={{ fontSize: '14px', color: resolvedBodyColor, lineHeight: 1.6 }}>
                {String(
                  sectionRecord.nextStepsBody ||
                    'We review every inquiry and respond within 2 business days.',
                )}
              </p>
            </div>

            {(emailAddress || linkedinHref) ? (
              <div>
                <p style={{ fontWeight: 600, fontSize: '14px', color: resolvedHeadingColor, marginBottom: '8px' }}>
                  {String(sectionRecord.directEmailLabel || 'Prefer email directly?')}
                </p>
                {emailAddress ? (
                  <a
                    href={`mailto:${emailAddress}`}
                    style={{
                      color: resolvedHeadingColor,
                      fontWeight: 600,
                      fontSize: '14px',
                      textDecoration: 'none',
                    }}
                    className="text-link"
                  >
                    {emailAddress}
                  </a>
                ) : null}
                {(emailAddress && linkedinHref) ? (
                  <span style={{ color: resolvedMutedColor, margin: '0 10px' }}>|</span>
                ) : null}
                {linkedinHref ? (
                  <a
                    href={linkedinHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: resolvedHeadingColor,
                      fontWeight: 600,
                      fontSize: '14px',
                      textDecoration: 'none',
                    }}
                    className="text-link"
                  >
                    {linkedinLabel}
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          <div
            style={{
              backgroundColor: 'var(--ui-color-surface)',
              border: '1px solid var(--ui-color-border)',
              borderTop: '3px solid var(--ui-color-primary)',
              borderRadius: 'var(--ui-button-radius)',
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
