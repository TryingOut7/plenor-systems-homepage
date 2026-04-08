const RESERVED_PREFIXES = [
  '/admin',
  '/api',
  '/_next',
  '/favicon',
  '/sitemap',
  '/robots',
] as const;

/**
 * Resolves the public base path for community/org-site routes.
 * Returns `null` when the feature is disabled (env unset/empty) or
 * the configured value collides with a reserved prefix.
 */
export function resolveCommunityBasePath(): string | null {
  const raw = process.env.NEXT_PUBLIC_COMMUNITY_SITE_BASE_PATH;
  if (!raw || raw.trim().length === 0) return null;

  let normalized = raw.trim().toLowerCase();
  if (!normalized.startsWith('/')) normalized = `/${normalized}`;
  normalized = normalized.replace(/\/+$/, '');

  if (normalized.length === 0) return null;

  for (const prefix of RESERVED_PREFIXES) {
    if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
      return null;
    }
  }

  return normalized;
}
