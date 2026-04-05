import SectionHeading from './shared/SectionHeading';
import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

export default function SimpleTableSection({
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
  const columns = Array.isArray(sectionRecord.columns) ? sectionRecord.columns : [];
  const rows = Array.isArray(sectionRecord.rows) ? sectionRecord.rows : [];

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
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr>
                {columns.map((column: unknown, colIndex: number) => {
                  const label =
                    typeof column === 'object' && column !== null
                      ? (column as Record<string, unknown>).label
                      : column;

                  return (
                    <th
                      key={`${sectionKey}-col-${colIndex}`}
                      style={{
                        textAlign: 'left',
                        padding: '12px',
                        borderBottom: '1px solid var(--ui-color-border)',
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
                          style={{
                            padding: '12px',
                            borderBottom: '1px solid var(--ui-color-border)',
                            color: resolvedBodyColor,
                          }}
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
