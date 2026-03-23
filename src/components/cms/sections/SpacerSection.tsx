import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

export default function SpacerSection({ section, sectionKey }: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const height = typeof sectionRecord.height === 'number' ? sectionRecord.height : 40;
  return <div key={sectionKey} style={{ height: `${height}px` }} />;
}
