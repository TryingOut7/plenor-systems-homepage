export type CmsLanePreference = 'simple' | 'advanced';

type UserRecord = Record<string, unknown>;

export function resolveUserRole(user: unknown): string | null {
  if (!user || typeof user !== 'object') return null;
  const role = (user as UserRecord).role;
  return typeof role === 'string' ? role : null;
}

export function isAdvancedLane(user: unknown): boolean {
  if (!user || typeof user !== 'object') return false;
  const lane = (user as UserRecord).cmsLanePreference;
  return lane === 'advanced';
}

export function canManageSystemFields(user: unknown): boolean {
  const role = resolveUserRole(user);
  if (role === 'admin') return true;
  if (role !== 'editor') return false;

  if (!user || typeof user !== 'object') return false;
  return (user as UserRecord).canManageSystemFields === true;
}

export function canEditAdvancedTier(user: unknown): boolean {
  const role = resolveUserRole(user);
  if (!role) return false;
  if (role === 'admin' || role === 'editor') return true;
  if (role !== 'author') return false;
  return isAdvancedLane(user);
}

export function canManageRedirectRules(user: unknown): boolean {
  const role = resolveUserRole(user);
  if (role === 'admin') return true;
  if (role !== 'editor') return false;
  return canManageSystemFields(user);
}
