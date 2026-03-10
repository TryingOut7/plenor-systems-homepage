import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you requested could not be found.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section
      aria-labelledby="not-found-heading"
      style={{
        padding: '120px 24px',
        backgroundColor: '#ffffff',
        textAlign: 'center',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p
        aria-hidden="true"
        style={{ fontSize: '64px', fontWeight: 700, color: '#E5E7EB', lineHeight: 1, marginBottom: '16px' }}
      >
        404
      </p>
      <h1
        id="not-found-heading"
        style={{ fontSize: '28px', fontWeight: 700, color: '#1B2D4F', marginBottom: '12px' }}
      >
        Page not found
      </h1>
      <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.6, marginBottom: '36px', maxWidth: '400px' }}>
        The page you&apos;re looking for doesn&apos;t exist or has moved. Head back to the homepage
        to find what you need.
      </p>
      <Link href="/" className="btn-primary">
        Back to Home
      </Link>
    </section>
  );
}
