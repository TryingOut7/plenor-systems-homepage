import { searchSiteContent } from '@/application/search/searchService';
import { payloadSearchRepository } from '@/infrastructure/cms/searchGateway';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';
import { toRequestContext } from '@/infrastructure/http/nextRequestAdapter';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import type { NextRequest } from 'next/server';

/**
 * GET /api/search?q=keyword&collection=blog-posts&tag=launch&page=1&limit=10
 *
 * Faceted search across indexed collections. Supports:
 * - q: Full-text search query (searches title and excerpt/summary)
 * - collection: Filter by collection slug (service-items, blog-posts, testimonials, site-pages)
 * - tag: Filter by tag value
 * - featured: Filter by isFeatured (true/false)
 * - page: Pagination (default: 1)
 * - limit: Results per page (default: 10, max: 50)
 *
 * Returns results with facet counts for available filters.
 */

export async function GET(req: NextRequest) {
  const proxied = await proxyRequestToBackend(req, '/v1/search');
  if (proxied) {
    return proxied;
  }

  const result = await searchSiteContent(
    toRequestContext(req),
    payloadSearchRepository,
  );
  return toJsonResponse(result);
}
