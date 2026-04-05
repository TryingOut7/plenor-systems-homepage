'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { BlogPost, ServiceItem, Testimonial } from '@/payload/cms';
import SectionHeading from './shared/SectionHeading';
import type { SectionRendererProps } from './types';
import { asSectionRecord, matchesFilter, renderDynamicListItem, sortItems } from './utils';

type DynamicListConfig = {
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

export default function DynamicListSection({
  section,
  sectionKey,
  sectionStyle,
  hTag,
  hFontSize,
  innerStyle,
  collections,
  resolvedHeadingColor,
  resolvedMutedColor,
}: Omit<SectionRendererProps, 'listPages' | 'setListPages'>) {
  const [currentPage, setCurrentPage] = useState(1);
  const config = asSectionRecord(section) as typeof section & DynamicListConfig;

  const sourceItems: Array<ServiceItem | BlogPost | Testimonial> =
    config.source === 'blogPost'
      ? collections.blogPosts
      : config.source === 'testimonial'
        ? collections.testimonials
        : collections.serviceItems;

  const filtered = sourceItems.filter((item) =>
    matchesFilter(
      item as unknown as Record<string, unknown>,
      config.filterField,
      config.filterValue,
    ),
  );

  const filteredAndSorted = sortItems(
    filtered as unknown as Array<Record<string, unknown>>,
    config.sortField || 'publishedAt',
    config.sortDirection || 'desc',
  ) as unknown as Array<ServiceItem | BlogPost | Testimonial>;

  const limit = typeof config.limit === 'number' && config.limit > 0 ? config.limit : 6;
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / limit));
  const clampedPage = Math.min(currentPage, totalPages);
  const start = (clampedPage - 1) * limit;
  const pageItems = filteredAndSorted.slice(start, start + limit);

  return (
    <section key={sectionKey} style={sectionStyle}>
      <div style={innerStyle}>
        {config.heading ? (
          <SectionHeading
            tag={hTag}
            style={{ marginBottom: '20px', color: resolvedHeadingColor, fontSize: hFontSize }}
          >
            {config.heading}
          </SectionHeading>
        ) : null}

        {config.viewMode === 'table' ? (
          <div style={{ overflowX: 'auto', border: '1px solid var(--ui-color-border)', borderRadius: '8px' }}>
            <table className="cms-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Summary</th>
                  <th>Meta</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item, itemIndex) => {
                  const normalized = renderDynamicListItem(item, config.source || 'serviceItem');
                  return (
                    <tr key={`${sectionKey}-table-row-${itemIndex}`}>
                      <td>
                        <Link href={normalized.href} style={{ color: resolvedHeadingColor, textDecoration: 'none', fontWeight: 600 }}>
                          {normalized.title}
                        </Link>
                      </td>
                      <td style={{ color: resolvedMutedColor }}>{normalized.description}</td>
                      <td style={{ color: resolvedMutedColor }}>{normalized.meta}</td>
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
                <li key={`${sectionKey}-list-${itemIndex}`} style={{ border: '1px solid var(--ui-color-border)', borderRadius: '8px', padding: '16px' }}>
                  <Link href={normalized.href} style={{ color: resolvedHeadingColor, fontWeight: 600, textDecoration: 'none' }}>
                    {normalized.title}
                  </Link>
                  {normalized.description ? <p style={{ margin: '8px 0 0', color: resolvedMutedColor }}>{normalized.description}</p> : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {pageItems.map((item, itemIndex) => {
              const normalized = renderDynamicListItem(item, config.source || 'serviceItem');
              return (
                <article key={`${sectionKey}-card-${itemIndex}`} className="feature-card">
                  <h3 style={{ marginBottom: '8px', color: resolvedHeadingColor, fontSize: '22px' }}>{normalized.title}</h3>
                  <p style={{ color: resolvedMutedColor, marginBottom: '14px' }}>{normalized.description}</p>
                  <Link href={normalized.href} style={{ color: resolvedHeadingColor, fontWeight: 600, textDecoration: 'none' }}>
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
              disabled={clampedPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span style={{ color: resolvedMutedColor, fontSize: '14px' }}>
              Page {clampedPage} of {totalPages}
            </span>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '13px' }}
              disabled={clampedPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
