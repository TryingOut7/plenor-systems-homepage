'use client';

import type { DefaultCellComponentProps } from 'payload';

function resolveAdminBasePath(): string {
  if (typeof window === 'undefined') return '/admin';

  const currentPath = window.location.pathname;
  const markers = ['/collections/', '/globals/'];
  for (const marker of markers) {
    const markerIndex = currentPath.indexOf(marker);
    if (markerIndex > 0) {
      return currentPath.slice(0, markerIndex);
    }
  }

  return '/admin';
}

function readRowId(rowData: unknown): string {
  if (!rowData || typeof rowData !== 'object') return '';
  const id = (rowData as Record<string, unknown>).id;
  if (typeof id === 'string') return id;
  if (typeof id === 'number') return String(id);
  return '';
}

function readLabel(cellData: unknown, rowData: unknown): string {
  if (typeof cellData === 'string' && cellData.trim()) return cellData.trim();

  if (!rowData || typeof rowData !== 'object') return 'Untitled';
  const record = rowData as Record<string, unknown>;
  if (typeof record.title === 'string' && record.title.trim()) return record.title.trim();
  if (typeof record.name === 'string' && record.name.trim()) return record.name.trim();
  return 'Untitled';
}

const CollectionDocumentTitleLinkCell = ({
  cellData,
  collectionSlug,
  rowData,
}: DefaultCellComponentProps) => {
  const label = readLabel(cellData, rowData);
  const rowId = readRowId(rowData);
  const slug = (() => {
    if (typeof collectionSlug === 'string' && collectionSlug.trim()) {
      return collectionSlug.trim();
    }
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/collections\/([^/?#]+)/);
      if (match?.[1]) return decodeURIComponent(match[1]);
    }
    return '';
  })();

  if (!slug || !rowId) return <span>{label}</span>;

  const href = `${resolveAdminBasePath()}/collections/${encodeURIComponent(slug)}/${encodeURIComponent(rowId)}`;

  return (
    <a
      href={href}
      onClick={(event) => event.stopPropagation()}
      style={{
        color: 'inherit',
        textDecoration: 'underline',
        textUnderlineOffset: '2px',
      }}
    >
      {label}
    </a>
  );
};

export default CollectionDocumentTitleLinkCell;
