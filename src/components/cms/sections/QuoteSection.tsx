import Image from 'next/image';
import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

export default function QuoteSection({
  section,
  sectionKey,
  sectionStyle,
  innerStyle,
  resolvedHeadingColor,
  resolvedMutedColor,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const style = typeof sectionRecord.style === 'string' ? sectionRecord.style : 'centered';
  const photoObj =
    sectionRecord.photo && typeof sectionRecord.photo === 'object'
      ? (sectionRecord.photo as Record<string, unknown>)
      : null;
  const photoUrl = photoObj ? (typeof photoObj.url === 'string' ? photoObj.url : '') : '';

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
        <blockquote
          style={{
            margin: 0,
            padding: style === 'left-border' ? '0 0 0 24px' : style === 'pull' ? '24px 0' : '0',
            borderLeft: style === 'left-border' ? `4px solid ${resolvedHeadingColor}` : 'none',
            textAlign: style === 'centered' ? 'center' : 'left',
          }}
        >
          <p
            style={{
              fontSize: style === 'pull' ? 'clamp(20px, 3vw, 28px)' : '20px',
              fontStyle: 'italic',
              lineHeight: 1.6,
              color: resolvedHeadingColor,
              margin: '0 0 20px',
            }}
          >
            &ldquo;{String(sectionRecord.quote || '')}&rdquo;
          </p>
          {sectionRecord.attribution || sectionRecord.attributionRole || photoUrl ? (
            <footer
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                justifyContent: style === 'centered' ? 'center' : 'flex-start',
              }}
            >
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={typeof sectionRecord.attribution === 'string' ? sectionRecord.attribution : ''}
                  width={40}
                  height={40}
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : null}
              <div>
                {sectionRecord.attribution ? (
                  <cite style={{ fontStyle: 'normal', fontWeight: 600, color: resolvedHeadingColor }}>
                    {String(sectionRecord.attribution)}
                  </cite>
                ) : null}
                {sectionRecord.attributionRole ? (
                  <p style={{ fontSize: '14px', color: resolvedMutedColor, margin: '2px 0 0' }}>
                    {String(sectionRecord.attributionRole)}
                  </p>
                ) : null}
              </div>
            </footer>
          ) : null}
        </blockquote>
      </div>
    </section>
  );
}
