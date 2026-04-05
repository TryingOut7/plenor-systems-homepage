import SectionHeading from './shared/SectionHeading';
import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

export default function ComparisonTableSection({
  section,
  sectionKey,
  sectionStyle,
  hTag,
  hFontSize,
  innerStyle,
  resolvedHeadingColor,
  resolvedBodyColor,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const columns = Array.isArray(sectionRecord.planColumns) ? sectionRecord.planColumns : [];
  const features = Array.isArray(sectionRecord.features) ? sectionRecord.features : [];

  return (
    <section key={sectionKey} style={sectionStyle}>
      <div style={innerStyle}>
        {sectionRecord.heading ? (
          <SectionHeading
            tag={hTag}
            style={{ marginBottom: '20px', color: resolvedHeadingColor, fontSize: hFontSize }}
          >
            {String(sectionRecord.heading)}
          </SectionHeading>
        ) : null}

        <div style={{ overflowX: 'auto', border: '1px solid var(--ui-color-border)', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
            <thead>
              <tr>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    backgroundColor: 'var(--ui-color-section-alt)',
                    color: resolvedHeadingColor,
                  }}
                >
                  Feature
                </th>
                {columns.map((column: unknown, idx: number) => {
                  const label =
                    typeof column === 'object' && column !== null
                      ? (column as Record<string, unknown>).label
                      : column;

                  return (
                    <th
                      key={`${sectionKey}-plan-col-${idx}`}
                      style={{
                        padding: '12px',
                        textAlign: 'left',
                        backgroundColor: 'var(--ui-color-section-alt)',
                        color: resolvedHeadingColor,
                      }}
                    >
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
                    <td
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid var(--ui-color-border)',
                        fontWeight: 600,
                        color: resolvedHeadingColor,
                      }}
                    >
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
                          style={{
                            padding: '12px',
                            borderBottom: '1px solid var(--ui-color-border)',
                            color: resolvedBodyColor,
                          }}
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
