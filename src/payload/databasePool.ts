const LOCAL_DATABASE_POOL_MAX = 10;
// Default to 1 on Vercel with Supabase's transaction pooler (port 6543).
// Switch to Supabase's session pooler (port 5432) and set POSTGRES_POOL_MAX=5
// (or higher) to eliminate connection-queue timeouts permanently.
const VERCEL_DATABASE_POOL_MAX = 1;

export function resolveDatabasePoolMax(isVercel: boolean): number {
  const envMax = process.env.POSTGRES_POOL_MAX ? parseInt(process.env.POSTGRES_POOL_MAX, 10) : NaN;
  if (!isNaN(envMax) && envMax > 0) return envMax;
  return isVercel ? VERCEL_DATABASE_POOL_MAX : LOCAL_DATABASE_POOL_MAX;
}
