/**
 * GET /api/form-ids
 *
 * Returns the numeric IDs of the two well-known form templates (guide, inquiry)
 * in a single raw pg query — bypasses Payload's REST handler entirely.
 *
 * Payload's catch-all REST route runs two DB queries per request (countDistinct + find).
 * On Vercel Hobby with max:1 pooler connections, both queries fight for the same
 * PgBouncer slot on cold starts, causing connection timeouts.
 *
 * This route runs one query and sets CDN cache headers so Vercel Edge serves
 * virtually every request without touching the database at all.
 *
 * Response: { guide: number | null, inquiry: number | null }
 */
import { Pool } from 'pg';
import { NextResponse } from 'next/server';
import { resolveDbConnectionString } from '@/lib/env-validation';

interface FormIdRow {
  id: number;
  template_key: string;
}

function cleanConnectionString(uri: string): string {
  return uri
    .replace(/[?&]sslmode=[^&]*/gi, (m) => (m.startsWith('?') ? '?' : ''))
    .replace(/\?&/, '?')
    .replace(/\?$/, '');
}

// Module-level pool — reused across warm Lambda invocations for this route.
// Isolated from Payload's own pool so the two don't compete for the same slot.
let formIdsPool: Pool | null = null;

function getFormIdsPool(): Pool {
  if (!formIdsPool) {
    const raw = resolveDbConnectionString();
    if (!raw) throw new Error('No database connection string configured');
    const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false';
    formIdsPool = new Pool({
      connectionString: cleanConnectionString(raw),
      ssl: { rejectUnauthorized },
      max: 1,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 30_000,
    });
  }
  return formIdsPool;
}

export async function GET() {
  try {
    const result = await getFormIdsPool().query<FormIdRow>(
      `SELECT id, template_key
       FROM forms
       WHERE template_key IN ('guide', 'inquiry')
       LIMIT 2`,
    );

    const ids: { guide: number | null; inquiry: number | null } = {
      guide: null,
      inquiry: null,
    };
    for (const row of result.rows) {
      if (row.template_key === 'guide') ids.guide = row.id;
      else if (row.template_key === 'inquiry') ids.inquiry = row.id;
    }

    return NextResponse.json(ids, {
      headers: {
        // Vercel Edge CDN caches for 60 s; stale responses served for up to 5 min
        // while a fresh fetch happens in the background. Almost all requests hit CDN.
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch {
    // On DB error return nulls — FormRenderer will show "form not found" rather
    // than crashing. Short CDN TTL avoids hammering a degraded DB.
    return NextResponse.json(
      { guide: null, inquiry: null },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        },
      },
    );
  }
}
