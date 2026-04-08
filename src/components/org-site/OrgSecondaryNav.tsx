'use client';

import Link from 'next/link';
import { useMemo, useRef } from 'react';
import { stripQueryAndHash } from '@/lib/org-site-helpers';

type NavItem = {
  label: string;
  href: string;
};

type OrgSecondaryNavProps = {
  items: NavItem[];
  activeHref: string;
  navLabel?: string;
};

function normalizePath(value: string): string {
  const trimmed = stripQueryAndHash(value).replace(/\/+$/, '');
  return trimmed || '/';
}

function isQueryHref(value: string): boolean {
  return value.includes('?');
}

function isItemActive(itemHref: string, activeHref: string, basePath: string): boolean {
  if (!itemHref) return false;

  if (isQueryHref(itemHref)) {
    return activeHref === itemHref;
  }

  const normalizedItemPath = normalizePath(itemHref);
  const normalizedActivePath = normalizePath(activeHref);

  if (normalizedItemPath === basePath) {
    return normalizedActivePath === basePath;
  }

  if (normalizedActivePath === normalizedItemPath) return true;
  return normalizedActivePath.startsWith(`${normalizedItemPath}/`);
}

export default function OrgSecondaryNav({
  items,
  activeHref,
  navLabel = 'Community sections',
}: OrgSecondaryNavProps) {
  const tabRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  const basePath = useMemo(() => {
    const nonQueryPaths = items
      .map((item) => item.href)
      .filter((href) => !isQueryHref(href))
      .map((href) => normalizePath(href));

    if (nonQueryPaths.length === 0) return normalizePath(activeHref);
    return nonQueryPaths.reduce((shortest, current) =>
      current.length < shortest.length ? current : shortest,
    );
  }, [activeHref, items]);

  const activeIndex = useMemo(
    () => items.findIndex((item) => isItemActive(item.href, activeHref, basePath)),
    [activeHref, basePath, items],
  );

  const fallbackIndex = activeIndex >= 0 ? activeIndex : 0;

  return (
    <nav aria-label={navLabel} style={{ marginBottom: '28px' }}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '4px',
          borderBottom: '1px solid var(--ui-color-border)',
          scrollbarWidth: 'thin',
        }}
      >
        {items.map((item, index) => {
          const selected = isItemActive(item.href, activeHref, basePath);
          const tabIndex = selected || index === fallbackIndex ? 0 : -1;

          return (
            <Link
              key={item.href}
              href={item.href}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              role="tab"
              aria-selected={selected}
              tabIndex={tabIndex}
              onKeyDown={(event) => {
                const key = event.key;
                const tabsCount = items.length;
                if (tabsCount === 0) return;

                let nextIndex = index;
                if (key === 'ArrowRight') {
                  event.preventDefault();
                  nextIndex = (index + 1) % tabsCount;
                } else if (key === 'ArrowLeft') {
                  event.preventDefault();
                  nextIndex = (index - 1 + tabsCount) % tabsCount;
                } else if (key === 'Home') {
                  event.preventDefault();
                  nextIndex = 0;
                } else if (key === 'End') {
                  event.preventDefault();
                  nextIndex = tabsCount - 1;
                } else {
                  return;
                }

                tabRefs.current[nextIndex]?.focus();
              }}
              style={{
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                fontWeight: selected ? 700 : 600,
                fontSize: '14px',
                padding: '10px 14px',
                borderRadius: '999px',
                border: selected ? '1px solid var(--ui-color-primary)' : '1px solid transparent',
                color: selected ? 'var(--ui-color-primary)' : 'var(--ui-color-text-muted)',
                backgroundColor: selected ? 'rgba(27, 45, 79, 0.08)' : 'transparent',
                transition: 'all 0.2s ease',
                outlineOffset: 2,
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
