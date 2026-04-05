// Thin barrel — all implementation lives in ./cms/*
export type {
  BlogCategory,
  BlogPost,
  CmsReadOptions,
  CollectionData,
  Logo,
  PageSection,
  RedirectRule,
  SeoFields,
  ServiceItem,
  SitemapQueryResult,
  SitePage,
  SiteSettings,
  TeamMember,
  Testimonial,
  UISettings,
} from './cms/types.ts';

export {
  getBlogPostBySlug,
  getCollectionData,
  getRedirectRules,
  getServiceItemBySlug,
  getSitemapSlugs,
  getSitePageBySlug,
  getSiteSettings,
  getUISettings,
} from './cms/queries.ts';
