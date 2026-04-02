import type { ContentRepository } from '@/application/ports/contentRepository';
import type { RequestContext } from '@/application/shared/requestContext';
import { fail, ok, type ServiceResult } from '@/application/shared/serviceResult';
import { checkRateLimit } from '@/infrastructure/security/rateLimiter';
import type {
  ContentPageResponse,
  ContentNavigationResponse,
} from '@plenor/contracts/content';

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
  repository: ContentRepository,
): Promise<ServiceResult<ContentPageServiceResponse>> {
  const rateLimitError = await checkRateLimit(context);
  if (rateLimitError) {
    return rateLimitError;
  }

  const normalized = normalizeSlug(slug);
  if (!normalized) {
    return fail(400, { message: 'Slug is required.' });
  }

  const page = await repository.getPublicPageBySlug(normalized);
  if (!page) {
    return fail(404, { message: 'Page not found.' });
  }

  return ok({
    page,
  });
}

export async function getContentNavigation(
  context: RequestContext,
  repository: ContentRepository,
): Promise<ServiceResult<ContentNavigationServiceResponse>> {
  const rateLimitError = await checkRateLimit(context);
  if (rateLimitError) {
    return rateLimitError;
  }

  const navigation = await repository.getPublicNavigation();
  return ok(navigation);
}
