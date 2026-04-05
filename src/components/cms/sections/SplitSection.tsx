import Image from 'next/image';
import Link from 'next/link';
import RichText from '@/components/cms/RichText';
import SectionHeading from './shared/SectionHeading';
import type { SectionRendererProps } from './types';
import { asSectionRecord, isDarkTheme, normalizePath } from './utils';

export default function SplitSection({
  section,
  sectionKey,
  sectionStyle,
  theme,
  hTag,
  hSize,
  hFontSize,
  innerStyle,
  resolvedHeadingColor,
  resolvedBodyColor,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const layout = typeof sectionRecord.layout === 'string' ? sectionRecord.layout : '50-50';
  const leftFr = layout === '60-40' ? '3fr' : layout === '40-60' ? '2fr' : '1fr';
  const rightFr = layout === '60-40' ? '2fr' : layout === '40-60' ? '3fr' : '1fr';
  const vAlign =
    sectionRecord.verticalAlign === 'top'
      ? 'flex-start'
      : sectionRecord.verticalAlign === 'bottom'
        ? 'flex-end'
        : 'center';
  const reverseOnMobile = sectionRecord.reverseOnMobile === true;
  const splitId = `split-${sectionKey}`.replace(/[^a-zA-Z0-9-_]/g, '');

  const renderPanel = (side: 'left' | 'right') => {
    const type = String(sectionRecord[`${side}Type`] || 'richText');
    const heading =
      typeof sectionRecord[`${side}Heading`] === 'string'
        ? (sectionRecord[`${side}Heading`] as string)
        : '';
    const ctaLabel =
      typeof sectionRecord[`${side}CtaLabel`] === 'string'
        ? (sectionRecord[`${side}CtaLabel`] as string)
        : '';
    const ctaHref =
      typeof sectionRecord[`${side}CtaHref`] === 'string'
        ? (sectionRecord[`${side}CtaHref`] as string)
        : '';

    if (type === 'image') {
      const image = sectionRecord[`${side}Image`];
      const imgUrl =
        image && typeof image === 'object' && typeof (image as Record<string, unknown>).url === 'string'
          ? ((image as Record<string, unknown>).url as string)
          : '';
      return imgUrl ? (
        <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
          <Image
            src={imgUrl}
            alt={heading || ''}
            width={0}
            height={0}
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      ) : null;
    }

    if (type === 'video') {
      const videoUrl =
        typeof sectionRecord[`${side}VideoUrl`] === 'string'
          ? (sectionRecord[`${side}VideoUrl`] as string)
          : '';
      return videoUrl ? (
        <div
          style={{
            aspectRatio: '16 / 9',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'var(--ui-color-black-bg)',
          }}
        >
          <iframe
            src={videoUrl}
            title={heading || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 0 }}
          />
        </div>
      ) : null;
    }

    return (
      <div>
        {heading ? (
          <SectionHeading
            tag={hTag}
            style={{
              fontFamily: 'var(--ui-font-display)',
              fontSize: hSize === 'md' ? 'clamp(24px, 3.5vw, 36px)' : hFontSize,
              fontWeight: 700,
              color: resolvedHeadingColor,
              marginBottom: '16px',
            }}
          >
            {heading}
          </SectionHeading>
        ) : null}

        <RichText
          data={
            sectionRecord[`${side}Content`] as import('@payloadcms/richtext-lexical/lexical').SerializedEditorState | null | undefined
          }
          style={{ color: resolvedBodyColor }}
        />

        {ctaLabel && ctaHref ? (
          <div style={{ marginTop: '24px' }}>
            <Link
              href={normalizePath(ctaHref)}
              className={isDarkTheme(theme) ? 'btn-ghost' : 'btn-primary'}
            >
              {ctaLabel}
            </Link>
          </div>
        ) : null}
      </div>
    );
  };

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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `${leftFr} ${rightFr}`,
            gap: '48px',
            alignItems: vAlign,
          }}
          className={`${splitId}-grid`}
        >
          <div style={{ order: reverseOnMobile ? 2 : undefined }} className={`${splitId}-left`}>
            {renderPanel('left')}
          </div>
          <div style={{ order: reverseOnMobile ? 1 : undefined }} className={`${splitId}-right`}>
            {renderPanel('right')}
          </div>
        </div>
      </div>
      <style>{`
            @media (max-width: 767px) {
              .${splitId}-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
              .${splitId}-left { order: ${reverseOnMobile ? 2 : 1} !important; }
              .${splitId}-right { order: ${reverseOnMobile ? 1 : 2} !important; }
            }
          `}</style>
    </section>
  );
}
