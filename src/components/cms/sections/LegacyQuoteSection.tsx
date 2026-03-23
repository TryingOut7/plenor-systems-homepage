import type { SectionRendererProps } from './types';
import { asSectionRecord, isDarkTheme } from './utils';

export default function LegacyQuoteSection({
  section,
  sectionKey,
  sectionStyle,
  theme,
  innerStyle,
  resolvedHeadingColor,
  resolvedMutedColor,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const dark = isDarkTheme(theme);

  return (
    <section
      key={sectionKey}
      id={typeof sectionRecord.anchorId === 'string' ? sectionRecord.anchorId : undefined}
      style={{
        ...sectionStyle,
        position: 'relative',
        overflow: 'hidden',
      }}
      className={
        typeof sectionRecord.customClassName === 'string'
          ? sectionRecord.customClassName
          : undefined
      }
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-20px',
          left: '20px',
          fontFamily: 'var(--ui-font-display)',
          fontSize: 'clamp(160px, 24vw, 320px)',
          fontWeight: 700,
          lineHeight: 1,
          userSelect: 'none',
          pointerEvents: 'none',
          color: dark ? 'rgba(255,255,255,0.1)' : 'rgba(27,45,79,0.05)',
        }}
      >
        &ldquo;
      </div>

      <div
        style={{
          ...innerStyle,
          maxWidth: '760px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {typeof sectionRecord.sectionLabel === 'string' && sectionRecord.sectionLabel.trim() ? (
          <p className="section-label" style={{ marginBottom: '32px', color: resolvedMutedColor }}>
            {sectionRecord.sectionLabel}
          </p>
        ) : null}

        <h2
          style={{
            fontFamily: 'var(--ui-font-display)',
            fontSize: 'clamp(24px, 3.5vw, 36px)',
            fontWeight: 700,
            color: resolvedHeadingColor,
            lineHeight: 1.35,
            letterSpacing: '-0.02em',
            fontStyle: 'italic',
            maxWidth: '640px',
            margin: '0 auto',
          }}
        >
          {String(sectionRecord.quote || '')}
        </h2>
      </div>
    </section>
  );
}
