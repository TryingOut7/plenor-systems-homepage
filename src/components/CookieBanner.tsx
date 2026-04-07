'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';

const CONSENT_STORAGE_KEY = 'plenor_cookie_consent';

function subscribeToStorage(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getConsentSnapshot(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    // If storage is blocked, treat as no consent stored.
    return null;
  }
}

interface CookieBannerProps {
  message?: string;
  acceptLabel?: string;
  declineLabel?: string;
  privacyLabel?: string;
  privacyHref?: string;
}

export default function CookieBanner({
  message = 'We use analytics cookies to understand how visitors use this site. No cookies are set before you consent.',
  acceptLabel = 'Accept',
  declineLabel = 'Decline',
  privacyLabel = 'Privacy Policy',
  privacyHref = '/privacy',
}: CookieBannerProps) {
  // useSyncExternalStore avoids the setState-in-effect anti-pattern.
  // Server snapshot returns a non-null string so the banner stays hidden during SSR.
  const consent = useSyncExternalStore(subscribeToStorage, getConsentSnapshot, () => 'ssr');

  function setConsent(value: string, eventName: string) {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, value);
      // Dispatch storage event so this tab re-reads the snapshot.
      window.dispatchEvent(new StorageEvent('storage', { key: CONSENT_STORAGE_KEY }));
    } catch {
      // Ignore storage write errors; closing the banner remains best-effort.
    }
    window.dispatchEvent(new CustomEvent(eventName));
  }

  function accept() {
    setConsent('accepted', 'cookie_consent_accepted');
  }

  function decline() {
    setConsent('declined', 'cookie_consent_declined');
  }

  // consent === null means no value in localStorage → show banner.
  // Any other value (SSR placeholder or stored consent string) → hide.
  if (consent !== null) return null;

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
        backgroundColor: 'var(--ui-color-cookie-bg)',
        color: 'var(--ui-color-cookie-text)',
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
        {message}{' '}
        <Link href={privacyHref} style={{ color: 'var(--ui-color-cookie-link)', textDecoration: 'underline' }}>
          {privacyLabel}
        </Link>
      </p>
      <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            background: 'transparent',
            border: '1.5px solid rgba(255,255,255,0.5)',
            color: 'var(--ui-color-cookie-text)',
            padding: '8px 18px',
            borderRadius: 'var(--ui-button-radius)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'border-color 0.2s ease',
          }}
          aria-label={`${declineLabel} analytics cookies`}
        >
          {declineLabel}
        </button>
        <button
          onClick={accept}
          style={{
            background: 'var(--ui-color-surface)',
            border: 'none',
            color: 'var(--ui-color-primary)',
            padding: '8px 18px',
            borderRadius: 'var(--ui-button-radius)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 700,
            transition: 'opacity 0.2s ease',
          }}
          aria-label={`${acceptLabel} analytics cookies`}
        >
          {acceptLabel}
        </button>
      </div>
    </div>
  );
}
