import SectionHeading from './shared/SectionHeading';
import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

export default function StatsSection({
  section,
  sectionKey,
  sectionStyle,
  hTag,
  hSize,
  hFontSize,
  innerStyle,
  resolvedHeadingColor,
  resolvedBodyColor,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const stats = Array.isArray(sectionRecord.stats) ? sectionRecord.stats : [];

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
            style={{ color: resolvedBodyColor, marginBottom: '12px' }}
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '32px',
          }}
        >
          {stats.map((stat: unknown, statIndex: number) => {
            const s = stat as { value?: string; label?: string; description?: string };
            return (
              <div key={`${sectionKey}-stat-${statIndex}`} style={{ textAlign: 'center' }}>
                <p
                  style={{
                    fontFamily: 'var(--ui-font-display)',
                    fontSize: 'clamp(36px, 5vw, 48px)',
                    fontWeight: 700,
                    lineHeight: 1,
                    color: resolvedHeadingColor,
                    marginBottom: '8px',
                  }}
                >
                  {String(s.value || '')}
                </p>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: '16px',
                    color: resolvedHeadingColor,
                    marginBottom: s.description ? '6px' : 0,
                  }}
                >
                  {String(s.label || '')}
                </p>
                {s.description ? (
                  <p style={{ fontSize: '13px', color: resolvedBodyColor, lineHeight: 1.5, margin: 0 }}>
                    {String(s.description)}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
