import {
  getSitePageBySlug,
  getSiteSettings,
  type SitePage,
  type SiteSettings,
} from '@/payload/cms';

export async function getPublicPageBySlug(
  slug: string,
): Promise<SitePage | null> {
  return getSitePageBySlug(slug);
}

export async function getPublicNavigation(): Promise<{
  siteName?: string;
  navigationLinks: NonNullable<SiteSettings['navigationLinks']>;
  headerButtons: NonNullable<SiteSettings['headerButtons']>;
}> {
  const settings = await getSiteSettings();
  return {
    siteName: settings?.siteName,
    navigationLinks: settings?.navigationLinks || [],
    headerButtons: settings?.headerButtons || [],
  };
}
