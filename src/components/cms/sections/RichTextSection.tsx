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
  const items = Array.isArray(sectionRecord.items)
    ? sectionRecord.items.filter((item): item is string => typeof item === 'string')
    : [];

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
              fontSize: hSize === 'md' ? 'clamp(24px, 3.5vw, 36px)' : hFontSize,
              marginBottom: '20px',
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
        {items.length > 0 ? (
          <ul className="feature-list rich-text-list">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        {typeof sectionRecord.closingCopy === 'string' ? (
          <p className="section-closing-copy rich-text-closing-copy">
            {sectionRecord.closingCopy}
          </p>
        ) : null}
      </div>
    </section>
  );
}
