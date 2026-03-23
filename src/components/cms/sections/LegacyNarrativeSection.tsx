import Link from 'next/link';
import SectionHeading from './shared/SectionHeading';
import type { SectionRendererProps } from './types';
import { asSectionRecord, normalizePath, readParagraphArray } from './utils';

export default function LegacyNarrativeSection({
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
  const paragraphs = readParagraphArray(sectionRecord.paragraphs);

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
      <div style={{ ...innerStyle, maxWidth: '760px' }}>
        {typeof sectionRecord.sectionLabel === 'string' && sectionRecord.sectionLabel.trim() ? (
          <p className="section-label" style={{ marginBottom: '16px', color: resolvedMutedColor }}>
            {sectionRecord.sectionLabel}
          </p>
        ) : null}

        {sectionRecord.heading ? (
          <SectionHeading
            tag={hTag}
            style={{
              fontFamily: 'var(--ui-font-display)',
              fontSize: hSize === 'md' ? 'clamp(28px, 4vw, 44px)' : hFontSize,
              fontWeight: 700,
              color: resolvedHeadingColor,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '20px',
            }}
          >
            {String(sectionRecord.heading)}
          </SectionHeading>
        ) : null}

        <div
          style={{
            width: '40px',
            height: '3px',
            backgroundColor: resolvedHeadingColor,
            marginBottom: paragraphs.length > 0 ? '28px' : '0',
            borderRadius: '2px',
          }}
          aria-hidden="true"
        />

        {paragraphs.map((paragraph, paragraphIndex) => (
          <p
            key={`${sectionKey}-paragraph-${paragraphIndex}`}
            style={{
              fontSize: '17px',
              lineHeight: 1.7,
              color: resolvedBodyColor,
              marginBottom: paragraphIndex < paragraphs.length - 1 ? '20px' : '0',
            }}
          >
            {paragraph}
          </p>
        ))}

        {typeof sectionRecord.linkLabel === 'string' && sectionRecord.linkLabel.trim() ? (
          <div style={{ marginTop: '28px' }}>
            <Link
              href={normalizePath(String(sectionRecord.linkHref || '#'))}
              style={{
                color: resolvedHeadingColor,
                fontWeight: 600,
                fontSize: '15px',
                textDecoration: 'none',
              }}
              className="text-link"
            >
              {sectionRecord.linkLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
