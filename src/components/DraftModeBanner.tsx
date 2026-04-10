'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export default function DraftModeBanner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const returnTo = query ? `${pathname}?${query}` : pathname;
  const exitPreviewHref = `/api/draft-mode/disable?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '24px',
        zIndex: 9999,
        backgroundColor: 'var(--ui-color-primary)',
        color: 'var(--ui-color-surface)',
        padding: '12px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      }}
      role="status"
    >
      <span>
        Preview mode is active in this browser. You may be seeing unpublished content that public
        visitors cannot see yet.
      </span>
      <a
        href={exitPreviewHref}
        style={{
          color: 'var(--ui-color-surface)',
          textDecoration: 'underline',
          fontWeight: 400,
          whiteSpace: 'nowrap',
        }}
      >
        Exit preview to verify public view
      </a>
    </div>
  );
}
