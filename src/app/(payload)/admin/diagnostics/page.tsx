import React from 'react'

export const dynamic = 'force-dynamic'

export default async function AdminDiagnosticsPage() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    env: {
      DATABASE_URI: process.env.DATABASE_URI ? `set (${process.env.DATABASE_URI.slice(0, 20)}...)` : 'MISSING',
      DATABASE_URL: process.env.DATABASE_URL ? `set (${process.env.DATABASE_URL.slice(0, 20)}...)` : 'MISSING',
      PAYLOAD_SECRET: process.env.PAYLOAD_SECRET ? `set (${process.env.PAYLOAD_SECRET.length} chars)` : 'MISSING',
      NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || 'MISSING',
      VERCEL_URL: process.env.VERCEL_URL || 'MISSING',
      VERCEL_ENV: process.env.VERCEL_ENV || 'MISSING',
      NODE_ENV: process.env.NODE_ENV,
    },
  }

  try {
    const { getPayload } = await import('payload')
    const config = (await import('@/payload.config')).default
    diagnostics.configLoaded = true

    const payload = await getPayload({ config })
    diagnostics.payloadInitialized = true

    const users = await payload.find({ collection: 'users', limit: 0 })
    diagnostics.databaseConnected = true
    diagnostics.userCount = users.totalDocs
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err))
    diagnostics.error = error.message
    diagnostics.errorStack = error.stack?.split('\n').slice(0, 8)
  }

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', background: '#111', color: '#eee' }}>
        <h1 style={{ color: '#f39c12' }}>Admin Diagnostics</h1>
        <pre style={{ background: '#1a1a2e', padding: '1.5rem', borderRadius: '8px', overflow: 'auto', fontSize: '0.9rem', lineHeight: 1.6 }}>
          {JSON.stringify(diagnostics, null, 2)}
        </pre>
      </body>
    </html>
  )
}
