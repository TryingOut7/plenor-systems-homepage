import SectionHeading from './shared/SectionHeading';
import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

export default function ComparisonTableSection({
  section,
  sectionKey,
  sectionStyle,
  hTag,
  hSize,
  hFontSize,
  innerStyle,
  resolvedHeadingColor,
  resolvedBodyColor,
  resolvedMutedColor,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const columns = Array.isArray(sectionRecord.planColumns) ? sectionRecord.planColumns : [];
  const features = Array.isArray(sectionRecord.features) ? sectionRecord.features : [];

  return (
    <section key={sectionKey} style={sectionStyle}>
      <div style={innerStyle}>
        {typeof sectionRecord.sectionLabel === 'string' && sectionRecord.sectionLabel ? (
          <p
            className="section-label"
            style={{ color: resolvedMutedColor, marginBottom: '12px' }}
          >
            {sectionRecord.sectionLabel}
          </p>
        ) : null}

        {sectionRecord.heading ? (
          <SectionHeading
            tag={hTag}
            style={{
              fontSize: hSize === 'md' ? 'clamp(26px, 3.5vw, 38px)' : hFontSize,
              fontWeight: 700,
              color: resolvedHeadingColor,
              marginBottom: sectionRecord.subheading ? '12px' : '24px',
            }}
          >
            {String(sectionRecord.heading)}
          </SectionHeading>
        ) : null}

        {typeof sectionRecord.subheading === 'string' && sectionRecord.subheading ? (
          <p style={{ color: resolvedBodyColor, fontSize: '16px', marginBottom: '28px' }}>
            {String(sectionRecord.subheading)}
          </p>
        ) : null}

        <div style={{ overflowX: 'auto', border: '1px solid var(--ui-color-border)', borderRadius: '8px' }}>
          <table className="cms-table" style={{ minWidth: '640px' }}>
            <thead>
              <tr>
                <th>Feature</th>
                {columns.map((column: unknown, idx: number) => {
                  const label =
                    typeof column === 'object' && column !== null
                      ? (column as Record<string, unknown>).label
                      : column;

                  return (
                    <th key={`${sectionKey}-plan-col-${idx}`}>
                      {String(label || '')}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {features.map((feature: unknown, rowIndex: number) => {
                const label =
                  feature && typeof feature === 'object'
                    ? String((feature as { label?: string }).label || '')
                    : '';
                const values =
                  feature &&
                  typeof feature === 'object' &&
                  Array.isArray((feature as { values?: unknown[] }).values)
                    ? (feature as { values: unknown[] }).values
                    : [];

                return (
                  <tr key={`${sectionKey}-feature-${rowIndex}`}>
                    <td style={{ fontWeight: 600, color: resolvedHeadingColor }}>
                      {label}
                    </td>
                    {values.map((value: unknown, valueIndex: number) => {
                      const v =
                        typeof value === 'object' && value !== null
                          ? (value as Record<string, unknown>).value
                          : value;

                      return (
                        <td
                          key={`${sectionKey}-feature-${rowIndex}-value-${valueIndex}`}
                          style={{ color: resolvedBodyColor }}
                        >
                          {String(v || '')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
