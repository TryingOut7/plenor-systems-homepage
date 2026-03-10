'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('plenor_cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem('plenor_cookie_consent', 'accepted');
    setVisible(false);
    // Analytics activation hook – will be wired in Step 3
    window.dispatchEvent(new CustomEvent('cookie_consent_accepted'));
  }

  function decline() {
    localStorage.setItem('plenor_cookie_consent', 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1B2D4F',
        color: '#ffffff',
        padding: '16px 24px',
        zIndex: 100,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 -2px 16px rgba(0,0,0,0.15)',
      }}
    >
      <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, flex: '1 1 300px' }}>
        We use analytics cookies to understand how visitors use this site. No cookies are set before
        you consent.{' '}
        <Link href="/privacy" style={{ color: '#93C5FD', textDecoration: 'underline' }}>
          Privacy Policy
        </Link>
      </p>
      <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            background: 'transparent',
            border: '1.5px solid rgba(255,255,255,0.5)',
            color: '#ffffff',
            padding: '8px 18px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'border-color 0.2s ease',
          }}
          aria-label="Decline analytics cookies"
        >
          Decline
        </button>
        <button
          onClick={accept}
          style={{
            background: '#ffffff',
            border: 'none',
            color: '#1B2D4F',
            padding: '8px 18px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 700,
            transition: 'opacity 0.2s ease',
          }}
          aria-label="Accept analytics cookies"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
