import SectionHeading from './shared/SectionHeading';
import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

export default function ReusableSectionReference({
  section,
  sectionKey,
  sectionStyle,
  hTag,
  hFontSize,
  innerStyle,
  renderNestedSection,
  resolvedHeadingColor,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const reusableSection = sectionRecord.reusableSection as
    | {
        id?: string;
        title?: string;
        sections?: import('@/payload/cms').PageSection[];
      }
    | undefined;
  const nestedSections = Array.isArray(reusableSection?.sections)
    ? reusableSection.sections
    : [];

  return (
    <section key={sectionKey} style={sectionStyle}>
      <div style={innerStyle}>
        <SectionHeading
          tag={hTag}
          style={{ marginBottom: '16px', color: resolvedHeadingColor, fontSize: hFontSize }}
        >
          {typeof sectionRecord.overrideHeading === 'string'
            ? sectionRecord.overrideHeading
            : reusableSection?.title || 'Reusable Section'}
        </SectionHeading>
        {nestedSections.map((nestedSection, nestedIndex) =>
          renderNestedSection(
            nestedSection,
            nestedIndex,
            `${sectionKey}-nested-${nestedIndex}-`,
          ),
        )}
      </div>
    </section>
  );
}
