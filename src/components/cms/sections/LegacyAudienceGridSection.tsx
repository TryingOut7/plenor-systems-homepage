import type { SectionRendererProps } from './types';
import { asSectionRecord, readAudienceArray } from './utils';

export default function LegacyAudienceGridSection({
  section,
  sectionKey,
  sectionStyle,
  theme,
  innerStyle,
  resolvedHeadingColor,
  resolvedBodyColor,
  resolvedMutedColor,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const audiences = readAudienceArray(sectionRecord.audiences);

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
      <div style={{ ...innerStyle, maxWidth: '900px' }}>
        {typeof sectionRecord.sectionLabel === 'string' && sectionRecord.sectionLabel.trim() ? (
          <p className="section-label" style={{ marginBottom: '16px', color: resolvedMutedColor }}>
            {sectionRecord.sectionLabel}
          </p>
        ) : null}

        {sectionRecord.heading ? (
          <h2
            style={{
              fontFamily: 'var(--ui-font-display)',
              fontSize: 'clamp(26px, 3.5vw, 38px)',
              fontWeight: 700,
              color: resolvedHeadingColor,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              marginBottom: '40px',
            }}
          >
            {String(sectionRecord.heading)}
          </h2>
        ) : null}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2px',
            backgroundColor:
              theme === 'white' || theme === 'light'
                ? 'var(--ui-color-border)'
                : 'rgba(255,255,255,0.2)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          {audiences.map((audience, audienceIndex) => (
            <div
              key={`${sectionKey}-audience-${audienceIndex}`}
              style={{
                backgroundColor:
                  theme === 'white' || theme === 'light'
                    ? 'var(--ui-color-surface)'
                    : 'rgba(0,0,0,0.1)',
                padding: '32px 28px',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--ui-font-display)',
                  fontWeight: 700,
                  fontSize: '20px',
                  color: resolvedHeadingColor,
                  marginBottom: '10px',
                  letterSpacing: '-0.01em',
                }}
              >
                {audience.label}
              </p>
              <p style={{ fontSize: '14px', color: resolvedBodyColor, lineHeight: 1.65 }}>
                {audience.copy}
              </p>
            </div>
          ))}
        </div>

        {typeof sectionRecord.footerText === 'string' && sectionRecord.footerText.trim() ? (
          <p style={{ fontSize: '14px', color: resolvedBodyColor, marginTop: '20px' }}>
            {sectionRecord.footerText}
          </p>
        ) : null}
      </div>
    </section>
  );
}
