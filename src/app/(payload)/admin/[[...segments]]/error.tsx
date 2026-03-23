'use client'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        padding: '2rem',
        maxWidth: '600px',
        margin: '4rem auto',
      }}
    >
      <h2 style={{ color: '#c0392b', marginBottom: '1rem' }}>
        Admin panel failed to load
      </h2>
      <p style={{ marginBottom: '0.5rem' }}>
        <strong>Error:</strong> {error.message}
      </p>
      {error.digest && (
        <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.875rem' }}>
          Digest: {error.digest}
        </p>
      )}
      <p style={{ marginBottom: '1.5rem', color: '#555', fontSize: '0.9rem' }}>
        Common causes: missing <code>DATABASE_URI</code>,{' '}
        <code>PAYLOAD_SECRET</code>, or database connection issues. Check your
        server logs and environment variables.
      </p>
      <button
        onClick={reset}
        style={{
          padding: '0.5rem 1rem',
          background: '#0b3a63',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  )
}
