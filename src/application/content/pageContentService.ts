import type { RequestContext } from '@/application/shared/requestContext';
import { fail, ok, type ServiceResult } from '@/application/shared/serviceResult';
import { getPublicPageBySlug } from '@/infrastructure/cms/contentGateway';
import { checkRateLimit } from '@/infrastructure/security/rateLimiter';
import type {
  ContentPageResponse,
  ContentNavigationResponse,
} from '@plenor/contracts/content';
import { getPublicNavigation } from '@/infrastructure/cms/contentGateway';

type ContentPageServiceResponse = ContentPageResponse | { message: string };
type ContentNavigationServiceResponse =
  | ContentNavigationResponse
  | { message: string };

function normalizeSlug(raw: string): string {
  return raw.replace(/^\/+|\/+$/g, '');
}

export async function getContentPageBySlug(
  context: RequestContext,
  slug: string,
): Promise<ServiceResult<ContentPageServiceResponse>> {
  const rateLimitError = checkRateLimit(context);
  if (rateLimitError) {
    return rateLimitError;
  }

  const normalized = normalizeSlug(slug);
  if (!normalized) {
    return fail(400, { message: 'Slug is required.' });
  }

  const page = await getPublicPageBySlug(normalized);
  if (!page) {
    return fail(404, { message: 'Page not found.' });
  }

  return ok({
    page: {
      id: page.id,
      title: page.title,
      slug: page.slug,
      pageMode: page.pageMode,
      templateKey: page.templateKey,
      presetKey: page.presetKey,
      hideNavbar: page.hideNavbar,
      hideFooter: page.hideFooter,
      pageBackgroundColor: page.pageBackgroundColor,
      sections: page.sections || [],
    },
  });
}

export async function getContentNavigation(
  context: RequestContext,
): Promise<ServiceResult<ContentNavigationServiceResponse>> {
  const rateLimitError = checkRateLimit(context);
  if (rateLimitError) {
    return rateLimitError;
  }

  const navigation = await getPublicNavigation();
  return ok({
    siteName: navigation.siteName,
    navigationLinks: navigation.navigationLinks,
    headerButtons: navigation.headerButtons,
  });
}
