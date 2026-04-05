import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

export default function DividerSection({
  section,
  sectionKey,
  innerStyle,
  resolvedBackgroundColor,
  resolvedMutedColor,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);

  return (
    <div key={sectionKey} style={{ padding: '20px 24px', backgroundColor: resolvedBackgroundColor }}>
      <div style={{ ...innerStyle, borderTop: '1px solid var(--ui-color-border)', paddingTop: '14px' }}>
        {sectionRecord.label ? (
          <p style={{ margin: 0, fontSize: '12px', color: resolvedMutedColor }}>
            {String(sectionRecord.label)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
