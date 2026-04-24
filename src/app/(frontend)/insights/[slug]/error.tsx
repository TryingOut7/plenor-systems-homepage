'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function InsightDetailError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      console.error('Insight detail error:', error);
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
        Could not load insight
      </h1>
      <p
        style={{
          color: 'var(--ui-color-text-muted)',
          lineHeight: 1.7,
          marginBottom: '32px',
        }}
      >
        There was a problem loading this insight. You can try again or browse all insights.
      </p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={reset}
          style={{
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
        <Link
          href="/insights"
          style={{
            display: 'inline-block',
            padding: '10px 24px',
            border: '1px solid var(--ui-color-border)',
            borderRadius: 'var(--ui-card-radius)',
            fontWeight: 700,
            textDecoration: 'none',
            color: 'var(--ui-color-primary)',
          }}
        >
          All insights
        </Link>
      </div>
    </div>
  );
}
