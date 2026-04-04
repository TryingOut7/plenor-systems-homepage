import Image from 'next/image';
import type { Logo } from '@/payload/cms';
import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

type LogoLike = Logo & {
  href?: string;
};

function readId(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return '';
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function readImage(value: unknown): Logo['image'] {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  const url = readString(record.url);
  const alt = readString(record.alt);
  if (!url && !alt) return undefined;
  return { url, alt };
}

function resolveLogo(value: unknown, logoById: ReadonlyMap<string, LogoLike>): LogoLike | null {
  if (typeof value === 'string' || typeof value === 'number') {
    return logoById.get(String(value)) ?? null;
  }

  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  const id = readId(record.id);
  const base = id ? logoById.get(id) : undefined;

  return {
    id: id || base?.id,
    name: readString(record.name) ?? base?.name,
    image: readImage(record.image) ?? base?.image,
    url: readString(record.url) ?? readString(record.href) ?? base?.url,
    href: readString(record.href) ?? readString(record.url) ?? base?.href,
    order: typeof record.order === 'number' ? record.order : base?.order,
  };
}

export default function LogoBandSection({
  section,
  sectionKey,
  sectionStyle,
  innerStyle,
  resolvedMutedColor,
  collections,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const selectedLogos = Array.isArray(sectionRecord.logos)
    ? (sectionRecord.logos as unknown[])
    : [];

  const logoById = new Map<string, LogoLike>(
    (collections.logos || [])
      .map((logo) => {
        if (!logo.id) return null;
        return [String(logo.id), logo as LogoLike] as const;
      })
      .filter((entry): entry is readonly [string, LogoLike] => !!entry),
  );

  const logoSource = selectedLogos.length > 0 ? selectedLogos : (collections.logos as unknown[]);

  const logos = logoSource
    .map((logo) => resolveLogo(logo, logoById))
    .filter((logo): logo is LogoLike => !!logo);

  const displayMode = sectionRecord.displayMode === 'marquee' ? 'marquee' : 'static';
  const logoHeight =
    typeof sectionRecord.logoHeight === 'number' && sectionRecord.logoHeight > 0
      ? sectionRecord.logoHeight
      : 40;

  const logoItems = logos
    .map((logo) => {
      const url = logo.image?.url || '';
      const alt = logo.image?.alt || logo.name || '';
      const linkUrl = logo.url || logo.href || '';
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
