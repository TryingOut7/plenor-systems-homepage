import type { SectionRendererProps } from './types';

export default function DividerSection({ sectionKey, innerStyle }: SectionRendererProps) {
  return (
    <div key={sectionKey} className="major-section-divider" aria-hidden="true">
      <div style={innerStyle} />
    </div>
  );
}
