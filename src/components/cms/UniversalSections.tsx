'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import RichText from './RichText';
import GuideForm from '@/components/GuideForm';
import InquiryForm from '@/components/InquiryForm';
import type {
  BlogPost,
  CollectionData,
  PageSection,
  ServiceItem,
  Testimonial,
} from '@/payload/cms';

type SectionTheme = 'navy' | 'charcoal' | 'black' | 'white' | 'light';
type SectionSize = 'compact' | 'regular' | 'spacious';

interface UniversalSectionsProps {
  documentId: string;
  documentType: string;
  sections: PageSection[];
  collections: CollectionData;
  guideFormLabels?: {
    submitLabel?: string;
    submittingLabel?: string;
    successHeading?: string;
    successBody?: string;
    footerText?: string;
    namePlaceholder?: string;
    emailPlaceholder?: string;
  };
  inquiryFormLabels?: {
    submitLabel?: string;
    submittingLabel?: string;
    successHeading?: string;
    successBody?: string;
    consentText?: string;
    namePlaceholder?: string;
    emailPlaceholder?: string;
    companyPlaceholder?: string;
    challengePlaceholder?: string;
  };
}

const inner: CSSProperties = { maxWidth: 'var(--ui-layout-container-max-width)', margin: '0 auto' };

const sectionPadding: Record<SectionSize, string> = {
  compact: 'var(--ui-spacing-section-compact)',
  regular: 'var(--ui-spacing-section-regular)',
  spacious: 'var(--ui-spacing-section-spacious)',
};

const heroPadding: Record<SectionSize, string> = {
  compact: 'var(--ui-spacing-hero-compact)',
  regular: 'var(--ui-spacing-hero-regular)',
  spacious: 'var(--ui-spacing-hero-spacious)',
};

function getDarkBackgroundColor(theme?: string): string {
  if (theme === 'charcoal') return 'var(--ui-color-charcoal-bg)';
  if (theme === 'black') return 'var(--ui-color-black-bg)';
  return 'var(--ui-color-dark-bg)';
}

function getLightBackgroundColor(theme?: string): string {
  if (theme === 'light') return 'var(--ui-color-section-alt)';
  return 'var(--ui-color-surface)';
}

function isDarkTheme(theme: SectionTheme): boolean {
  return theme === 'navy' || theme === 'charcoal' || theme === 'black';
}

function headingColor(theme: SectionTheme): string {
  return isDarkTheme(theme) ? 'var(--ui-color-dark-text)' : 'var(--ui-color-primary)';
}

function bodyColor(theme: SectionTheme): string {
  return isDarkTheme(theme) ? 'var(--ui-color-dark-text-muted)' : 'var(--ui-color-text-muted)';
}

function mutedColor(theme: SectionTheme): string {
  return isDarkTheme(theme) ? 'var(--ui-color-dark-text-muted)' : 'var(--ui-color-text-muted)';
}

function normalizeTheme(theme: unknown): SectionTheme {
  if (theme === 'navy' || theme === 'charcoal' || theme === 'black' || theme === 'white' || theme === 'light') {
    return theme;
  }
  return 'white';
}

function normalizeSize(size: unknown): SectionSize {
  if (size === 'compact' || size === 'regular' || size === 'spacious') return size;
  return 'regular';
}

function normalizePath(path: string): string {
  if (!path) return '/';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return path.startsWith('/') ? path : `/${path}`;
}

function getImageUrl(media: unknown): string | undefined {
  if (!media || typeof media !== 'object') return undefined;
  const m = media as Record<string, unknown>;
  return typeof m.url === 'string' ? m.url : undefined;
}

function getImageAlt(media: unknown): string {
  if (!media || typeof media !== 'object') return '';
  return String((media as Record<string, unknown>).alt || '');
}

function readArrayEntries(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === 'object');
}

function readParagraphArray(value: unknown): string[] {
  return readArrayEntries(value)
    .map((entry) => (typeof entry.paragraph === 'string' ? entry.paragraph.trim() : ''))
    .filter(Boolean);
}

function readItemArray(value: unknown): string[] {
  return readArrayEntries(value)
    .map((entry) => (typeof entry.item === 'string' ? entry.item.trim() : ''))
    .filter(Boolean);
}

function readAudienceArray(value: unknown): Array<{ label: string; copy: string }> {
  return readArrayEntries(value)
    .map((entry) => {
      const label = typeof entry.label === 'string' ? entry.label.trim() : '';
      const copy = typeof entry.copy === 'string' ? entry.copy.trim() : '';
      return { label, copy };
    })
    .filter((entry) => entry.label && entry.copy);
}

function readChecklistArray(value: unknown): Array<{ title: string; description: string }> {
  return readArrayEntries(value)
    .map((entry) => {
      const title = typeof entry.title === 'string' ? entry.title.trim() : '';
      const description = typeof entry.description === 'string' ? entry.description.trim() : '';
      return { title, description };
    })
    .filter((entry) => entry.title && entry.description);
}

type NormalizedImage = { url: string; alt: string };

function normalizeImageEntries(images: unknown): NormalizedImage[] {
  if (!Array.isArray(images)) return [];

  return images
    .map((imageEntry: unknown) => {
      const img = typeof imageEntry === 'object' && imageEntry !== null
        ? (imageEntry as Record<string, unknown>).image
        : imageEntry;
      const url = getImageUrl(img);
      if (!url) return null;
      return { url, alt: getImageAlt(img) };
    })
    .filter((entry): entry is NormalizedImage => !!entry);
}

function ImageSlideshow({ images }: { images: NormalizedImage[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || isPaused) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [images.length, isPaused]);

  if (images.length === 0) return null;
  const boundedIndex = ((currentIndex % images.length) + images.length) % images.length;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div style={{ marginBottom: '12px', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--ui-color-border)' }}>
        <Image
          src={images[boundedIndex].url}
          alt={images[boundedIndex].alt}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {images.length > 1 ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
            style={{
              border: '1px solid var(--ui-color-border)',
              backgroundColor: 'var(--ui-color-surface)',
              color: 'var(--ui-color-primary)',
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: 'pointer',
            }}
          >
            Previous
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {images.map((_, dotIndex) => (
              <button
                key={`dot-${dotIndex}`}
                type="button"
                aria-label={`Go to slide ${dotIndex + 1}`}
                onClick={() => setCurrentIndex(dotIndex)}
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '999px',
                  border: 0,
                  padding: 0,
                  cursor: 'pointer',
                  backgroundColor: dotIndex === boundedIndex ? 'var(--ui-color-primary)' : 'var(--ui-color-border)',
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
            style={{
              border: '1px solid var(--ui-color-border)',
              backgroundColor: 'var(--ui-color-surface)',
              color: 'var(--ui-color-primary)',
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: 'pointer',
            }}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}

function matchesFilter(item: Record<string, unknown>, filterField?: string, filterValue?: string): boolean {
  if (!filterField || !filterValue) return true;
  const field = item[filterField];
  if (Array.isArray(field)) {
    return field.some((entry) => {
      const val = typeof entry === 'object' && entry !== null ? (entry as Record<string, unknown>).tag : entry;
      return String(val).toLowerCase() === filterValue.toLowerCase();
    });
  }
  if (typeof field === 'boolean') {
    return String(field) === filterValue.toLowerCase();
  }
  if (field === undefined || field === null) return false;
  return String(field).toLowerCase().includes(filterValue.toLowerCase());
}

function sortItems<T extends Record<string, unknown>>(
  items: T[],
  sortField = 'publishedAt',
  sortDirection: 'asc' | 'desc' = 'desc'
): T[] {
  const sorted = [...items].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (aValue === bValue) return 0;
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    if (typeof aValue === 'number' && typeof bValue === 'number') return aValue - bValue;
    return String(aValue).localeCompare(String(bValue));
  });
  return sortDirection === 'asc' ? sorted : sorted.reverse();
}

function renderDynamicListItem(item: ServiceItem | BlogPost | Testimonial, source: string) {
  if (source === 'blogPost') {
    const post = item as BlogPost;
    return {
      title: post.title || 'Untitled Post',
      description: post.excerpt || '',
      href: `/blog/${post.slug || ''}`,
      meta: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '',
    };
  }
  if (source === 'testimonial') {
    const testimonial = item as Testimonial;
    return {
      title: testimonial.personName || 'Anonymous',
      description: testimonial.quote || '',
      href: '#',
      meta: [testimonial.role, testimonial.company].filter(Boolean).join(', '),
    };
  }
  const service = item as ServiceItem;
  return {
    title: service.title || 'Untitled Service',
    description: service.summary || '',
    href: `/services/${service.slug || ''}`,
    meta: service.priceFrom ? `${service.currency || 'USD'} ${service.priceFrom}` : '',
  };
}

export default function UniversalSections({
  sections,
  collections,
  guideFormLabels,
  inquiryFormLabels,
}: UniversalSectionsProps) {
  const [listPages, setListPages] = useState<Record<string, number>>({});

  const renderSection = (
    section: PageSection,
    index: number,
    keyPrefix = '',
  ): React.ReactNode => {
    const key = `${keyPrefix}${section.id || index}`;
    const size = normalizeSize(section.size);
    const theme = normalizeTheme(section.theme);
    const padding = sectionPadding[size];
    const sectionStyle: CSSProperties = {
      padding,
      backgroundColor: theme === 'white' || theme === 'light' ? getLightBackgroundColor(theme) : getDarkBackgroundColor(theme),
    };

    if (section.blockType === 'heroSection') {
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={{
            ...sectionStyle,
            padding: heroPadding[size],
            color: 'var(--ui-color-hero-text)',
            position: 'relative',
            overflow: 'hidden',
          }}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: 'min(760px, var(--ui-layout-container-max-width))' }}>
            {typeof section.eyebrow === 'string' ? (
              <p className="section-label" style={{ color: 'var(--ui-color-hero-muted)', marginBottom: '20px' }}>
                {section.eyebrow}
              </p>
            ) : null}
            <h1
              style={{
                fontFamily: 'var(--ui-font-display)',
                fontSize: 'clamp(36px, 5vw, 60px)',
                lineHeight: 1.1,
                marginBottom: '20px',
              }}
            >
              {String(section.heading || '')}
            </h1>
            {section.subheading ? (
              <p style={{ color: 'var(--ui-color-hero-muted)', fontSize: '18px', marginBottom: section.primaryCtaLabel ? '28px' : 0 }}>
                {String(section.subheading)}
              </p>
            ) : null}
            {section.primaryCtaLabel ? (
              <Link className="btn-ghost" href={normalizePath(String(section.primaryCtaHref || '#'))}>
                {String(section.primaryCtaLabel)}
              </Link>
            ) : null}
          </div>
        </section>
      );
    }

    if (section.blockType === 'richTextSection') {
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '800px' }}>
            {section.heading ? (
              <h2
                style={{
                  fontFamily: 'var(--ui-font-display)',
                  fontSize: 'clamp(28px, 4vw, 42px)',
                  marginBottom: '24px',
                  color: headingColor(theme),
                }}
              >
                {String(section.heading)}
              </h2>
            ) : null}
            <RichText data={section.content as import('@payloadcms/richtext-lexical/lexical').SerializedEditorState | null | undefined} style={{ color: bodyColor(theme) }} />
          </div>
        </section>
      );
    }

    if (section.blockType === 'ctaSection') {
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '700px', textAlign: 'center' }}>
            {section.heading ? (
              <h2
                style={{
                  fontFamily: 'var(--ui-font-display)',
                  fontSize: 'clamp(26px, 4vw, 40px)',
                  color: theme === 'white' || theme === 'light' ? 'var(--ui-color-primary)' : 'var(--ui-color-dark-text)',
                  marginBottom: '16px',
                }}
              >
                {String(section.heading)}
              </h2>
            ) : null}
            {section.body ? (
              <p style={{ color: theme === 'white' || theme === 'light' ? 'var(--ui-color-text-muted)' : 'var(--ui-color-dark-text-muted)', marginBottom: section.buttonLabel ? '24px' : 0 }}>
                {String(section.body)}
              </p>
            ) : null}
            {section.buttonLabel ? (
              <Link
                className={theme === 'white' || theme === 'light' ? 'btn-primary' : 'btn-ghost'}
                href={normalizePath(String(section.buttonHref || '#'))}
              >
                {String(section.buttonLabel)}
              </Link>
            ) : null}
          </div>
        </section>
      );
    }

    if (section.blockType === 'legacyHeroSection') {
      const dark = isDarkTheme(theme);
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={{
            ...sectionStyle,
            padding: heroPadding[size],
            position: 'relative',
            overflow: 'hidden',
          }}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
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

          <div style={{ ...inner, maxWidth: '760px', position: 'relative', zIndex: 1 }}>
            {typeof section.eyebrow === 'string' && section.eyebrow.trim() ? (
              <p
                className="section-label"
                style={{
                  color: dark ? 'var(--ui-color-dark-text-muted)' : 'var(--ui-color-text-muted)',
                  marginBottom: '24px',
                }}
              >
                {section.eyebrow}
              </p>
            ) : null}
            <h1
              style={{
                fontFamily: 'var(--ui-font-display)',
                fontSize: 'clamp(40px, 6vw, 72px)',
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
                marginBottom: section.subheading ? '20px' : '0',
                color: dark ? 'var(--ui-color-dark-text)' : 'var(--ui-color-primary)',
              }}
            >
              {String(section.heading || '')}
            </h1>
            {section.subheading ? (
              <p
                style={{
                  fontSize: '18px',
                  lineHeight: 1.6,
                  color: dark ? 'var(--ui-color-dark-text-muted)' : 'var(--ui-color-text-muted)',
                  marginBottom:
                    typeof section.primaryCtaLabel === 'string' && section.primaryCtaLabel.trim()
                      ? '36px'
                      : 0,
                }}
              >
                {String(section.subheading)}
              </p>
            ) : null}

            {typeof section.primaryCtaLabel === 'string' && section.primaryCtaLabel.trim() ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <Link
                  href={normalizePath(String(section.primaryCtaHref || '#'))}
                  className={dark ? 'btn-ghost' : 'btn-primary'}
                >
                  {section.primaryCtaLabel}
                </Link>
                {typeof section.secondaryCtaLabel === 'string' && section.secondaryCtaLabel.trim() ? (
                  <Link
                    href={normalizePath(String(section.secondaryCtaHref || '#'))}
                    className="btn-secondary"
                  >
                    {section.secondaryCtaLabel}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      );
    }

    if (section.blockType === 'legacyNarrativeSection') {
      const paragraphs = readParagraphArray(section.paragraphs);
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '760px' }}>
            {typeof section.sectionLabel === 'string' && section.sectionLabel.trim() ? (
              <p className="section-label" style={{ marginBottom: '16px', color: mutedColor(theme) }}>
                {section.sectionLabel}
              </p>
            ) : null}
            {section.heading ? (
              <h2
                style={{
                  fontFamily: 'var(--ui-font-display)',
                  fontSize: 'clamp(28px, 4vw, 44px)',
                  fontWeight: 700,
                  color: headingColor(theme),
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  marginBottom: '20px',
                }}
              >
                {String(section.heading)}
              </h2>
            ) : null}
            <div
              style={{
                width: '40px',
                height: '3px',
                backgroundColor: headingColor(theme),
                marginBottom: paragraphs.length > 0 ? '28px' : '0',
                borderRadius: '2px',
              }}
              aria-hidden="true"
            />

            {paragraphs.map((paragraph, paragraphIndex) => (
              <p
                key={`${key}-paragraph-${paragraphIndex}`}
                style={{
                  fontSize: '17px',
                  lineHeight: 1.7,
                  color: bodyColor(theme),
                  marginBottom: paragraphIndex < paragraphs.length - 1 ? '20px' : '0',
                }}
              >
                {paragraph}
              </p>
            ))}

            {typeof section.linkLabel === 'string' && section.linkLabel.trim() ? (
              <div style={{ marginTop: '28px' }}>
                <Link
                  href={normalizePath(String(section.linkHref || '#'))}
                  style={{
                    color: headingColor(theme),
                    fontWeight: 600,
                    fontSize: '15px',
                    textDecoration: 'none',
                  }}
                  className="text-link"
                >
                  {section.linkLabel}
                </Link>
              </div>
            ) : null}
          </div>
        </section>
      );
    }

    if (section.blockType === 'legacyNumberedStageSection') {
      const items = readItemArray(section.items);
      const dark = isDarkTheme(theme);
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '760px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '40px' }}>
              <span
                aria-hidden="true"
                style={{
                  fontFamily: 'var(--ui-font-display)',
                  fontSize: 'clamp(80px, 12vw, 140px)',
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  marginLeft: '-4px',
                  userSelect: 'none',
                  color: dark ? 'rgba(255,255,255,0.12)' : 'rgba(27,45,79,0.07)',
                }}
              >
                {String(section.stageNumber || '01')}
              </span>
            </div>

            <p className="section-label" style={{ marginBottom: '16px', color: mutedColor(theme) }}>
              {String(section.stageLabel || 'Stage')}
            </p>
            <h2
              style={{
                fontFamily: 'var(--ui-font-display)',
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 700,
                color: headingColor(theme),
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                marginBottom: '20px',
              }}
            >
              {String(section.heading || '')}
            </h2>
            <div
              style={{
                width: '40px',
                height: '3px',
                backgroundColor: headingColor(theme),
                marginBottom: '28px',
                borderRadius: '2px',
              }}
              aria-hidden="true"
            />

            {section.body ? (
              <p style={{ fontSize: '17px', color: bodyColor(theme), lineHeight: 1.7, marginBottom: '36px' }}>
                {String(section.body)}
              </p>
            ) : null}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '32px',
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--ui-font-display)',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: headingColor(theme),
                    marginBottom: '16px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  What it covers
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {items.map((item) => (
                    <li
                      key={`${key}-${item}`}
                      style={{
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'flex-start',
                        fontSize: '16px',
                        color: bodyColor(theme),
                        lineHeight: 1.65,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          flexShrink: 0,
                          marginTop: '8px',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: dark ? 'var(--ui-color-dark-text)' : 'var(--ui-color-primary)',
                          display: 'inline-block',
                        }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {section.whoForBody ? (
                <div
                  style={{
                    backgroundColor:
                      theme === 'white' || theme === 'light'
                        ? 'var(--ui-color-section-alt)'
                        : 'rgba(255,255,255,0.08)',
                    borderLeft: `3px solid ${dark ? 'var(--ui-color-dark-text)' : 'var(--ui-color-primary)'}`,
                    borderRadius: '0 var(--ui-button-radius) var(--ui-button-radius) 0',
                    padding: '20px 24px',
                  }}
                >
                  <p style={{ fontWeight: 600, fontSize: '14px', color: headingColor(theme), marginBottom: '6px' }}>
                    {String(section.whoForHeading || 'Who it is for')}
                  </p>
                  <p style={{ fontSize: '14px', color: bodyColor(theme), lineHeight: 1.6 }}>
                    {String(section.whoForBody)}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      );
    }

    if (section.blockType === 'legacyAudienceGridSection') {
      const audiences = readAudienceArray(section.audiences);
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '900px' }}>
            {typeof section.sectionLabel === 'string' && section.sectionLabel.trim() ? (
              <p className="section-label" style={{ marginBottom: '16px', color: mutedColor(theme) }}>
                {section.sectionLabel}
              </p>
            ) : null}
            {section.heading ? (
              <h2
                style={{
                  fontFamily: 'var(--ui-font-display)',
                  fontSize: 'clamp(26px, 3.5vw, 38px)',
                  fontWeight: 700,
                  color: headingColor(theme),
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  marginBottom: '40px',
                }}
              >
                {String(section.heading)}
              </h2>
            ) : null}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '2px',
                backgroundColor:
                  theme === 'white' || theme === 'light'
                    ? 'var(--ui-color-border)'
                    : 'rgba(255,255,255,0.2)',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              {audiences.map((audience, audienceIndex) => (
                <div
                  key={`${key}-audience-${audienceIndex}`}
                  style={{
                    backgroundColor:
                      theme === 'white' || theme === 'light'
                        ? 'var(--ui-color-surface)'
                        : 'rgba(0,0,0,0.1)',
                    padding: '32px 28px',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--ui-font-display)',
                      fontWeight: 700,
                      fontSize: '20px',
                      color: headingColor(theme),
                      marginBottom: '10px',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {audience.label}
                  </p>
                  <p style={{ fontSize: '14px', color: bodyColor(theme), lineHeight: 1.65 }}>
                    {audience.copy}
                  </p>
                </div>
              ))}
            </div>

            {typeof section.footerText === 'string' && section.footerText.trim() ? (
              <p style={{ fontSize: '14px', color: bodyColor(theme), marginTop: '20px' }}>
                {section.footerText}
              </p>
            ) : null}
          </div>
        </section>
      );
    }

    if (section.blockType === 'legacyChecklistSection') {
      const checklistItems = readChecklistArray(section.items);
      const dark = isDarkTheme(theme);
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '860px' }}>
            {typeof section.sectionLabel === 'string' && section.sectionLabel.trim() ? (
              <p className="section-label" style={{ marginBottom: '16px', color: mutedColor(theme) }}>
                {section.sectionLabel}
              </p>
            ) : null}
            {section.heading ? (
              <h2
                style={{
                  fontFamily: 'var(--ui-font-display)',
                  fontSize: 'clamp(26px, 3.5vw, 38px)',
                  fontWeight: 700,
                  color: headingColor(theme),
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  marginBottom: '20px',
                }}
              >
                {String(section.heading)}
              </h2>
            ) : null}
            <div
              style={{
                width: '40px',
                height: '3px',
                backgroundColor: headingColor(theme),
                marginBottom: '40px',
                borderRadius: '2px',
              }}
              aria-hidden="true"
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {checklistItems.map((item, itemIndex) => (
                <div
                  key={`${key}-check-${itemIndex}`}
                  style={{
                    display: 'flex',
                    gap: '28px',
                    alignItems: 'flex-start',
                    padding: '28px 0',
                    borderBottom:
                      itemIndex < checklistItems.length - 1
                        ? `1px solid ${theme === 'white' || theme === 'light' ? 'var(--ui-color-border)' : 'rgba(255,255,255,0.2)'}`
                        : 'none',
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      flexShrink: 0,
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: dark ? 'var(--ui-color-dark-text)' : 'var(--ui-color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '2px',
                    }}
                  >
                    <svg width="14" height="14" fill="none" stroke={dark ? 'var(--ui-color-black-bg)' : 'var(--ui-color-dark-text)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="12 3 5.5 9.5 2.5 6.5" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '16px', color: headingColor(theme), marginBottom: '4px' }}>
                      {item.title}
                    </p>
                    <p style={{ fontSize: '15px', color: bodyColor(theme), lineHeight: 1.65 }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {typeof section.footerBody === 'string' && section.footerBody.trim() ? (
              <p style={{ fontSize: '15px', color: bodyColor(theme), lineHeight: 1.65, marginTop: '32px' }}>
                {section.footerBody}
              </p>
            ) : null}
          </div>
        </section>
      );
    }

    if (section.blockType === 'legacyQuoteSection') {
      const dark = isDarkTheme(theme);
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={{
            ...sectionStyle,
            position: 'relative',
            overflow: 'hidden',
          }}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-20px',
              left: '20px',
              fontFamily: 'var(--ui-font-display)',
              fontSize: 'clamp(160px, 24vw, 320px)',
              fontWeight: 700,
              lineHeight: 1,
              userSelect: 'none',
              pointerEvents: 'none',
              color: dark ? 'rgba(255,255,255,0.1)' : 'rgba(27,45,79,0.05)',
            }}
          >
            &ldquo;
          </div>
          <div style={{ ...inner, maxWidth: '760px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            {typeof section.sectionLabel === 'string' && section.sectionLabel.trim() ? (
              <p className="section-label" style={{ marginBottom: '32px', color: mutedColor(theme) }}>
                {section.sectionLabel}
              </p>
            ) : null}
            <h2
              style={{
                fontFamily: 'var(--ui-font-display)',
                fontSize: 'clamp(24px, 3.5vw, 36px)',
                fontWeight: 700,
                color: headingColor(theme),
                lineHeight: 1.35,
                letterSpacing: '-0.02em',
                fontStyle: 'italic',
                maxWidth: '640px',
                margin: '0 auto',
              }}
            >
              {String(section.quote || '')}
            </h2>
          </div>
        </section>
      );
    }

    if (section.blockType === 'legacyCenteredCtaSection') {
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '620px', textAlign: 'center' }}>
            <h2
              style={{
                fontFamily: 'var(--ui-font-display)',
                fontSize: 'clamp(26px, 4vw, 38px)',
                fontWeight: 700,
                color: headingColor(theme),
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                marginBottom: section.body ? '16px' : '0',
              }}
            >
              {String(section.heading || '')}
            </h2>
            {section.body ? (
              <p style={{ fontSize: '17px', color: bodyColor(theme), lineHeight: 1.65, marginBottom: section.buttonLabel ? '32px' : 0 }}>
                {String(section.body)}
              </p>
            ) : null}
            {typeof section.buttonLabel === 'string' && section.buttonLabel.trim() ? (
              <Link
                href={normalizePath(String(section.buttonHref || '#'))}
                className={isDarkTheme(theme) ? 'btn-ghost' : 'btn-secondary'}
              >
                {section.buttonLabel}
              </Link>
            ) : null}

            {typeof section.secondaryLinkLabel === 'string' && section.secondaryLinkLabel.trim() ? (
              <div style={{ marginTop: '18px' }}>
                <Link
                  href={normalizePath(String(section.secondaryLinkHref || '#'))}
                  style={{ color: bodyColor(theme), fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}
                  className="text-link"
                >
                  {section.secondaryLinkLabel}
                </Link>
              </div>
            ) : null}
          </div>
        </section>
      );
    }

    if (section.blockType === 'guideFormSection') {
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '860px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '64px',
                alignItems: 'start',
              }}
            >
              <div>
                <p className="section-label" style={{ marginBottom: '16px' }}>
                  {String(section.label || 'Free resource')}
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--ui-font-display)',
                    fontSize: 'clamp(24px, 3vw, 34px)',
                    fontWeight: 700,
                    color: headingColor(theme),
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                    marginBottom: '20px',
                  }}
                >
                  {String(section.heading || 'Get the free guide')}
                </h2>
                <div style={{ width: '32px', height: '3px', backgroundColor: headingColor(theme), marginBottom: '24px', borderRadius: '2px' }} aria-hidden="true" />
                {section.highlightText ? (
                  <p style={{ fontSize: '16px', color: bodyColor(theme), lineHeight: 1.7, marginBottom: '16px' }}>
                    <strong style={{ color: headingColor(theme), fontWeight: 600 }}>
                      {String(section.highlightText)}
                    </strong>
                  </p>
                ) : null}
                {section.body ? (
                  <p style={{ fontSize: '15px', color: bodyColor(theme), lineHeight: 1.65 }}>
                    {String(section.body)}
                  </p>
                ) : null}
              </div>

              <div
                style={{
                  backgroundColor: 'var(--ui-color-surface)',
                  border: '1px solid var(--ui-color-border)',
                  borderTop: '3px solid var(--ui-color-primary)',
                  borderRadius: 'var(--ui-button-radius)',
                  padding: '36px',
                }}
              >
                <GuideForm {...guideFormLabels} />
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (section.blockType === 'inquiryFormSection') {
      const emailAddress = typeof section.emailAddress === 'string' && section.emailAddress.trim()
        ? section.emailAddress.trim()
        : 'hello@plenor.ai';
      const linkedinHref = typeof section.linkedinHref === 'string' && section.linkedinHref.trim()
        ? section.linkedinHref.trim()
        : 'https://www.linkedin.com/company/plenor-ai';
      const linkedinLabel = typeof section.linkedinLabel === 'string' && section.linkedinLabel.trim()
        ? section.linkedinLabel.trim()
        : 'Connect on LinkedIn';

      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '860px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '64px',
                alignItems: 'start',
              }}
            >
              <div>
                <p className="section-label" style={{ marginBottom: '16px' }}>
                  {String(section.label || 'Send an inquiry')}
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--ui-font-display)',
                    fontSize: 'clamp(24px, 3vw, 34px)',
                    fontWeight: 700,
                    color: headingColor(theme),
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                    marginBottom: '20px',
                  }}
                >
                  {String(section.heading || 'Send a direct inquiry')}
                </h2>
                {section.subtext ? (
                  <p style={{ fontSize: '15px', color: bodyColor(theme), lineHeight: 1.65, marginBottom: '32px' }}>
                    {String(section.subtext)}
                  </p>
                ) : null}

                <div
                  style={{
                    padding: '20px 24px',
                    backgroundColor: theme === 'white' || theme === 'light' ? 'var(--ui-color-section-alt)' : 'rgba(255,255,255,0.08)',
                    borderLeft: '3px solid var(--ui-color-primary)',
                    borderRadius: '0 var(--ui-button-radius) var(--ui-button-radius) 0',
                    marginBottom: '28px',
                  }}
                >
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: '14px',
                      color: headingColor(theme),
                      marginBottom: '6px',
                    }}
                  >
                    {String(section.nextStepsLabel || 'What happens next')}
                  </p>
                  <p style={{ fontSize: '14px', color: bodyColor(theme), lineHeight: 1.6 }}>
                    {String(
                      section.nextStepsBody ||
                        'We review every inquiry and respond within 2 business days.',
                    )}
                  </p>
                </div>

                <div>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: headingColor(theme), marginBottom: '8px' }}>
                    {String(section.directEmailLabel || 'Prefer email directly?')}
                  </p>
                  <a
                    href={`mailto:${emailAddress}`}
                    style={{ color: headingColor(theme), fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}
                    className="text-link"
                  >
                    {emailAddress}
                  </a>
                  <span style={{ color: mutedColor(theme), margin: '0 10px' }}>|</span>
                  <a
                    href={linkedinHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: headingColor(theme), fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}
                    className="text-link"
                  >
                    {linkedinLabel}
                  </a>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--ui-color-surface)',
                  border: '1px solid var(--ui-color-border)',
                  borderTop: '3px solid var(--ui-color-primary)',
                  borderRadius: 'var(--ui-button-radius)',
                  padding: '36px',
                }}
              >
                <InquiryForm {...inquiryFormLabels} />
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (section.blockType === 'privacyNoteSection') {
      const policyHref = typeof section.policyLinkHref === 'string' && section.policyLinkHref.trim()
        ? normalizePath(section.policyLinkHref.trim())
        : '/privacy';

      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '860px' }}>
            <p style={{ color: mutedColor(theme), fontSize: '13px', margin: 0, textAlign: 'center' }}>
              {String(section.label || 'By submitting this form, you agree to our')}{' '}
              <Link
                href={policyHref}
                style={{ color: mutedColor(theme), textDecoration: 'underline' }}
              >
                {String(section.policyLinkLabel || 'Privacy Policy')}
              </Link>
              .
            </p>
          </div>
        </section>
      );
    }

    if (section.blockType === 'imageSection') {
      const images = Array.isArray(section.images) ? section.images : [];
      const displayMode = section.displayMode === 'slideshow' ? 'slideshow' : 'grid';
      const normalizedImages = normalizeImageEntries(images);

      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={inner}>
            {section.heading ? (
              <h2 style={{ marginBottom: '24px', color: headingColor(theme) }}>{String(section.heading)}</h2>
            ) : null}
            {displayMode === 'slideshow' ? (
              <ImageSlideshow images={normalizedImages} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {normalizedImages.map((img, imageIndex: number) => (
                  <Image
                    key={`${key}-img-${imageIndex}`}
                    src={img.url}
                    alt={img.alt}
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: '100%', height: 'auto', borderRadius: '8px', border: '1px solid var(--ui-color-border)' }}
                  />
                ))}
              </div>
            )}
            {section.caption ? (
              <p style={{ marginTop: '12px', color: 'var(--ui-color-text-muted)' }}>{String(section.caption)}</p>
            ) : null}
          </div>
        </section>
      );
    }

    if (section.blockType === 'videoSection') {
      const embedUrl = typeof section.embedUrl === 'string' ? section.embedUrl : '';
      const posterUrl = getImageUrl(section.posterImage);
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '900px' }}>
            {section.heading ? (
              <h2 style={{ marginBottom: '18px', color: headingColor(theme) }}>{String(section.heading)}</h2>
            ) : null}
            <div style={{ aspectRatio: '16 / 9', backgroundColor: 'var(--ui-color-black-bg)', borderRadius: '8px', overflow: 'hidden' }}>
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={typeof section.heading === 'string' ? section.heading : 'Video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ width: '100%', height: '100%', border: 0 }}
                />
              ) : posterUrl ? (
                <Image src={posterUrl} alt="" width={0} height={0} sizes="100vw" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--ui-color-text-muted)' }}>
                  Add an embed URL or poster image
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }

    if (section.blockType === 'simpleTableSection') {
      const columns = Array.isArray(section.columns) ? section.columns : [];
      const rows = Array.isArray(section.rows) ? section.rows : [];
      return (
        <section key={key} style={sectionStyle}>
          <div style={inner}>
            {section.heading ? <h2 style={{ marginBottom: '20px', color: headingColor(theme) }}>{String(section.heading)}</h2> : null}
            <div style={{ overflowX: 'auto', border: '1px solid var(--ui-color-border)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr>
                    {columns.map((column: unknown, colIndex: number) => {
                      const label = typeof column === 'object' && column !== null ? (column as Record<string, unknown>).label : column;
                      return (
                        <th key={`${key}-col-${colIndex}`} style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid var(--ui-color-border)', backgroundColor: 'var(--ui-color-section-alt)' }}>
                          {String(label || '')}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row: unknown, rowIndex: number) => {
                    const cells = row && typeof row === 'object' && Array.isArray((row as Record<string, unknown>).cells)
                      ? (row as { cells: unknown[] }).cells
                      : [];
                    return (
                      <tr key={`${key}-row-${rowIndex}`}>
                        {cells.map((cell: unknown, cellIndex: number) => {
                          const value = typeof cell === 'object' && cell !== null ? (cell as Record<string, unknown>).value : cell;
                          return (
                            <td key={`${key}-row-${rowIndex}-cell-${cellIndex}`} style={{ padding: '12px', borderBottom: '1px solid var(--ui-color-border)' }}>
                              {String(value || '')}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      );
    }

    if (section.blockType === 'comparisonTableSection') {
      const columns = Array.isArray(section.planColumns) ? section.planColumns : [];
      const features = Array.isArray(section.features) ? section.features : [];
      return (
        <section key={key} style={sectionStyle}>
          <div style={inner}>
            {section.heading ? <h2 style={{ marginBottom: '20px', color: headingColor(theme) }}>{String(section.heading)}</h2> : null}
            <div style={{ overflowX: 'auto', border: '1px solid var(--ui-color-border)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', backgroundColor: 'var(--ui-color-section-alt)' }}>Feature</th>
                    {columns.map((column: unknown, idx: number) => {
                      const label = typeof column === 'object' && column !== null ? (column as Record<string, unknown>).label : column;
                      return (
                        <th key={`${key}-plan-col-${idx}`} style={{ padding: '12px', textAlign: 'left', backgroundColor: 'var(--ui-color-section-alt)' }}>
                          {String(label || '')}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature: unknown, rowIndex: number) => {
                    const label = feature && typeof feature === 'object' ? String((feature as { label?: string }).label || '') : '';
                    const values =
                      feature && typeof feature === 'object' && Array.isArray((feature as { values?: unknown[] }).values)
                        ? (feature as { values: unknown[] }).values
                        : [];
                    return (
                      <tr key={`${key}-feature-${rowIndex}`}>
                        <td style={{ padding: '12px', borderBottom: '1px solid var(--ui-color-border)', fontWeight: 600 }}>{label}</td>
                        {values.map((value: unknown, valueIndex: number) => {
                          const v = typeof value === 'object' && value !== null ? (value as Record<string, unknown>).value : value;
                          return (
                            <td key={`${key}-feature-${rowIndex}-value-${valueIndex}`} style={{ padding: '12px', borderBottom: '1px solid var(--ui-color-border)' }}>
                              {String(v || '')}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      );
    }

    if (section.blockType === 'dynamicListSection') {
      const config = section as PageSection & {
        source?: 'serviceItem' | 'blogPost' | 'testimonial';
        viewMode?: 'cards' | 'list' | 'table';
        filterField?: string;
        filterValue?: string;
        sortField?: string;
        sortDirection?: 'asc' | 'desc';
        limit?: number;
        enablePagination?: boolean;
        heading?: string;
      };

      const sourceItems: Array<ServiceItem | BlogPost | Testimonial> =
        config.source === 'blogPost'
          ? collections.blogPosts
          : config.source === 'testimonial'
            ? collections.testimonials
            : collections.serviceItems;

      const filtered = sourceItems.filter((item) =>
        matchesFilter(item as unknown as Record<string, unknown>, config.filterField, config.filterValue)
      );
      const filteredAndSorted = sortItems(
        filtered as unknown as Array<Record<string, unknown>>,
        config.sortField || 'publishedAt',
        config.sortDirection || 'desc'
      ) as unknown as Array<ServiceItem | BlogPost | Testimonial>;

      const limit = typeof config.limit === 'number' && config.limit > 0 ? config.limit : 6;
      const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / limit));
      const currentPage = Math.min(listPages[key] || 1, totalPages);
      const start = (currentPage - 1) * limit;
      const pageItems = filteredAndSorted.slice(start, start + limit);

      return (
        <section key={key} style={sectionStyle}>
          <div style={inner}>
            {config.heading ? <h2 style={{ marginBottom: '20px', color: headingColor(theme) }}>{config.heading}</h2> : null}
            {config.viewMode === 'table' ? (
              <div style={{ overflowX: 'auto', border: '1px solid var(--ui-color-border)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', backgroundColor: 'var(--ui-color-section-alt)' }}>Title</th>
                      <th style={{ padding: '12px', textAlign: 'left', backgroundColor: 'var(--ui-color-section-alt)' }}>Summary</th>
                      <th style={{ padding: '12px', textAlign: 'left', backgroundColor: 'var(--ui-color-section-alt)' }}>Meta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((item, itemIndex) => {
                      const normalized = renderDynamicListItem(item, config.source || 'serviceItem');
                      return (
                        <tr key={`${key}-table-row-${itemIndex}`}>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--ui-color-border)' }}>
                            <Link href={normalized.href} style={{ color: headingColor(theme), textDecoration: 'none' }}>
                              {normalized.title}
                            </Link>
                          </td>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--ui-color-border)' }}>{normalized.description}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid var(--ui-color-border)', color: 'var(--ui-color-text-muted)' }}>{normalized.meta}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : config.viewMode === 'list' ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pageItems.map((item, itemIndex) => {
                  const normalized = renderDynamicListItem(item, config.source || 'serviceItem');
                  return (
                    <li key={`${key}-list-${itemIndex}`} style={{ border: '1px solid var(--ui-color-border)', borderRadius: '8px', padding: '16px' }}>
                      <Link href={normalized.href} style={{ color: headingColor(theme), fontWeight: 600, textDecoration: 'none' }}>
                        {normalized.title}
                      </Link>
                      {normalized.description ? <p style={{ margin: '8px 0 0', color: 'var(--ui-color-text-muted)' }}>{normalized.description}</p> : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {pageItems.map((item, itemIndex) => {
                  const normalized = renderDynamicListItem(item, config.source || 'serviceItem');
                  return (
                    <article key={`${key}-card-${itemIndex}`} className="feature-card">
                      <h3 style={{ marginBottom: '8px', color: headingColor(theme), fontSize: '22px' }}>{normalized.title}</h3>
                      <p style={{ color: mutedColor(theme), marginBottom: '14px' }}>{normalized.description}</p>
                      <Link href={normalized.href} style={{ color: headingColor(theme), fontWeight: 600, textDecoration: 'none' }}>
                        Read more →
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}

            {config.enablePagination !== false && totalPages > 1 ? (
              <div style={{ marginTop: '20px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '13px' }}
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setListPages((prev) => ({ ...prev, [key]: Math.max(1, (prev[key] || 1) - 1) }))
                  }
                >
                  Previous
                </button>
                <span style={{ color: 'var(--ui-color-text-muted)', fontSize: '14px' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '13px' }}
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setListPages((prev) => ({ ...prev, [key]: Math.min(totalPages, (prev[key] || 1) + 1) }))
                  }
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </section>
      );
    }

    if (section.blockType === 'reusableSectionReference') {
      const reusableSection = section.reusableSection as {
        id?: string;
        title?: string;
        sections?: PageSection[];
      } | undefined;
      const nestedSections = Array.isArray(reusableSection?.sections) ? reusableSection.sections : [];
      return (
        <section key={key} style={sectionStyle}>
          <div style={inner}>
            <h2 style={{ marginBottom: '16px', color: headingColor(theme) }}>
              {typeof section.overrideHeading === 'string' ? section.overrideHeading : reusableSection?.title || 'Reusable Section'}
            </h2>
            {nestedSections.map((nestedSection, nestedIndex) =>
              renderSection(nestedSection, nestedIndex, `${key}-nested-${nestedIndex}-`)
            )}
          </div>
        </section>
      );
    }

    if (section.blockType === 'spacerSection') {
      const height = typeof section.height === 'number' ? section.height : 40;
      return <div key={key} style={{ height: `${height}px` }} />;
    }

    if (section.blockType === 'dividerSection') {
      return (
        <div key={key} style={{ padding: '20px 24px', backgroundColor: isDarkTheme(theme) ? getDarkBackgroundColor(theme) : getLightBackgroundColor(theme) }}>
          <div style={{ ...inner, borderTop: '1px solid var(--ui-color-border)', paddingTop: '14px' }}>
            {section.label ? <p style={{ margin: 0, fontSize: '12px', color: 'var(--ui-color-text-muted)' }}>{String(section.label)}</p> : null}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {sections.map((section, index) => renderSection(section, index, `${index}-`))}
    </>
  );
}
