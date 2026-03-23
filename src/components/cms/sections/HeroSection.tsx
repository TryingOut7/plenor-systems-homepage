import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SectionHeading from './shared/SectionHeading';
import type { SectionRendererProps } from './types';
import {
  asSectionRecord,
  bodyColor,
  getImageUrl,
  heroPadding,
  isDarkTheme,
  mutedColor,
  normalizePath,
} from './utils';

export default function HeroSection({
  section,
  sectionKey,
  sectionStyle,
  size,
  theme,
  hSize,
  hTag,
  hFontSize,
  innerStyle,
  resolvedHeadingColor,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const bgImageUrl = getImageUrl(sectionRecord.backgroundImage);
  const bgVideoUrl =
    typeof sectionRecord.backgroundVideo === 'string'
      ? sectionRecord.backgroundVideo.trim()
      : '';
  const textAlign = (sectionRecord.textAlignment as string | undefined) || 'center';
  const minHeight =
    typeof sectionRecord.minHeight === 'number' && sectionRecord.minHeight > 0
      ? `${sectionRecord.minHeight}px`
      : undefined;
  const alignItems =
    textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center';
  const hasBgMedia = !!(bgImageUrl || bgVideoUrl);

  return (
    <section
      key={sectionKey}
      id={typeof sectionRecord.anchorId === 'string' ? sectionRecord.anchorId : undefined}
      style={{
        ...sectionStyle,
        padding: heroPadding[size],
        color: resolvedHeadingColor,
        position: 'relative',
        overflow: 'hidden',
        ...(minHeight ? { minHeight } : {}),
        display: 'flex',
        flexDirection: 'column',
        alignItems,
      }}
      className={
        typeof sectionRecord.customClassName === 'string'
          ? sectionRecord.customClassName
          : undefined
      }
    >
      {bgVideoUrl ? (
        <>
          <video
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0,
            }}
          >
            <source src={bgVideoUrl} type="video/mp4" />
          </video>
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              backgroundColor: 'rgba(0,0,0,0.45)',
            }}
          />
        </>
      ) : bgImageUrl ? (
        <>
          <Image
            src={bgImageUrl}
            alt=""
            fill
            style={{ objectFit: 'cover', zIndex: 0 }}
            aria-hidden="true"
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              backgroundColor: 'rgba(0,0,0,0.45)',
            }}
          />
        </>
      ) : null}

      <div
        style={{
          ...innerStyle,
          maxWidth: 'min(760px, var(--ui-layout-container-max-width))',
          position: 'relative',
          zIndex: 2,
          textAlign: textAlign as CSSProperties['textAlign'],
          width: '100%',
        }}
      >
        {typeof sectionRecord.eyebrow === 'string' ? (
          <p
            className="section-label"
            style={{
              color: hasBgMedia ? 'rgba(255,255,255,0.75)' : mutedColor(theme),
              marginBottom: '20px',
            }}
          >
            {sectionRecord.eyebrow}
          </p>
        ) : null}

        <SectionHeading
          tag={hTag === 'h2' ? 'h1' : hTag}
          style={{
            fontFamily: 'var(--ui-font-display)',
            fontSize: hSize === 'md' ? 'clamp(36px, 5vw, 60px)' : hFontSize,
            lineHeight: 1.1,
            marginBottom: '20px',
            color: hasBgMedia ? '#ffffff' : resolvedHeadingColor,
          }}
        >
          {String(sectionRecord.heading || '')}
        </SectionHeading>

        {sectionRecord.subheading ? (
          <p
            style={{
              color: hasBgMedia ? 'rgba(255,255,255,0.85)' : bodyColor(theme),
              fontSize: '18px',
              marginBottom: sectionRecord.primaryCtaLabel ? '28px' : 0,
            }}
          >
            {String(sectionRecord.subheading)}
          </p>
        ) : null}

        {sectionRecord.primaryCtaLabel ? (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent:
                textAlign === 'left'
                  ? 'flex-start'
                  : textAlign === 'right'
                    ? 'flex-end'
                    : 'center',
            }}
          >
            <Link
              className={isDarkTheme(theme) || hasBgMedia ? 'btn-ghost' : 'btn-primary'}
              href={normalizePath(String(sectionRecord.primaryCtaHref || '#'))}
            >
              {String(sectionRecord.primaryCtaLabel)}
            </Link>
            {typeof sectionRecord.secondaryCtaLabel === 'string' &&
            sectionRecord.secondaryCtaLabel.trim() ? (
              <Link
                className="btn-secondary"
                href={normalizePath(String(sectionRecord.secondaryCtaHref || '#'))}
              >
                {sectionRecord.secondaryCtaLabel}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
