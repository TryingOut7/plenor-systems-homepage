import type { SectionRendererProps } from './types';
import { asSectionRecord, isDarkTheme, readChecklistArray } from './utils';

export default function LegacyChecklistSection({
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
  const checklistItems = readChecklistArray(sectionRecord.items);
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
      <div style={{ ...innerStyle, maxWidth: '860px' }}>
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
              marginBottom: '20px',
            }}
          >
            {String(sectionRecord.heading)}
          </h2>
        ) : null}

        <div
          style={{
            width: '40px',
            height: '3px',
            backgroundColor: resolvedHeadingColor,
            marginBottom: '40px',
            borderRadius: '2px',
          }}
          aria-hidden="true"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {checklistItems.map((item, itemIndex) => (
            <div
              key={`${sectionKey}-check-${itemIndex}`}
              style={{
                display: 'flex',
                gap: '28px',
                alignItems: 'flex-start',
                padding: '28px 0',
                borderBottom:
                  itemIndex < checklistItems.length - 1
                    ? `1px solid ${
                        theme === 'white' || theme === 'light'
                          ? 'var(--ui-color-border)'
                          : 'rgba(255,255,255,0.2)'
                      }`
                    : 'none',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: dark
                    ? 'var(--ui-color-dark-text)'
                    : 'var(--ui-color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '2px',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke={
                    dark ? 'var(--ui-color-black-bg)' : 'var(--ui-color-dark-text)'
                  }
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="12 3 5.5 9.5 2.5 6.5" />
                </svg>
              </div>
              <div>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: '16px',
                    color: resolvedHeadingColor,
                    marginBottom: '4px',
                  }}
                >
                  {item.title}
                </p>
                <p style={{ fontSize: '15px', color: resolvedBodyColor, lineHeight: 1.65 }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {typeof sectionRecord.footerBody === 'string' && sectionRecord.footerBody.trim() ? (
          <p style={{ fontSize: '15px', color: resolvedBodyColor, lineHeight: 1.65, marginTop: '32px' }}>
            {sectionRecord.footerBody}
          </p>
        ) : null}
      </div>
    </section>
  );
}
