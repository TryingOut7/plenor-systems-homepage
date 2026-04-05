import SectionHeading from './shared/SectionHeading';
import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

export default function SimpleTableSection({
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
  const columns = Array.isArray(sectionRecord.columns) ? sectionRecord.columns : [];
  const rows = Array.isArray(sectionRecord.rows) ? sectionRecord.rows : [];

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
              fontFamily: 'var(--ui-font-display)',
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
          <table className="cms-table">
            <thead>
              <tr>
                {columns.map((column: unknown, colIndex: number) => {
                  const label =
                    typeof column === 'object' && column !== null
                      ? (column as Record<string, unknown>).label
                      : column;

                  return (
                    <th key={`${sectionKey}-col-${colIndex}`}>
                      {String(label || '')}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: unknown, rowIndex: number) => {
                const cells =
                  row &&
                  typeof row === 'object' &&
                  Array.isArray((row as Record<string, unknown>).cells)
                    ? (row as { cells: unknown[] }).cells
                    : [];

                return (
                  <tr key={`${sectionKey}-row-${rowIndex}`}>
                    {cells.map((cell: unknown, cellIndex: number) => {
                      const value =
                        typeof cell === 'object' && cell !== null
                          ? (cell as Record<string, unknown>).value
                          : cell;

                      return (
                        <td
                          key={`${sectionKey}-row-${rowIndex}-cell-${cellIndex}`}
                          style={{ color: resolvedBodyColor }}
                        >
                          {String(value || '')}
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
