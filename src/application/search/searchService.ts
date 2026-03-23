import type { SearchRepository } from '@/application/ports/searchRepository';
import type { RequestContext } from '@/application/shared/requestContext';
import { fail, ok, type ServiceResult } from '@/application/shared/serviceResult';
import {
  SEARCHABLE_COLLECTIONS,
  hasAnySearchFilter,
  isSearchableCollection,
  parseSearchParams,
} from '@/domain/search/searchQuery';
import { checkRateLimit } from '@/infrastructure/security/rateLimiter';
import type {
  SearchErrorResponse,
  SearchResponse,
  SearchResultItem,
} from '@plenor/contracts/search';

type SearchServiceResponse =
  | SearchResponse
  | SearchErrorResponse
  | { message: string };

function normalizeTags(rawTags: unknown): string[] {
  if (!Array.isArray(rawTags)) {
    return [];
  }

  return rawTags
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return '';
      }

      const tag = (entry as { tag?: unknown }).tag;
      return typeof tag === 'string' ? tag : '';
    })
    .filter(Boolean);
}

export async function searchSiteContent(
  context: RequestContext,
  repository: SearchRepository,
): Promise<ServiceResult<SearchServiceResponse>> {
  const rateLimitError = checkRateLimit(context);
  if (rateLimitError) {
    return rateLimitError;
  }

  const params = parseSearchParams(context.url);
  if (!hasAnySearchFilter(params)) {
    return fail(400, {
      error:
        'At least one search parameter is required (q, collection, tag, or featured).',
    });
  }

  const collections =
    params.collectionFilter && isSearchableCollection(params.collectionFilter)
      ? [params.collectionFilter]
      : [...SEARCHABLE_COLLECTIONS];

  const results: SearchResultItem[] = [];
  const facets: SearchResponse['facets'] = {
    collection: {},
    tag: {},
  };

  for (const collection of collections) {
    try {
      const docs = await repository.findPublishedDocuments({
        collection,
        query: params.query,
        featuredFilter: params.featuredFilter,
        limit: params.limit * 2,
      });

      for (const doc of docs) {
        const tags = normalizeTags(doc.tags);

        if (
          params.tagFilter &&
          !tags.some((tag) => tag.toLowerCase() === params.tagFilter?.toLowerCase())
        ) {
          continue;
        }

        facets.collection[collection] = (facets.collection[collection] || 0) + 1;
        for (const tag of tags) {
          facets.tag[tag] = (facets.tag[tag] || 0) + 1;
        }

        results.push({
          id: doc.id as string | number,
          collection,
          title:
            (typeof doc.title === 'string'
              ? doc.title
              : typeof doc.personName === 'string'
                ? doc.personName
                : '') || '',
          slug: typeof doc.slug === 'string' ? doc.slug : undefined,
          excerpt:
            (typeof doc.excerpt === 'string'
              ? doc.excerpt
              : typeof doc.summary === 'string'
                ? doc.summary
                : typeof doc.quote === 'string'
                  ? doc.quote
                  : '') || undefined,
          tags,
          isFeatured:
            typeof doc.isFeatured === 'boolean' ? doc.isFeatured : undefined,
        });
      }
    } catch (error) {
      console.error(`Search error for ${collection}:`, error);
    }
  }

  const total = results.length;
  const startIndex = (params.page - 1) * params.limit;
  const paginatedResults = results.slice(startIndex, startIndex + params.limit);

  return ok({
    results: paginatedResults,
    meta: {
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
      requestId: context.requestId,
    },
    facets,
  });
}
