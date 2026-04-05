import Image from 'next/image';
import SectionHeading from './shared/SectionHeading';
import ImageSlideshow from './shared/ImageSlideshow';
import type { SectionRendererProps } from './types';
import { asSectionRecord, normalizeImageEntries } from './utils';

export default function ImageSection({
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
  const images = Array.isArray(sectionRecord.images) ? sectionRecord.images : [];
  const displayMode = sectionRecord.displayMode === 'slideshow' ? 'slideshow' : 'grid';
  const gridColsNum =
    typeof sectionRecord.gridColumns === 'number' && sectionRecord.gridColumns > 0
      ? sectionRecord.gridColumns
      : 0;
  const gridTemplateColumns = gridColsNum
    ? `repeat(${gridColsNum}, 1fr)`
    : 'repeat(auto-fit, minmax(240px, 1fr))';
  const aspectRatioMap: Record<string, string> = {
    square: '1 / 1',
    landscape: '16 / 9',
    portrait: '3 / 4',
  };
  const aspectRatioCss =
    typeof sectionRecord.aspectRatio === 'string'
      ? (aspectRatioMap[sectionRecord.aspectRatio] ?? undefined)
      : undefined;

  const imageEntries = images
    .map((img: unknown) => {
      const entry = img && typeof img === 'object' ? (img as Record<string, unknown>) : {};
      const imageObj =
        entry.image && typeof entry.image === 'object'
          ? (entry.image as Record<string, unknown>)
          : null;
      const url = imageObj
        ? typeof imageObj.url === 'string'
          ? imageObj.url
          : ''
        : typeof entry.url === 'string'
          ? entry.url
          : '';
      const defaultAlt = imageObj
        ? typeof imageObj.alt === 'string'
          ? imageObj.alt
          : ''
        : typeof entry.alt === 'string'
          ? entry.alt
          : '';
      const alt =
        typeof entry.altOverride === 'string' && entry.altOverride
          ? entry.altOverride
          : defaultAlt;
      const caption = typeof entry.caption === 'string' ? entry.caption : '';
      const linkHref = typeof entry.linkHref === 'string' ? entry.linkHref : '';
      return { url, alt, caption, linkHref };
    })
    .filter((entry) => !!entry.url);

  const normalizedImages =
    imageEntries.length > 0 ? imageEntries : normalizeImageEntries(images);

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
            style={{ marginBottom: '24px', color: resolvedHeadingColor, fontSize: hFontSize }}
          >
            {String(sectionRecord.heading)}
          </SectionHeading>
        ) : null}

        {displayMode === 'slideshow' ? (
          <ImageSlideshow images={normalizedImages.map((entry) => ({ url: entry.url, alt: entry.alt }))} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns, gap: '16px' }}>
            {normalizedImages.map((img, imageIndex: number) => {
              const imgElement = (
                <div
                  key={`${sectionKey}-img-${imageIndex}`}
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <div
                    style={{
                      aspectRatio: aspectRatioCss,
                      overflow: 'hidden',
                      borderRadius: '8px',
                      border: '1px solid var(--ui-color-border)',
                    }}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{
                        width: '100%',
                        height: aspectRatioCss ? '100%' : 'auto',
                        objectFit: aspectRatioCss ? 'cover' : 'initial',
                      }}
                    />
                  </div>
                  {'caption' in img && (img as Record<string, unknown>).caption ? (
                    <p
                      style={{
                        marginTop: '6px',
                        fontSize: '13px',
                        color: resolvedMutedColor,
                      }}
                    >
                      {String((img as Record<string, unknown>).caption)}
                    </p>
                  ) : null}
                </div>
              );

              const href =
                'linkHref' in img
                  ? String((img as Record<string, unknown>).linkHref || '')
                  : '';
              return href ? (
                <a
                  key={`${sectionKey}-img-link-${imageIndex}`}
                  href={href}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {imgElement}
                </a>
              ) : (
                imgElement
              );
            })}
          </div>
        )}

        {sectionRecord.caption ? (
          <p style={{ marginTop: '12px', color: resolvedMutedColor }}>
            {String(sectionRecord.caption)}
          </p>
        ) : null}
      </div>
    </section>
  );
}
