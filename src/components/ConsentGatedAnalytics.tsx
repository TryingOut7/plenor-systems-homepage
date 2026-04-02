'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const CONSENT_STORAGE_KEY = 'plenor_cookie_consent';

function hasAcceptedConsent(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(CONSENT_STORAGE_KEY) === 'accepted';
}

export default function ConsentGatedAnalytics({
  analyticsId,
}: {
  analyticsId: string;
}) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const syncConsent = () => {
      setEnabled(hasAcceptedConsent());
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === CONSENT_STORAGE_KEY) {
        syncConsent();
      }
    };

    syncConsent();
    window.addEventListener(
      'cookie_consent_accepted',
      syncConsent as EventListener,
    );
    window.addEventListener(
      'cookie_consent_declined',
      syncConsent as EventListener,
    );
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(
        'cookie_consent_accepted',
        syncConsent as EventListener,
      );
      window.removeEventListener(
        'cookie_consent_declined',
        syncConsent as EventListener,
      );
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <Script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={`{"token": "${analyticsId}"}`}
      strategy="afterInteractive"
    />
  );
}
