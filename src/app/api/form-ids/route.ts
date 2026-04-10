/**
 * GET /api/form-ids
 *
 * Returns the numeric IDs of the well-known form template aliases (guide, inquiry)
 * in a single raw pg query — bypasses Payload's REST handler entirely.
 *
 * Payload's catch-all REST route runs two DB queries per request (countDistinct + find).
 * On Vercel Hobby with max:1 pooler connections, both queries fight for the same
 * PgBouncer slot on cold starts, causing connection timeouts.
 *
 * This route runs one query and sets CDN cache headers so Vercel Edge serves
 * virtually every request without touching the database at all.
 *
 * ── KEY SET ──────────────────────────────────────────────────────────────────
 * The alias keys queried here are derived from `FORM_ALIAS_KEYS` in
 * `src/domain/forms/formTemplates.ts` — the single authoritative list.
 * To add a new alias, update that constant; this route picks it up automatically.
 * The server-render resolver in `resolveFormAliases.ts` must also be updated
 * (see the SYNC POINT comment in formTemplates.ts for the full checklist).
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Response: Record<FormAliasKey, number | null>
 *   e.g. { guide: 3, inquiry: 7 }
 */
import { Pool } from 'pg';
import { NextResponse } from 'next/server';
import { resolveDbConnectionString } from '@/infrastructure/db/connectionConfig';
import {
  FORM_ALIAS_KEYS,
  buildFormAliasKeysQueryParam,
  type FormAliasKey,
} from '@/application/forms/formAliasService';

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

declare global {
  var _formIdsPool: Pool | undefined;
}

function getFormIdsPool(): Pool {
  if (!globalThis._formIdsPool) {
    const raw = resolveDbConnectionString();
    if (!raw) throw new Error('No database connection string configured');
    const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false';
    globalThis._formIdsPool = new Pool({
      connectionString: cleanConnectionString(raw),
      ssl: { rejectUnauthorized },
      max: 1,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 30_000,
    });
  }
  return globalThis._formIdsPool;
}

export const dynamic = 'force-dynamic';

export async function GET() {
  const aliasKeys = buildFormAliasKeysQueryParam();

  try {
    // Use ANY($1::text[]) so the key set is parameterised, not interpolated.
    // The query automatically covers however many aliases FORM_ALIAS_KEYS defines.
    const result = await getFormIdsPool().query<FormIdRow>(
      `SELECT DISTINCT ON (template_key) id, template_key
       FROM forms
       WHERE template_key::text = ANY($1::text[])
       ORDER BY template_key, id ASC`,
      [aliasKeys],
    );

    // Build the result shape from FORM_ALIAS_KEYS so the response always
    // contains exactly the keys callers expect — including future additions.
    const ids = Object.fromEntries(
      FORM_ALIAS_KEYS.map((key) => [key, null as number | null]),
    ) as Record<FormAliasKey, number | null>;

    for (const row of result.rows) {
      const key = row.template_key as FormAliasKey;
      if (key in ids) ids[key] = row.id;
    }

    return NextResponse.json(ids, {
      headers: {
        // Vercel Edge CDN caches for 60 s; stale responses served for up to 5 min
        // while a fresh fetch happens in the background. Almost all requests hit CDN.
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('[GET /api/form-ids] Database error:', error);
    // On DB error return nulls — FormRenderer will show "form not found" rather
    // than crashing. Short CDN TTL avoids hammering a degraded DB.
    const errorIds = Object.fromEntries(
      FORM_ALIAS_KEYS.map((key) => [key, null as number | null]),
    ) as Record<FormAliasKey, number | null>;

    return NextResponse.json(errorIds, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
  }
}
