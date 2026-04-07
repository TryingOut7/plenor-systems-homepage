'use client';

import Link from 'next/link';

export default function DraftModeBanner() {
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
      <Link
        href="/api/draft-mode/disable"
        style={{
          color: 'var(--ui-color-surface)',
          textDecoration: 'underline',
          fontWeight: 400,
          whiteSpace: 'nowrap',
        }}
      >
        Exit preview to verify public view
      </Link>
    </div>
  );
}
