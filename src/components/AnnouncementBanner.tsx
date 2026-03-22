'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const DISMISS_KEY = 'announcement-banner-dismissed';

interface AnnouncementBannerProps {
  enabled?: boolean;
  text?: string;
  linkLabel?: string;
  linkHref?: string;
  backgroundColor?: string;
  textColor?: string;
}

export default function AnnouncementBanner({
  enabled,
  text,
  linkLabel,
  linkHref,
  backgroundColor = '#1B2D4F',
  textColor = '#FFFFFF',
}: AnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === '1');
  }, []);

  if (!enabled || !text || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  return (
    <div
      role="banner"
      aria-label="Announcement"
      style={{
        backgroundColor,
        color: textColor,
        padding: '10px 32px',
        textAlign: 'center',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        position: 'relative',
      }}
    >
      <span>{text}</span>
      {linkLabel && linkHref && (
        <Link
          href={linkHref}
          style={{
            color: textColor,
            fontWeight: 600,
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
            whiteSpace: 'nowrap',
          }}
        >
          {linkLabel}
        </Link>
      )}
      <button
        type="button"
        aria-label="Dismiss announcement"
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: textColor,
          opacity: 0.7,
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <line x1="12" y1="4" x2="4" y2="12" />
          <line x1="4" y1="4" x2="12" y2="12" />
        </svg>
      </button>
    </div>
  );
}
