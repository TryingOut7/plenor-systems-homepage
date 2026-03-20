import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URI: process.env.DATABASE_URI ? '✅ set' : '❌ missing',
      DATABASE_URL: process.env.DATABASE_URL ? '✅ set' : '❌ missing',
      PAYLOAD_SECRET: process.env.PAYLOAD_SECRET ? '✅ set' : '❌ missing',
      NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || '❌ missing',
      VERCEL_URL: process.env.VERCEL_URL || '❌ missing',
      NODE_ENV: process.env.NODE_ENV,
    },
  }

  // Test database connection
  try {
    const { getPayload } = await import('payload')
    const config = await import('@/payload.config')
    const payload = await getPayload({ config: config.default })
    diagnostics.payload = '✅ initialized'

    // Quick query to verify DB
    const users = await payload.find({ collection: 'users', limit: 0 })
    diagnostics.database = `✅ connected (${users.totalDocs} users)`
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err))
    diagnostics.payload = '❌ failed'
    diagnostics.error = {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'),
    }
  }

  return NextResponse.json(diagnostics, { status: 200 })
}
