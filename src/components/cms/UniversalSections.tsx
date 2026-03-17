'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import { createDataAttribute } from '@sanity/visual-editing';
import { useOptimistic } from '@sanity/visual-editing/react';
import type {
  BlogPost,
  CollectionData,
  PageSection,
  ServiceItem,
  Testimonial,
} from '@/sanity/cms';

type SectionTheme = 'navy' | 'charcoal' | 'black' | 'white' | 'light';
type SectionSize = 'compact' | 'regular' | 'spacious';

type DataPathSegment = string | number | { _key: string };

interface UniversalSectionsProps {
  documentId: string;
  documentType: string;
  sections: PageSection[];
  collections: CollectionData;
}

const inner: CSSProperties = { maxWidth: '1200px', margin: '0 auto' };

const sectionPadding: Record<SectionSize, string> = {
  compact: '72px 24px',
  regular: '96px 24px',
  spacious: '124px 24px',
};

const heroPadding: Record<SectionSize, string> = {
  compact: '88px 24px 96px',
  regular: '112px 24px 120px',
  spacious: '140px 24px 148px',
};

function isSectionList(value: unknown): value is PageSection[] {
  return Array.isArray(value);
}

function getDarkBackgroundColor(theme?: string): string {
  if (theme === 'charcoal') return '#1F2937';
  if (theme === 'black') return '#111827';
  return '#1B2D4F';
}

function getLightBackgroundColor(theme?: string): string {
  if (theme === 'light') return '#F8F9FA';
  return '#ffffff';
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

function getImageUrl(image: unknown): string | undefined {
  if (!image || typeof image !== 'object') return undefined;
  const candidate = image as { asset?: { url?: string } };
  return candidate.asset?.url;
}

function matchesFilter(item: Record<string, unknown>, filterField?: string, filterValue?: string): boolean {
  if (!filterField || !filterValue) return true;
  const field = item[filterField];
  if (Array.isArray(field)) {
    return field.some((entry) => String(entry).toLowerCase() === filterValue.toLowerCase());
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

function renderDynamicListItem(item: BlogPost | ServiceItem | Testimonial) {
  if ((item as BlogPost)._type === 'blogPost') {
    const blog = item as BlogPost;
    const href = `/blog/${blog.slug?.current || ''}`;
    return {
      title: blog.title || 'Untitled Post',
      description: blog.excerpt || '',
      href,
      meta: blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : '',
    };
  }
  if ((item as ServiceItem)._type === 'serviceItem') {
    const service = item as ServiceItem;
    const href = `/services/${service.slug?.current || ''}`;
    return {
      title: service.title || 'Untitled Service',
      description: service.summary || '',
      href,
      meta: service.priceFrom ? `${service.currency || 'USD'} ${service.priceFrom}` : '',
    };
  }
  const testimonial = item as Testimonial;
  const href = `/testimonials/${testimonial.slug?.current || ''}`;
  return {
    title: testimonial.personName || 'Untitled Testimonial',
    description: testimonial.quote || '',
    href,
    meta: [testimonial.role, testimonial.company].filter(Boolean).join(' · '),
  };
}

export default function UniversalSections({
  documentId,
  documentType,
  sections,
  collections,
}: UniversalSectionsProps) {
  const dataAttribute = createDataAttribute({ id: documentId, type: documentType });
  const [listPages, setListPages] = useState<Record<string, number>>({});

  const optimisticSections = useOptimistic(sections, (current, action) => {
    if (action.id !== documentId || action.type !== documentType) return current;
    const maybeSections = (action.document as { sections?: unknown })?.sections;
    return isSectionList(maybeSections) ? maybeSections : current;
  });

  const dataFor = (path: DataPathSegment[]) => dataAttribute(path);

  const renderSection = (
    section: PageSection,
    sectionPath?: DataPathSegment[],
    keyPrefix = ''
  ): React.ReactNode => {
    const key = `${keyPrefix}${section._key || section._type}`;
    const size = normalizeSize(section.size);
    const theme = normalizeTheme(section.theme);
    const padding = sectionPadding[size];
    const sectionStyle: CSSProperties = {
      padding,
      backgroundColor: theme === 'white' || theme === 'light' ? getLightBackgroundColor(theme) : getDarkBackgroundColor(theme),
    };

    if (section._type === 'heroSection') {
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          data-sanity={sectionPath ? dataFor(sectionPath) : undefined}
          style={{
            ...sectionStyle,
            padding: heroPadding[size],
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
          }}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '760px' }}>
            {typeof section.eyebrow === 'string' ? (
              <p
                className="section-label"
                style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}
                data-sanity={sectionPath ? dataFor([...sectionPath, 'eyebrow']) : undefined}
              >
                {section.eyebrow}
              </p>
            ) : null}
            <h1
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: 'clamp(36px, 5vw, 60px)',
                lineHeight: 1.1,
                marginBottom: '20px',
              }}
              data-sanity={sectionPath ? dataFor([...sectionPath, 'heading']) : undefined}
            >
              {String(section.heading || '')}
            </h1>
            {section.subheading ? (
              <p
                style={{ color: 'rgba(255,255,255,0.72)', fontSize: '18px', marginBottom: section.primaryCtaLabel ? '28px' : 0 }}
                data-sanity={sectionPath ? dataFor([...sectionPath, 'subheading']) : undefined}
              >
                {String(section.subheading)}
              </p>
            ) : null}
            {section.primaryCtaLabel ? (
              <Link
                className="btn-ghost"
                href={normalizePath(String(section.primaryCtaHref || '#'))}
                data-sanity={sectionPath ? dataFor([...sectionPath, 'primaryCtaLabel']) : undefined}
              >
                {String(section.primaryCtaLabel)}
              </Link>
            ) : null}
          </div>
        </section>
      );
    }

    if (section._type === 'richTextSection') {
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          data-sanity={sectionPath ? dataFor(sectionPath) : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '800px' }}>
            {section.heading ? (
              <h2
                data-sanity={sectionPath ? dataFor([...sectionPath, 'heading']) : undefined}
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: 'clamp(28px, 4vw, 42px)',
                  marginBottom: '24px',
                  color: '#1B2D4F',
                }}
              >
                {String(section.heading)}
              </h2>
            ) : null}
            <div data-sanity={sectionPath ? dataFor([...sectionPath, 'content']) : undefined} style={{ color: '#374151' }}>
              <PortableText value={Array.isArray(section.content) ? (section.content as PortableTextBlock[]) : []} />
            </div>
          </div>
        </section>
      );
    }

    if (section._type === 'ctaSection') {
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          data-sanity={sectionPath ? dataFor(sectionPath) : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '700px', textAlign: 'center' }}>
            {section.heading ? (
              <h2
                data-sanity={sectionPath ? dataFor([...sectionPath, 'heading']) : undefined}
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: 'clamp(26px, 4vw, 40px)',
                  color: theme === 'white' || theme === 'light' ? '#1B2D4F' : '#ffffff',
                  marginBottom: '16px',
                }}
              >
                {String(section.heading)}
              </h2>
            ) : null}
            {section.body ? (
              <p
                data-sanity={sectionPath ? dataFor([...sectionPath, 'body']) : undefined}
                style={{ color: theme === 'white' || theme === 'light' ? '#6B7280' : 'rgba(255,255,255,0.72)', marginBottom: section.buttonLabel ? '24px' : 0 }}
              >
                {String(section.body)}
              </p>
            ) : null}
            {section.buttonLabel ? (
              <Link
                className={theme === 'white' || theme === 'light' ? 'btn-primary' : 'btn-ghost'}
                href={normalizePath(String(section.buttonHref || '#'))}
                data-sanity={sectionPath ? dataFor([...sectionPath, 'buttonLabel']) : undefined}
              >
                {String(section.buttonLabel)}
              </Link>
            ) : null}
          </div>
        </section>
      );
    }

    if (section._type === 'imageSection') {
      const images = Array.isArray(section.images) ? section.images : [];
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          data-sanity={sectionPath ? dataFor(sectionPath) : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={inner}>
            {section.heading ? (
              <h2 style={{ marginBottom: '24px', color: '#1B2D4F' }} data-sanity={sectionPath ? dataFor([...sectionPath, 'heading']) : undefined}>
                {String(section.heading)}
              </h2>
            ) : null}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {images.map((image, imageIndex) => {
                const url = getImageUrl(image);
                const alt = image && typeof image === 'object' && 'alt' in image ? String((image as { alt?: string }).alt || '') : '';
                return url ? (
                  <img
                    key={`${key}-img-${imageIndex}`}
                    src={url}
                    alt={alt}
                    data-sanity={sectionPath ? dataFor([...sectionPath, 'images', imageIndex]) : undefined}
                    style={{ width: '100%', height: 'auto', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                  />
                ) : null;
              })}
            </div>
            {section.caption ? (
              <p style={{ marginTop: '12px', color: '#6B7280' }} data-sanity={sectionPath ? dataFor([...sectionPath, 'caption']) : undefined}>
                {String(section.caption)}
              </p>
            ) : null}
          </div>
        </section>
      );
    }

    if (section._type === 'videoSection') {
      const embedUrl = typeof section.embedUrl === 'string' ? section.embedUrl : '';
      const posterUrl = getImageUrl(section.posterImage);
      return (
        <section
          key={key}
          id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
          data-sanity={sectionPath ? dataFor(sectionPath) : undefined}
          style={sectionStyle}
          className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
        >
          <div style={{ ...inner, maxWidth: '900px' }}>
            {section.heading ? (
              <h2 style={{ marginBottom: '18px', color: '#1B2D4F' }} data-sanity={sectionPath ? dataFor([...sectionPath, 'heading']) : undefined}>
                {String(section.heading)}
              </h2>
            ) : null}
            <div style={{ aspectRatio: '16 / 9', backgroundColor: '#111827', borderRadius: '8px', overflow: 'hidden' }}>
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={typeof section.heading === 'string' ? section.heading : 'Video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ width: '100%', height: '100%', border: 0 }}
                  data-sanity={sectionPath ? dataFor([...sectionPath, 'embedUrl']) : undefined}
                />
              ) : posterUrl ? (
                <img src={posterUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                  Add an embed URL or poster image in Studio
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }

    if (section._type === 'simpleTableSection') {
      const columns = Array.isArray(section.columns) ? section.columns : [];
      const rows = Array.isArray(section.rows) ? section.rows : [];
      return (
        <section key={key} data-sanity={sectionPath ? dataFor(sectionPath) : undefined} style={sectionStyle}>
          <div style={inner}>
            {section.heading ? <h2 style={{ marginBottom: '20px', color: '#1B2D4F' }}>{String(section.heading)}</h2> : null}
            <div style={{ overflowX: 'auto', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr>
                    {columns.map((column, colIndex) => (
                      <th key={`${key}-col-${colIndex}`} style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F8F9FA' }}>
                        {String(column)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => {
                    const cells = row && typeof row === 'object' && Array.isArray((row as { cells?: unknown[] }).cells)
                      ? (row as { cells: unknown[] }).cells
                      : [];
                    return (
                      <tr key={`${key}-row-${rowIndex}`}>
                        {cells.map((cell, cellIndex) => (
                          <td key={`${key}-row-${rowIndex}-cell-${cellIndex}`} style={{ padding: '12px', borderBottom: '1px solid #F3F4F6' }}>
                            {String(cell || '')}
                          </td>
                        ))}
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

    if (section._type === 'comparisonTableSection') {
      const columns = Array.isArray(section.planColumns) ? section.planColumns : [];
      const features = Array.isArray(section.features) ? section.features : [];
      return (
        <section key={key} data-sanity={sectionPath ? dataFor(sectionPath) : undefined} style={sectionStyle}>
          <div style={inner}>
            {section.heading ? <h2 style={{ marginBottom: '20px', color: '#1B2D4F' }}>{String(section.heading)}</h2> : null}
            <div style={{ overflowX: 'auto', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', backgroundColor: '#F8F9FA' }}>Feature</th>
                    {columns.map((column, idx) => (
                      <th key={`${key}-plan-col-${idx}`} style={{ padding: '12px', textAlign: 'left', backgroundColor: '#F8F9FA' }}>
                        {String(column)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, rowIndex) => {
                    const label = feature && typeof feature === 'object' ? String((feature as { label?: string }).label || '') : '';
                    const values =
                      feature && typeof feature === 'object' && Array.isArray((feature as { values?: unknown[] }).values)
                        ? (feature as { values: unknown[] }).values
                        : [];
                    return (
                      <tr key={`${key}-feature-${rowIndex}`}>
                        <td style={{ padding: '12px', borderBottom: '1px solid #F3F4F6', fontWeight: 600 }}>{label}</td>
                        {values.map((value, valueIndex) => (
                          <td key={`${key}-feature-${rowIndex}-value-${valueIndex}`} style={{ padding: '12px', borderBottom: '1px solid #F3F4F6' }}>
                            {String(value || '')}
                          </td>
                        ))}
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

    if (section._type === 'dynamicListSection') {
      const config = section as PageSection & {
        source?: 'blogPost' | 'serviceItem' | 'testimonial';
        viewMode?: 'cards' | 'list' | 'table';
        filterField?: string;
        filterValue?: string;
        sortField?: string;
        sortDirection?: 'asc' | 'desc';
        limit?: number;
        enablePagination?: boolean;
        heading?: string;
      };

      const sourceItems =
        config.source === 'serviceItem'
          ? collections.serviceItems
          : config.source === 'testimonial'
            ? collections.testimonials
            : collections.blogPosts;

      const filtered = sourceItems.filter((item) =>
        matchesFilter(item as Record<string, unknown>, config.filterField, config.filterValue)
      );
      const filteredAndSorted = sortItems(
        filtered as Array<Record<string, unknown>>,
        config.sortField || 'publishedAt',
        config.sortDirection || 'desc'
      ) as Array<BlogPost | ServiceItem | Testimonial>;

      const limit = typeof config.limit === 'number' && config.limit > 0 ? config.limit : 6;
      const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / limit));
      const currentPage = Math.min(listPages[key] || 1, totalPages);
      const start = (currentPage - 1) * limit;
      const pageItems = filteredAndSorted.slice(start, start + limit);

      return (
        <section key={key} data-sanity={sectionPath ? dataFor(sectionPath) : undefined} style={sectionStyle}>
          <div style={inner}>
            {config.heading ? <h2 style={{ marginBottom: '20px', color: '#1B2D4F' }}>{config.heading}</h2> : null}
            {config.viewMode === 'table' ? (
              <div style={{ overflowX: 'auto', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', backgroundColor: '#F8F9FA' }}>Title</th>
                      <th style={{ padding: '12px', textAlign: 'left', backgroundColor: '#F8F9FA' }}>Summary</th>
                      <th style={{ padding: '12px', textAlign: 'left', backgroundColor: '#F8F9FA' }}>Meta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((item, itemIndex) => {
                      const normalized = renderDynamicListItem(item);
                      return (
                        <tr key={`${key}-table-row-${itemIndex}`}>
                          <td style={{ padding: '12px', borderBottom: '1px solid #F3F4F6' }}>
                            <Link href={normalized.href} style={{ color: '#1B2D4F', textDecoration: 'none' }}>
                              {normalized.title}
                            </Link>
                          </td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #F3F4F6' }}>{normalized.description}</td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #F3F4F6', color: '#6B7280' }}>{normalized.meta}</td>
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
                    <li key={`${key}-list-${itemIndex}`} style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px' }}>
                      <Link href={normalized.href} style={{ color: '#1B2D4F', fontWeight: 600, textDecoration: 'none' }}>
                        {normalized.title}
                      </Link>
                      {normalized.description ? <p style={{ margin: '8px 0 0', color: '#6B7280' }}>{normalized.description}</p> : null}
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
                      <h3 style={{ marginBottom: '8px', color: '#1B2D4F', fontSize: '22px' }}>{normalized.title}</h3>
                      <p style={{ color: '#6B7280', marginBottom: '14px' }}>{normalized.description}</p>
                      <Link href={normalized.href} style={{ color: '#1B2D4F', fontWeight: 600, textDecoration: 'none' }}>
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
                <span style={{ color: '#6B7280', fontSize: '14px' }}>
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

    if (section._type === 'reusableSectionReference') {
      const reusableSection = section.reusableSection as { title?: string; sections?: PageSection[] } | undefined;
      const nestedSections = Array.isArray(reusableSection?.sections) ? reusableSection?.sections : [];
      return (
        <section key={key} style={sectionStyle}>
          <div style={inner}>
            <h2 style={{ marginBottom: '16px', color: '#1B2D4F' }}>
              {typeof section.overrideHeading === 'string' ? section.overrideHeading : reusableSection?.title || 'Reusable Section'}
            </h2>
            {nestedSections.map((nestedSection, nestedIndex) =>
              renderSection(nestedSection, undefined, `${key}-nested-${nestedIndex}-`)
            )}
          </div>
        </section>
      );
    }

    if (section._type === 'spacerSection') {
      const height = typeof section.height === 'number' ? section.height : 40;
      return <div key={key} style={{ height: `${height}px` }} />;
    }

    if (section._type === 'dividerSection') {
      return (
        <div key={key} style={{ padding: '20px 24px', backgroundColor: getLightBackgroundColor(theme) }}>
          <div style={{ ...inner, borderTop: '1px solid #E5E7EB', paddingTop: '14px' }}>
            {section.label ? <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF' }}>{String(section.label)}</p> : null}
          </div>
        </div>
      );
    }

    if (section._type === 'advancedDataSection') {
      return (
        <section key={key} style={sectionStyle}>
          <div style={inner}>
            <h3 style={{ marginBottom: '10px', color: '#1B2D4F' }}>{String(section.title || 'Advanced Data Block')}</h3>
            <p style={{ color: '#6B7280', margin: 0 }}>
              This block stores advanced Sanity types (reference, cross-dataset reference, global document reference, geopoint, file, date, datetime).
            </p>
          </div>
        </section>
      );
    }

    return null;
  };

  return (
    <>
      {optimisticSections.map((section, index) => {
        const sectionPath: DataPathSegment[] = section._key
          ? ['sections', { _key: section._key }]
          : ['sections', index];
        return renderSection(section, sectionPath, `${index}-`);
      })}
    </>
  );
}
