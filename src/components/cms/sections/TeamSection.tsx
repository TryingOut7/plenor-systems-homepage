import Image from 'next/image';
import SectionHeading from './shared/SectionHeading';
import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

export default function TeamSection({
  section,
  sectionKey,
  sectionStyle,
  hTag,
  hFontSize,
  innerStyle,
  resolvedHeadingColor,
  resolvedBodyColor,
  resolvedMutedColor,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const members = Array.isArray(sectionRecord.members) ? sectionRecord.members : [];
  const colsMap: Record<string, string> = {
    '2': 'repeat(2, 1fr)',
    '3': 'repeat(3, 1fr)',
    '4': 'repeat(4, 1fr)',
  };
  const rawCols = typeof sectionRecord.columns === 'string' ? sectionRecord.columns : '3';
  const gridCols = colsMap[rawCols] ?? colsMap['3'];

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
      <div style={innerStyle}>
        {sectionRecord.heading ? (
          <SectionHeading
            tag={hTag}
            style={{
              textAlign: 'center',
              marginBottom: sectionRecord.subheading ? '8px' : '40px',
              color: resolvedHeadingColor,
              fontSize: hFontSize,
            }}
          >
            {String(sectionRecord.heading)}
          </SectionHeading>
        ) : null}

        {sectionRecord.subheading ? (
          <p style={{ textAlign: 'center', marginBottom: '40px', color: resolvedMutedColor }}>
            {String(sectionRecord.subheading)}
          </p>
        ) : null}

        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '32px' }}>
          {members.map((member: unknown, memberIndex: number) => {
            const m =
              member && typeof member === 'object'
                ? (member as Record<string, unknown>)
                : {};
            const photo =
              m.photo && typeof m.photo === 'object'
                ? (m.photo as Record<string, unknown>)
                : null;
            const photoUrl = photo ? (typeof photo.url === 'string' ? photo.url : '') : '';

            return (
              <div
                key={`${sectionKey}-member-${memberIndex}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                {photoUrl ? (
                  <div
                    style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={photoUrl}
                      alt={typeof m.name === 'string' ? m.name : ''}
                      width={96}
                      height={96}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--ui-color-section-alt)',
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ textAlign: 'center' }}>
                  {m.name ? (
                    <p style={{ fontWeight: 600, color: resolvedHeadingColor, margin: 0 }}>
                      {String(m.name)}
                    </p>
                  ) : null}
                  {m.role ? (
                    <p style={{ fontSize: '14px', color: resolvedMutedColor, margin: '4px 0 0' }}>
                      {String(m.role)}
                    </p>
                  ) : null}
                  {m.bio ? (
                    <p style={{ fontSize: '14px', color: resolvedBodyColor, marginTop: '8px' }}>
                      {String(m.bio)}
                    </p>
                  ) : null}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                    {(m.linkedinUrl || m.linkedinHref) ? (
                      <a
                        href={String(m.linkedinUrl || m.linkedinHref)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--ui-color-link)', fontSize: '13px' }}
                      >
                        LinkedIn
                      </a>
                    ) : null}
                    {(m.twitterUrl || m.twitterHref) ? (
                      <a
                        href={String(m.twitterUrl || m.twitterHref)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--ui-color-link)', fontSize: '13px' }}
                      >
                        Twitter
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
