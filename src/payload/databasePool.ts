const LOCAL_DATABASE_POOL_MAX = 10;

// On Vercel serverless, Payload fires multiple parallel queries during page render
// (site-settings, redirect-rules, page content, etc.) and they all queue on a
// single connection slot. With max=1 the queue overflows the 10-second
// connectionTimeoutMillis on cold starts. 5 concurrent slots is safe against
// Supabase's Transaction Pooler (Supavisor) which can absorb unlimited app
// connections because it multiplexes them onto a smaller set of real PG connections.
const VERCEL_DATABASE_POOL_MAX = 5;

export function resolveDatabasePoolMax(isVercel: boolean): number {
  return isVercel ? VERCEL_DATABASE_POOL_MAX : LOCAL_DATABASE_POOL_MAX;
}
