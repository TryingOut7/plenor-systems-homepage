import type { SiteSettings } from '@/payload/cms';

const DEFAULT_SITE_NAME = 'Website';
const DEFAULT_SITE_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
);
const DEFAULT_CONTACT_EMAIL = 'contact@example.com';

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/$/, '');
}

export function resolveSiteName(settings?: Pick<SiteSettings, 'siteName'> | null): string {
  return asNonEmptyString(settings?.siteName) || DEFAULT_SITE_NAME;
}

export function resolveSiteUrl(settings?: Pick<SiteSettings, 'siteUrl'> | null): string {
  let url = stripTrailingSlash(asNonEmptyString(settings?.siteUrl) || DEFAULT_SITE_URL);
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = url.includes('localhost') ? `http://${url}` : `https://${url}`;
  }
  return url;
}

export function resolveContactEmail(
  settings?: Pick<SiteSettings, 'contactEmail'> | null,
): string {
  return asNonEmptyString(settings?.contactEmail) || DEFAULT_CONTACT_EMAIL;
}

export function resolveTwitterHandle(
  settings?: Pick<SiteSettings, 'twitterHandle'> | null,
): string | undefined {
  const fromSettings = asNonEmptyString(settings?.twitterHandle);
  return fromSettings || undefined;
}
