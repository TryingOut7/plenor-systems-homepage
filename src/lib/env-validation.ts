import { isNonLocalRuntime } from './runtime.ts';

const REQUIRED_VARS = [
  'PAYLOAD_SECRET',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
] as const;

const REQUIRED_SUPABASE_VARS = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] as const;

/**
 * Resolves the database connection string in priority order:
 *   1. POSTGRES_URL       — auto-provisioned by Supabase's Vercel integration (preferred)
 *   2. DATABASE_URI       — legacy manual override
 *   3. DATABASE_URL       — legacy fallback
 */
export function resolveDbConnectionString(): string | undefined {
  return (
    process.env.POSTGRES_URL?.trim() ||
    process.env.DATABASE_URI?.trim() ||
    process.env.DATABASE_URL?.trim()
  );
}

export function validateEnv(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const missingDatabase = !resolveDbConnectionString();
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  // Supabase credentials are required in production: the persistent rate limiter
  // and outbox persistence both depend on them. Without these, form submissions
  // hit a 503 at the rate-limit check and the outbox never drains.
  const missingSupabase = REQUIRED_SUPABASE_VARS.filter((key) => !process.env[key]);

  // CRON_SECRET is required so Vercel cron jobs can authenticate. Without it,
  // every cron invocation returns 401 and the outbox is never processed.
  const missingCronSecret = !process.env.CRON_SECRET;

  const missingServerUrl = !process.env.NEXT_PUBLIC_SERVER_URL && !process.env.VERCEL_URL;
  const requiresPersistentUploadStorage =
    isNonLocalRuntime() && process.env.ALLOW_NON_PERSISTENT_UPLOADS !== 'true';
  const missingBlobToken = !process.env.BLOB_READ_WRITE_TOKEN;

  const allMissing: string[] = [];
  if (missingDatabase) allMissing.push('POSTGRES_URL');
  if (missingServerUrl) allMissing.push('NEXT_PUBLIC_SERVER_URL (or VERCEL_URL)');
  allMissing.push(...missing);
  allMissing.push(...missingSupabase);
  if (missingCronSecret) allMissing.push('CRON_SECRET');
  if (requiresPersistentUploadStorage && missingBlobToken) {
    allMissing.push('BLOB_READ_WRITE_TOKEN');
  }


  if (allMissing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${allMissing.join(', ')}. ` +
        'Check your deployment configuration.',
    );
  }

  // Non-fatal warning only for explicitly opted-out environments.
  if (isNonLocalRuntime() && !process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn(
      '[env] BLOB_READ_WRITE_TOKEN is not set. Non-local uploads are not configured for persistent storage. ' +
        'Set BLOB_READ_WRITE_TOKEN (recommended) or set ALLOW_NON_PERSISTENT_UPLOADS=true to bypass.',
    );
  }

  // Non-fatal warning: POSTGRES_URL using a direct Postgres connection (port 5432)
  // will exhaust the pool under concurrent Vercel serverless invocations.
  // Use the Supabase Transaction Pooler connection string (port 6543) in production.
  if (process.env.VERCEL) {
    const dbUri = resolveDbConnectionString();
    if (dbUri) {
      try {
        const parsed = new URL(dbUri);
        if (parsed.port === '5432') {
          console.warn(
            '[db] POSTGRES_URL is using a direct Postgres connection (port 5432) on Vercel. ' +
              'Serverless functions share a single connection slot, causing timeouts under load. ' +
              'Use the Supabase Transaction Pooler URL (port 6543): ' +
              'Supabase Dashboard → Project Settings → Database → Connection string (URI) → Transaction pooler.',
          );
        }
      } catch {
        // ignore parse errors on malformed URIs
      }
    }
  }

  // Non-fatal warning: without Sentry DSN, error tracking is disabled in production.
  if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn(
      '[env] SENTRY_DSN and NEXT_PUBLIC_SENTRY_DSN are not set. ' +
        'Error tracking is disabled. Set these in Vercel to enable Sentry error reporting.',
    );
  }
}
