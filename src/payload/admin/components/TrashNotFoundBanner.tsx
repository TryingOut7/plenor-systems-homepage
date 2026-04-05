'use client';

function readNotFoundId(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const value = params.get('notFound');
  return value && value.trim() ? value.trim() : null;
}

function readCollectionSlug(): string | null {
  if (typeof window === 'undefined') return null;
  const match = window.location.pathname.match(/\/collections\/([^/?#]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function resolveAdminBasePath(): string {
  if (typeof window === 'undefined') return '/admin';
  const currentPath = window.location.pathname;
  const markerIndex = currentPath.indexOf('/collections/');
  return markerIndex > 0 ? currentPath.slice(0, markerIndex) : '/admin';
}

const TrashNotFoundBanner = () => {
  const id = readNotFoundId();
  if (!id) return null;

  const collectionSlug = readCollectionSlug();
  if (!collectionSlug) return null;

  const adminBase = resolveAdminBasePath();
  const trashHref = `${adminBase}/collections/${encodeURIComponent(collectionSlug)}/trash/${encodeURIComponent(id)}`;

  return (
    <div
      style={{
        background: '#FFF7ED',
        border: '1px solid #FB923C',
        borderRadius: '6px',
        padding: '10px 14px',
        marginBottom: '16px',
        fontSize: '13px',
        color: '#9A3412',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <span>This document has been moved to Trash.</span>
      <a
        href={trashHref}
        style={{
          color: '#9A3412',
          fontWeight: 600,
          textDecoration: 'underline',
          textUnderlineOffset: '2px',
          whiteSpace: 'nowrap',
        }}
      >
        View in Trash →
      </a>
    </div>
  );
};

export default TrashNotFoundBanner;
