import Link from 'next/link';
import SectionHeading from './shared/SectionHeading';
import type { SectionRendererProps } from './types';
import {
  asSectionRecord,
  heroPadding,
  isDarkTheme,
  normalizePath,
} from './utils';

export default function LegacyHeroSection({
  section,
  sectionKey,
  sectionStyle,
  size,
  theme,
  hTag,
  hSize,
  hFontSize,
  innerStyle,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const dark = isDarkTheme(theme);

  return (
    <section
      key={sectionKey}
      id={typeof sectionRecord.anchorId === 'string' ? sectionRecord.anchorId : undefined}
      style={{
        ...sectionStyle,
        padding: heroPadding[size],
        position: 'relative',
        overflow: 'hidden',
      }}
      className={
        typeof sectionRecord.customClassName === 'string'
          ? sectionRecord.customClassName
          : undefined
      }
    >
      {dark ? (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
                `,
            backgroundSize: '80px 80px',
          }}
        />
      ) : null}

      <div style={{ ...innerStyle, maxWidth: '760px', position: 'relative', zIndex: 1 }}>
        {typeof sectionRecord.eyebrow === 'string' && sectionRecord.eyebrow.trim() ? (
          <p
            className="section-label"
            style={{
              color: dark ? 'var(--ui-color-dark-text-muted)' : 'var(--ui-color-text-muted)',
              marginBottom: '24px',
            }}
          >
            {sectionRecord.eyebrow}
          </p>
        ) : null}

        <SectionHeading
          tag={hTag === 'h2' ? 'h1' : hTag}
          style={{
            fontFamily: 'var(--ui-font-display)',
            fontSize: hSize === 'md' ? 'clamp(40px, 6vw, 72px)' : hFontSize,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            marginBottom: sectionRecord.subheading ? '20px' : '0',
            color: dark ? 'var(--ui-color-dark-text)' : 'var(--ui-color-primary)',
          }}
        >
          {String(sectionRecord.heading || '')}
        </SectionHeading>

        {sectionRecord.subheading ? (
          <p
            style={{
              fontSize: '18px',
              lineHeight: 1.6,
              color: dark ? 'var(--ui-color-dark-text-muted)' : 'var(--ui-color-text-muted)',
              marginBottom:
                typeof sectionRecord.primaryCtaLabel === 'string' &&
                sectionRecord.primaryCtaLabel.trim()
                  ? '36px'
                  : 0,
            }}
          >
            {String(sectionRecord.subheading)}
          </p>
        ) : null}

        {typeof sectionRecord.primaryCtaLabel === 'string' &&
        sectionRecord.primaryCtaLabel.trim() ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <Link
              href={normalizePath(String(sectionRecord.primaryCtaHref || '#'))}
              className={dark ? 'btn-ghost' : 'btn-primary'}
            >
              {sectionRecord.primaryCtaLabel}
            </Link>
            {typeof sectionRecord.secondaryCtaLabel === 'string' &&
            sectionRecord.secondaryCtaLabel.trim() ? (
              <Link
                href={normalizePath(String(sectionRecord.secondaryCtaHref || '#'))}
                className="btn-secondary"
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
