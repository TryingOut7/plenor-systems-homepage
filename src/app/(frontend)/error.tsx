'use client';

import { useEffect } from 'react';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function FrontendError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log to error reporting service in production
    if (process.env.NODE_ENV !== 'development') {
      console.error('Frontend page error:', error);
    }
  }, [error]);

  return (
    <div
      style={{
        maxWidth: '640px',
        margin: '80px auto',
        padding: '0 24px',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontSize: '2rem',
          lineHeight: 1.2,
          color: 'var(--ui-color-primary)',
          marginBottom: '16px',
        }}
      >
        Something went wrong
      </h1>
      <p
        style={{
          color: 'var(--ui-color-text-muted)',
          lineHeight: 1.7,
          marginBottom: '32px',
        }}
      >
        An unexpected error occurred while loading this page.
      </p>
      <button
        onClick={reset}
        style={{
          display: 'inline-block',
          padding: '10px 24px',
          backgroundColor: 'var(--ui-color-primary)',
          color: 'var(--ui-color-bg)',
          border: 'none',
          borderRadius: 'var(--ui-card-radius)',
          fontWeight: 700,
          cursor: 'pointer',
          fontSize: '1rem',
        }}
      >
        Try again
      </button>
    </div>
  );
}
