/**
 * Custom redirect-rules endpoint — bypasses Payload's REST handler.
 *
 * Payload's catch-all REST route runs two DB queries per request (countDistinct + find).
 * On Vercel Hobby with max:1 pooler connections, both queries fight for the same
 * PgBouncer slot on cold starts, causing connection timeouts → 500 responses.
 *
 * This route runs a single raw query and sets CDN cache headers so Vercel Edge
 * serves the vast majority of requests without touching the database at all.
 *
 * Response shape mirrors Payload REST so proxy.ts needs no changes.
 */
import { Pool } from 'pg';
import { NextResponse } from 'next/server';
import { resolveDbConnectionString } from '@/lib/env-validation';

interface RedirectRuleRow {
  from_path: string;
  to_path: string;
  is_permanent: boolean;
}

// Strips sslmode from the connection string so the pool-level ssl config takes
// precedence (same approach as payload.config.ts normalizeDatabaseConnectionString).
function cleanConnectionString(uri: string): string {
  return uri
    .replace(/[?&]sslmode=[^&]*/gi, (m) => (m.startsWith('?') ? '?' : ''))
    .replace(/\?&/, '?')
    .replace(/\?$/, '');
}

declare global {
  // eslint-disable-next-line no-var
  var _redirectPool: Pool | undefined;
}

function getRedirectPool(): Pool {
  if (!globalThis._redirectPool) {
    const raw = resolveDbConnectionString();
    if (!raw) throw new Error('No database connection string configured');
    const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false';
    globalThis._redirectPool = new Pool({
      connectionString: cleanConnectionString(raw),
      ssl: { rejectUnauthorized },
      max: 1,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 30_000,
    });
  }
  return globalThis._redirectPool;
}

export async function GET() {
  try {
    const result = await getRedirectPool().query<RedirectRuleRow>(
      `SELECT from_path, to_path, is_permanent
       FROM redirect_rules
       WHERE enabled = true AND deleted_at IS NULL
       ORDER BY id
       LIMIT 500`,
    );

    const docs = result.rows.map((row) => ({
      fromPath: row.from_path,
      toPath: row.to_path,
      isPermanent: row.is_permanent,
    }));

    return NextResponse.json(
      { docs, totalDocs: docs.length },
      {
        headers: {
          // Vercel Edge CDN caches for 60 s; stale responses served for up to 5 min
          // while a fresh fetch happens in the background. Almost all requests hit CDN.
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      },
    );
  } catch {
    // On DB error return an empty list — proxy.ts falls back to its in-memory cache
    // anyway, so a short CDN TTL avoids hammering a degraded DB.
    return NextResponse.json(
      { docs: [], totalDocs: 0 },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        },
      },
    );
  }
}
