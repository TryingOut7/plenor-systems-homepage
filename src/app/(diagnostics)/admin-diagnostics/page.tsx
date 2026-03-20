import React from 'react'

export const dynamic = 'force-dynamic'

export default async function AdminDiagnosticsPage() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    env: {
      DATABASE_URI: process.env.DATABASE_URI
        ? `set (${process.env.DATABASE_URI.slice(0, 25)}...)`
        : 'MISSING',
      DATABASE_URL: process.env.DATABASE_URL
        ? `set (${process.env.DATABASE_URL.slice(0, 25)}...)`
        : 'MISSING',
      PAYLOAD_SECRET: process.env.PAYLOAD_SECRET
        ? `set (${process.env.PAYLOAD_SECRET.length} chars)`
        : 'MISSING',
      NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || 'MISSING',
      VERCEL_URL: process.env.VERCEL_URL || 'MISSING',
      VERCEL_ENV: process.env.VERCEL_ENV || 'MISSING',
      NODE_ENV: process.env.NODE_ENV,
    },
  }

  // Test Payload config import
  try {
    const config = (await import('@/payload.config')).default
    diagnostics.configImport = 'OK'

    // Test Payload initialization + DB
    try {
      const { getPayload } = await import('payload')
      const payload = await getPayload({ config })
      diagnostics.payloadInit = 'OK'

      const users = await payload.find({ collection: 'users', limit: 0 })
      diagnostics.database = `OK (${users.totalDocs} users)`
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err))
      diagnostics.payloadInit = 'FAILED'
      diagnostics.payloadError = error.message
      diagnostics.payloadStack = error.stack?.split('\n').slice(0, 6)
    }
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err))
    diagnostics.configImport = 'FAILED'
    diagnostics.configError = error.message
  }

  return (
    <>
      <h1 style={{ color: '#f39c12' }}>Admin Diagnostics</h1>
      <pre
        style={{
          background: '#1a1a2e',
          padding: '1.5rem',
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '0.875rem',
          lineHeight: 1.7,
        }}
      >
        {JSON.stringify(diagnostics, null, 2)}
      </pre>
    </>
  )
}
