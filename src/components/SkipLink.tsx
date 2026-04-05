'use client';

export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      onFocus={(e) => {
        const el = e.currentTarget;
        el.style.position = 'fixed';
        el.style.left = '16px';
        el.style.top = '16px';
        el.style.width = 'auto';
        el.style.height = 'auto';
        el.style.overflow = 'visible';
        el.style.zIndex = '9999';
        el.style.clip = 'auto';
      }}
      onBlur={(e) => {
        const el = e.currentTarget;
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        el.style.width = '1px';
        el.style.height = '1px';
        el.style.overflow = 'hidden';
        el.style.zIndex = '-1';
        el.style.clip = 'rect(0,0,0,0)';
      }}
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 0,
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        zIndex: -1,
        clip: 'rect(0,0,0,0)',
        backgroundColor: 'var(--ui-color-primary)',
        color: 'var(--ui-color-surface)',
        padding: '12px 20px',
        fontWeight: 700,
        textDecoration: 'none',
        borderRadius: '0 0 6px 6px',
      }}
    >
      Skip to main content
    </a>
  );
}
