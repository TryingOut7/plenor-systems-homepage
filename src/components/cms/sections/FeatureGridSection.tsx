import Link from 'next/link';
import SectionHeading from './shared/SectionHeading';
import type { SectionRendererProps } from './types';
import { asSectionRecord, isDarkTheme, mutedColor, normalizePath } from './utils';

export default function FeatureGridSection({
  section,
  sectionKey,
  sectionStyle,
  theme,
  hTag,
  hSize,
  hFontSize,
  innerStyle,
  resolvedHeadingColor,
  resolvedBodyColor,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const features = Array.isArray(sectionRecord.features) ? sectionRecord.features : [];
  const cols = sectionRecord.columns === '2' ? 2 : sectionRecord.columns === '4' ? 4 : 3;
  const minColWidth = cols === 2 ? '300px' : cols === 4 ? '220px' : '260px';

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
      <div style={innerStyle}>
        {typeof sectionRecord.sectionLabel === 'string' && sectionRecord.sectionLabel ? (
          <p
            className="section-label"
            style={{ color: mutedColor(theme), marginBottom: '12px' }}
          >
            {sectionRecord.sectionLabel}
          </p>
        ) : null}

        {sectionRecord.heading ? (
          <SectionHeading
            tag={hTag}
            style={{
              fontFamily: 'var(--ui-font-display)',
              fontSize: hSize === 'md' ? 'clamp(26px, 3.5vw, 38px)' : hFontSize,
              fontWeight: 700,
              color: resolvedHeadingColor,
              marginBottom: '12px',
            }}
          >
            {String(sectionRecord.heading)}
          </SectionHeading>
        ) : null}

        {sectionRecord.subheading ? (
          <p style={{ color: resolvedBodyColor, fontSize: '16px', marginBottom: '40px' }}>
            {String(sectionRecord.subheading)}
          </p>
        ) : null}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(${minColWidth}, 1fr))`,
            gap: '24px',
          }}
        >
          {features.map((feature: unknown, featureIndex: number) => {
            const f = feature as {
              icon?: string;
              title?: string;
              description?: string;
              linkLabel?: string;
              linkHref?: string;
            };

            return (
              <article
                key={`${sectionKey}-feature-${featureIndex}`}
                className="feature-card"
                style={{
                  backgroundColor: isDarkTheme(theme)
                    ? 'rgba(255,255,255,0.06)'
                    : 'var(--ui-color-surface)',
                  border: `1px solid ${
                    isDarkTheme(theme)
                      ? 'rgba(255,255,255,0.12)'
                      : 'var(--ui-color-border)'
                  }`,
                  borderRadius: 'var(--ui-card-radius, 8px)',
                  padding: '28px 24px',
                }}
              >
                {f.icon ? (
                  <div style={{ fontSize: '32px', marginBottom: '16px' }} aria-hidden="true">
                    {f.icon}
                  </div>
                ) : null}
                <h3
                  style={{
                    fontFamily: 'var(--ui-font-display)',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: resolvedHeadingColor,
                    marginBottom: '8px',
                  }}
                >
                  {String(f.title || '')}
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: resolvedBodyColor,
                    lineHeight: 1.65,
                    margin: 0,
                    marginBottom: f.linkLabel ? '16px' : 0,
                  }}
                >
                  {String(f.description || '')}
                </p>
                {typeof f.linkLabel === 'string' && f.linkLabel.trim() ? (
                  <Link
                    href={normalizePath(String(f.linkHref || '#'))}
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: resolvedHeadingColor,
                      textDecoration: 'none',
                    }}
                    className="text-link"
                  >
                    {f.linkLabel} →
                  </Link>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
