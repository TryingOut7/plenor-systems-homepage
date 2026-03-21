import { NextRequest, NextResponse } from 'next/server';
import type { Where } from 'payload';
import { getPayload } from '@/payload/client';
import { rateLimit } from '@/lib/rate-limit';

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

const SEARCHABLE_COLLECTIONS = ['service-items', 'blog-posts', 'testimonials', 'site-pages'] as const;
type SearchableCollection = (typeof SEARCHABLE_COLLECTIONS)[number];

function isSearchableCollection(value: string): value is SearchableCollection {
  return (SEARCHABLE_COLLECTIONS as readonly string[]).includes(value);
}

export async function GET(req: NextRequest) {
  const rlError = rateLimit(req);
  if (rlError) return rlError;

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.trim() || '';
  const collectionFilter = searchParams.get('collection');
  const tagFilter = searchParams.get('tag')?.trim();
  const featuredFilter = searchParams.get('featured');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10));

  if (!query && !collectionFilter && !tagFilter && featuredFilter === null) {
    return NextResponse.json({ error: 'At least one search parameter is required (q, collection, tag, or featured).' }, { status: 400 });
  }

  const payload = await getPayload();
  const collections = collectionFilter && isSearchableCollection(collectionFilter)
    ? [collectionFilter]
    : [...SEARCHABLE_COLLECTIONS];

  type ResultItem = {
    id: string | number;
    collection: string;
    title: string;
    slug?: string;
    excerpt?: string;
    tags?: string[];
    isFeatured?: boolean;
  };

  const results: ResultItem[] = [];
  const facets: Record<string, Record<string, number>> = {
    collection: {},
    tag: {},
  };

  for (const collSlug of collections) {
    try {
      // Build where clause
      const where: Where = {};

      if (query) {
        const likeQuery = { like: `%${query}%` };
        if (collSlug === 'testimonials') {
          where.or = [
            { personName: likeQuery },
            { company: likeQuery },
            { quote: likeQuery },
          ];
        } else {
          where.or = [
            { title: likeQuery },
            ...(collSlug === 'blog-posts' ? [{ excerpt: likeQuery }] : []),
            ...(collSlug === 'service-items' ? [{ summary: likeQuery }] : []),
          ];
        }
      }

      if (featuredFilter !== null && featuredFilter !== undefined && ['service-items', 'blog-posts', 'testimonials'].includes(collSlug)) {
        where.isFeatured = { equals: featuredFilter === 'true' };
      }

      const found = await payload.find({
        collection: collSlug,
        where,
        limit: limit * 2, // Fetch extra for cross-collection pagination
        page: 1,
      });

      for (const doc of found.docs) {
        const record = doc as Record<string, unknown>;
        const docTags = (record.tags as Array<{ tag?: string }> | undefined)
          ?.map((t) => t.tag)
          .filter(Boolean) as string[] || [];

        // Tag filter
        if (tagFilter && !docTags.some((t) => t.toLowerCase() === tagFilter.toLowerCase())) {
          continue;
        }

        // Update facets
        facets.collection[collSlug] = (facets.collection[collSlug] || 0) + 1;
        for (const t of docTags) {
          facets.tag[t] = (facets.tag[t] || 0) + 1;
        }

        results.push({
          id: record.id as string | number,
          collection: collSlug,
          title: (record.title || record.personName || '') as string,
          slug: record.slug as string | undefined,
          excerpt: (record.excerpt || record.summary || record.quote || '') as string,
          tags: docTags,
          isFeatured: record.isFeatured as boolean | undefined,
        });
      }
    } catch (err) {
      console.error(`Search error for ${collSlug}:`, err);
    }
  }

  // Paginate aggregated results
  const total = results.length;
  const startIndex = (page - 1) * limit;
  const paginatedResults = results.slice(startIndex, startIndex + limit);

  return NextResponse.json({
    results: paginatedResults,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    facets,
  });
}
