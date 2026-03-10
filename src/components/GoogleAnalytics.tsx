'use client';

import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Extend window for gtag
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID;

function loadGtag(measurementId: string) {
  if (!measurementId || measurementId === 'G-XXXXXXXXXX') return;
  if (document.querySelector(`script[src*="${measurementId}"]`)) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { send_page_view: false });

  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.async = true;
  document.head.appendChild(script);
}

function pageView(url: string) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', { page_path: url });
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initAnalytics = useCallback(() => {
    if (!GA_ID) return;
    loadGtag(GA_ID);
    pageView(window.location.pathname + window.location.search);
  }, []);

  // Load GA4 only after cookie consent is accepted
  useEffect(() => {
    // Check if already consented on mount
    const consent = localStorage.getItem('plenor_cookie_consent');
    if (consent === 'accepted') {
      initAnalytics();
    }

    // Listen for runtime acceptance (user clicks Accept on the banner)
    window.addEventListener('cookie_consent_accepted', initAnalytics);
    return () => window.removeEventListener('cookie_consent_accepted', initAnalytics);
  }, [initAnalytics]);

  // Track page views on route change (only fires if GA4 is already loaded)
  useEffect(() => {
    if (typeof window.gtag !== 'function') return;
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    pageView(url);
  }, [pathname, searchParams]);

  // No DOM output — analytics only
  return null;
}
