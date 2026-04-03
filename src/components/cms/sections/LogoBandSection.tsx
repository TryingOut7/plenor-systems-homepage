import Image from 'next/image';
import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

export default function LogoBandSection({
  section,
  sectionKey,
  sectionStyle,
  innerStyle,
  resolvedMutedColor,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const logos = Array.isArray(sectionRecord.logos) ? sectionRecord.logos : [];
  const displayMode = sectionRecord.displayMode === 'marquee' ? 'marquee' : 'static';
  const logoHeight =
    typeof sectionRecord.logoHeight === 'number' && sectionRecord.logoHeight > 0
      ? sectionRecord.logoHeight
      : 40;

  const logoItems = logos
    .map((logo: unknown) => {
      const l = logo && typeof logo === 'object' ? (logo as Record<string, unknown>) : {};
      const img = l.image && typeof l.image === 'object' ? (l.image as Record<string, unknown>) : null;
      const url = img ? (typeof img.url === 'string' ? img.url : '') : '';
      const alt = img
        ? typeof img.alt === 'string'
          ? img.alt
          : ''
        : typeof l.name === 'string'
          ? l.name
          : '';
      const linkUrl =
        typeof l.url === 'string'
          ? l.url
          : typeof l.href === 'string'
            ? l.href
            : '';
      return { url, alt, href: linkUrl };
    })
    .filter((logo) => !!logo.url);

  const logoElement = (logo: { url: string; alt: string; href: string }, index: number) => {
    const image = (
      <Image
        key={`${sectionKey}-logo-${index}`}
        src={logo.url}
        alt={logo.alt}
        width={0}
        height={0}
        sizes="200px"
        style={{
          height: `${logoHeight}px`,
          width: 'auto',
          objectFit: 'contain',
          opacity: 0.7,
          filter: 'grayscale(1)',
          transition: 'opacity 0.2s, filter 0.2s',
        }}
      />
    );

    return logo.href ? (
      <a
        key={`${sectionKey}-logo-link-${index}`}
        href={logo.href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'flex', alignItems: 'center' }}
      >
        {image}
      </a>
    ) : (
      <span key={`${sectionKey}-logo-span-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
        {image}
      </span>
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
        {sectionRecord.heading ? (
          <p
            style={{
              textAlign: 'center',
              marginBottom: '32px',
              fontSize: '13px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: resolvedMutedColor,
            }}
          >
            {String(sectionRecord.heading)}
          </p>
        ) : null}

        {displayMode === 'marquee' ? (
          <div style={{ overflow: 'hidden', position: 'relative' }}>
            <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
            <div
              style={{
                display: 'flex',
                gap: '48px',
                animation: 'marquee 20s linear infinite',
                width: 'max-content',
                alignItems: 'center',
              }}
            >
              {[...logoItems, ...logoItems].map((logo, idx) => logoElement(logo, idx))}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '40px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {logoItems.map((logo, idx) => logoElement(logo, idx))}
          </div>
        )}
      </div>
    </section>
  );
}
