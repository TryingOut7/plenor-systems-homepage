const LOCAL_DATABASE_POOL_MAX = 10;
const VERCEL_DATABASE_POOL_MAX = 1;

export function resolveDatabasePoolMax(isVercel: boolean): number {
  return isVercel ? VERCEL_DATABASE_POOL_MAX : LOCAL_DATABASE_POOL_MAX;
}
