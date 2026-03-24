import Image from 'next/image';
import SectionHeading from './shared/SectionHeading';
import type { SectionRendererProps } from './types';
import { asSectionRecord, getImageUrl } from './utils';

export default function VideoSection({
  section,
  sectionKey,
  sectionStyle,
  hTag,
  hFontSize,
  innerStyle,
  resolvedHeadingColor,
  resolvedMutedColor,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const embedUrl = typeof sectionRecord.embedUrl === 'string' ? sectionRecord.embedUrl : '';
  const posterUrl = getImageUrl(sectionRecord.posterImage);

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
      <div style={{ ...innerStyle, maxWidth: '900px' }}>
        {sectionRecord.heading ? (
          <SectionHeading
            tag={hTag}
            style={{ marginBottom: '18px', color: resolvedHeadingColor, fontSize: hFontSize }}
          >
            {String(sectionRecord.heading)}
          </SectionHeading>
        ) : null}

        <div
          style={{
            aspectRatio: '16 / 9',
            backgroundColor: 'var(--ui-color-black-bg)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={typeof sectionRecord.heading === 'string' ? sectionRecord.heading : 'Video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: '100%', height: '100%', border: 0 }}
            />
          ) : posterUrl ? (
            <Image
              src={posterUrl}
              alt={typeof sectionRecord.heading === 'string' ? sectionRecord.heading : 'Video poster'}
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                color: resolvedMutedColor,
              }}
            >
              Add an embed URL or poster image
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
