import type { ContentRepository } from '@/application/ports/contentRepository';
import {
  getSitePageBySlug,
  getSiteSettings,
} from '@/payload/cms';

export const payloadContentRepository: ContentRepository = {
  async getPublicPageBySlug(slug) {
    const page = await getSitePageBySlug(slug);
    if (!page) {
      return null;
    }

    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      presetKey: page.presetKey,
      hideNavbar: page.hideNavbar,
      hideFooter: page.hideFooter,
      pageBackgroundColor: page.pageBackgroundColor,
      seo: page.seo,
      sections: page.sections || [],
    };
  },

  async getPublicNavigation() {
    const settings = await getSiteSettings();
    return {
      siteName: settings?.siteName,
      navigationLinks: settings?.navigationLinks || [],
      headerButtons: settings?.headerButtons || [],
    };
  },
};
