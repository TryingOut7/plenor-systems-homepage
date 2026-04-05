import RichText from '@/components/cms/RichText';
import SectionHeading from './shared/SectionHeading';
import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

export default function RichTextSection({
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
      <div style={{ ...innerStyle, maxWidth: '800px' }}>
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
              fontSize: hSize === 'md' ? 'clamp(28px, 4vw, 42px)' : hFontSize,
              marginBottom: '24px',
              color: resolvedHeadingColor,
            }}
          >
            {String(sectionRecord.heading)}
          </SectionHeading>
        ) : null}

        <RichText
          data={
            sectionRecord.content as import('@payloadcms/richtext-lexical/lexical').SerializedEditorState | null | undefined
          }
          style={{ color: resolvedBodyColor }}
        />
      </div>
    </section>
  );
}
