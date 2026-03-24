import type { SiteSettings } from '@/payload/cms';
import { asTrimmedString } from '@/lib/page-content/helpers';

export interface NotFoundPageData {
  metaTitle?: string;
  metaDescription?: string;
  heading?: string;
  body?: string;
  buttonLabel?: string;
  buttonHref?: string;
}

export const NOT_FOUND_PAGE_DEFAULTS: Required<NotFoundPageData> = {
  metaTitle: 'Page Not Found',
  metaDescription: 'The page you requested could not be found.',
  heading: 'Page not found',
  body: 'The page you’re looking for doesn’t exist or has moved. Head back to the homepage to find what you need.',
  buttonLabel: 'Back to Home',
  buttonHref: '/',
};

export function resolveNotFoundPageData(
  settings: SiteSettings | null | undefined,
): Required<NotFoundPageData> {
  const notFoundPage = settings?.notFoundPage;

  return {
    ...NOT_FOUND_PAGE_DEFAULTS,
    metaTitle: asTrimmedString(notFoundPage?.metaTitle) || NOT_FOUND_PAGE_DEFAULTS.metaTitle,
    metaDescription:
      asTrimmedString(notFoundPage?.metaDescription) ||
      NOT_FOUND_PAGE_DEFAULTS.metaDescription,
    heading: asTrimmedString(notFoundPage?.heading) || NOT_FOUND_PAGE_DEFAULTS.heading,
    body: asTrimmedString(notFoundPage?.body) || NOT_FOUND_PAGE_DEFAULTS.body,
    buttonLabel:
      asTrimmedString(notFoundPage?.buttonLabel) || NOT_FOUND_PAGE_DEFAULTS.buttonLabel,
    buttonHref: asTrimmedString(notFoundPage?.buttonHref) || NOT_FOUND_PAGE_DEFAULTS.buttonHref,
  };
}
