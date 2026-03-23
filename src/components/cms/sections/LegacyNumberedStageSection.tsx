import type { SectionRendererProps } from './types';
import { asSectionRecord, isDarkTheme, readItemArray } from './utils';

export default function LegacyNumberedStageSection({
  section,
  sectionKey,
  sectionStyle,
  theme,
  innerStyle,
  resolvedHeadingColor,
  resolvedBodyColor,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const items = readItemArray(sectionRecord.items);
  const dark = isDarkTheme(theme);

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
      <div style={{ ...innerStyle, maxWidth: '760px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '40px' }}>
          <span
            aria-hidden="true"
            style={{
              fontFamily: 'var(--ui-font-display)',
              fontSize: 'clamp(80px, 12vw, 140px)',
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              marginLeft: '-4px',
              userSelect: 'none',
              color: dark ? 'rgba(255,255,255,0.12)' : 'rgba(27,45,79,0.07)',
            }}
          >
            {String(sectionRecord.stageNumber || '01')}
          </span>
        </div>

        <p className="section-label" style={{ marginBottom: '16px', color: resolvedBodyColor }}>
          {String(sectionRecord.stageLabel || 'Stage')}
        </p>
        <h2
          style={{
            fontFamily: 'var(--ui-font-display)',
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 700,
            color: resolvedHeadingColor,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '20px',
          }}
        >
          {String(sectionRecord.heading || '')}
        </h2>
        <div
          style={{
            width: '40px',
            height: '3px',
            backgroundColor: resolvedHeadingColor,
            marginBottom: '28px',
            borderRadius: '2px',
          }}
          aria-hidden="true"
        />

        {sectionRecord.body ? (
          <p style={{ fontSize: '17px', color: resolvedBodyColor, lineHeight: 1.7, marginBottom: '36px' }}>
            {String(sectionRecord.body)}
          </p>
        ) : null}

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
                fontFamily: 'var(--ui-font-display)',
                fontSize: '18px',
                fontWeight: 700,
                color: resolvedHeadingColor,
                marginBottom: '16px',
                letterSpacing: '-0.01em',
              }}
            >
              What it covers
            </h3>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {items.map((item) => (
                <li
                  key={`${sectionKey}-${item}`}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start',
                    fontSize: '16px',
                    color: resolvedBodyColor,
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
                      backgroundColor: dark
                        ? 'var(--ui-color-dark-text)'
                        : 'var(--ui-color-primary)',
                      display: 'inline-block',
                    }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {sectionRecord.whoForBody ? (
            <div
              style={{
                backgroundColor:
                  theme === 'white' || theme === 'light'
                    ? 'var(--ui-color-section-alt)'
                    : 'rgba(255,255,255,0.08)',
                borderLeft: `3px solid ${
                  dark ? 'var(--ui-color-dark-text)' : 'var(--ui-color-primary)'
                }`,
                borderRadius: '0 var(--ui-button-radius) var(--ui-button-radius) 0',
                padding: '20px 24px',
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
                {String(sectionRecord.whoForHeading || 'Who it is for')}
              </p>
              <p style={{ fontSize: '14px', color: resolvedBodyColor, lineHeight: 1.6 }}>
                {String(sectionRecord.whoForBody)}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
