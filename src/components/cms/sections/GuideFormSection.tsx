import GuideForm from '@/components/GuideForm';
import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

export default function GuideFormSection({
  section,
  sectionKey,
  sectionStyle,
  innerStyle,
  guideFormLabels,
  resolvedHeadingColor,
  resolvedBodyColor,
  resolvedMutedColor,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);

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
              {String(sectionRecord.label || 'Free resource')}
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
              {String(sectionRecord.heading || 'Get the free guide')}
            </h2>
            <div
              style={{
                width: '32px',
                height: '3px',
                backgroundColor: resolvedHeadingColor,
                marginBottom: '24px',
                borderRadius: '2px',
              }}
              aria-hidden="true"
            />
            {sectionRecord.highlightText ? (
              <p style={{ fontSize: '16px', color: resolvedBodyColor, lineHeight: 1.7, marginBottom: '16px' }}>
                <strong style={{ color: resolvedHeadingColor, fontWeight: 600 }}>
                  {String(sectionRecord.highlightText)}
                </strong>
              </p>
            ) : null}
            {sectionRecord.body ? (
              <p style={{ fontSize: '15px', color: resolvedBodyColor, lineHeight: 1.65 }}>
                {String(sectionRecord.body)}
              </p>
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
            <GuideForm
              {...guideFormLabels}
              templateId={
                sectionRecord.emailTemplate != null
                  ? typeof sectionRecord.emailTemplate === 'object' &&
                    sectionRecord.emailTemplate !== null
                    ? (sectionRecord.emailTemplate as { id?: string | number }).id
                    : (sectionRecord.emailTemplate as string | number)
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
