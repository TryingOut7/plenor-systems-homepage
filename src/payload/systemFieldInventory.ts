export const SYSTEM_FIELD_PATHS = [
  'site-pages.customHeadScripts',
  'site-pages.seo.canonicalUrl',
  'site-pages.seo.noindex',
  'site-pages.seo.nofollow',
  'site-pages.seo.includeInSitemap',
  'site-settings.defaultSeo.canonicalUrl',
  'site-settings.defaultSeo.noindex',
  'site-settings.defaultSeo.nofollow',
  'site-settings.defaultSeo.includeInSitemap',
  'site-settings.contentRouting.workflowNotifyEmail',
  'ui-settings.typography.headingFontUrl',
  'ui-settings.typography.bodyFontUrl',
  'redirect-rules.fromPath',
  'redirect-rules.toPath',
  'redirect-rules.isPermanent',
  'redirect-rules.enabled',
  'media.usageScope',
  'media.mediaQaStatus',
  'media.licenseSource',
  'media.licenseExpiresAt',
  'site-settings.analyticsId',
] as const;

export type SystemFieldPath = (typeof SYSTEM_FIELD_PATHS)[number];

export function listSystemFieldPathsForCollection(collectionSlug: string): string[] {
  const prefix = `${collectionSlug}.`;
  return SYSTEM_FIELD_PATHS
    .filter((path) => path.startsWith(prefix))
    .map((path) => path.slice(prefix.length));
}
