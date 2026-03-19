'use client';

import { useState, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import RichText from './RichText';
import GuideForm from '@/components/GuideForm';
import InquiryForm from '@/components/InquiryForm';
import type {
  CollectionData,
  PageSection,
  ServiceItem,
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

function renderDynamicListItem(item: ServiceItem) {
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
  const [slideIndexes, setSlideIndexes] = useState<Record<string, number>>({});

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
      const normalizedImages = images
        .map((imageEntry: unknown) => {
          const img = typeof imageEntry === 'object' && imageEntry !== null
            ? (imageEntry as Record<string, unknown>).image
            : imageEntry;
          const url = getImageUrl(img);
          if (!url) return null;
          return { url, alt: getImageAlt(img) };
        })
        .filter((entry): entry is { url: string; alt: string } => !!entry);

      const currentIndexRaw = slideIndexes[key] ?? 0;
      const currentIndex = normalizedImages.length
        ? Math.max(0, Math.min(normalizedImages.length - 1, currentIndexRaw))
        : 0;

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
              normalizedImages.length > 0 ? (
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <Image
                      src={normalizedImages[currentIndex].url}
                      alt={normalizedImages[currentIndex].alt}
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ width: '100%', height: 'auto', borderRadius: '8px', border: '1px solid var(--ui-color-border)' }}
                    />
                  </div>
                  {normalizedImages.length > 1 ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() =>
                          setSlideIndexes((prev) => ({
                            ...prev,
                            [key]:
                              (currentIndex - 1 + normalizedImages.length) % normalizedImages.length,
                          }))
                        }
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
                      <span style={{ color: 'var(--ui-color-text-muted)', fontSize: '14px' }}>
                        {currentIndex + 1} / {normalizedImages.length}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setSlideIndexes((prev) => ({
                            ...prev,
                            [key]: (currentIndex + 1) % normalizedImages.length,
                          }))
                        }
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
              ) : null
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
        source?: 'serviceItem';
        viewMode?: 'cards' | 'list' | 'table';
        filterField?: string;
        filterValue?: string;
        sortField?: string;
        sortDirection?: 'asc' | 'desc';
        limit?: number;
        enablePagination?: boolean;
        heading?: string;
      };

      const sourceItems = collections.serviceItems;

      const filtered = sourceItems.filter((item) =>
        matchesFilter(item as unknown as Record<string, unknown>, config.filterField, config.filterValue)
      );
      const filteredAndSorted = sortItems(
        filtered as unknown as Array<Record<string, unknown>>,
        config.sortField || 'publishedAt',
        config.sortDirection || 'desc'
      ) as unknown as ServiceItem[];

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
                      const normalized = renderDynamicListItem(item);
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
                  const normalized = renderDynamicListItem(item);
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
                  const normalized = renderDynamicListItem(item);
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
        <div key={key} style={{ padding: '20px 24px', backgroundColor: getLightBackgroundColor(theme) }}>
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
