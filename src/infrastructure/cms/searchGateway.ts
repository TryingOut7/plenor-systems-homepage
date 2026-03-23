import type { SearchRepository } from '@/application/ports/searchRepository';
import type { SearchableCollection } from '@/domain/search/searchQuery';
import type { Where } from 'payload';

const FEATURED_COLLECTIONS = new Set<SearchableCollection>([
  'service-items',
  'blog-posts',
  'testimonials',
]);

async function findPublishedDocuments(params: {
  collection: SearchableCollection;
  query: string;
  featuredFilter: string | null;
  limit: number;
}): Promise<Array<Record<string, unknown>>> {
  const { getPayload } = await import('../../payload/client');
  const where: Record<string, unknown> = {
    workflowStatus: { equals: 'published' },
  };

  if (params.query) {
    const likeQuery = { like: `%${params.query}%` };

    if (params.collection === 'testimonials') {
      where.or = [
        { personName: likeQuery },
        { company: likeQuery },
        { quote: likeQuery },
      ];
    } else {
      where.or = [
        { title: likeQuery },
        ...(params.collection === 'blog-posts' ? [{ excerpt: likeQuery }] : []),
        ...(params.collection === 'service-items' ? [{ summary: likeQuery }] : []),
      ];
    }
  }

  if (params.featuredFilter !== null && FEATURED_COLLECTIONS.has(params.collection)) {
    where.isFeatured = { equals: params.featuredFilter === 'true' };
  }

  const payload = await getPayload();
  const found = await payload.find({
    collection: params.collection,
    where: where as Where,
    limit: params.limit,
    page: 1,
  });

  return found.docs as Array<Record<string, unknown>>;
}

export const payloadSearchRepository: SearchRepository = {
  async findPublishedDocuments(params) {
    const docs = await findPublishedDocuments(params);
    return docs.map((doc) => ({
      id:
        typeof doc.id === 'string' || typeof doc.id === 'number'
          ? doc.id
          : '',
      title: typeof doc.title === 'string' ? doc.title : undefined,
      personName:
        typeof doc.personName === 'string' ? doc.personName : undefined,
      slug: typeof doc.slug === 'string' ? doc.slug : undefined,
      excerpt: typeof doc.excerpt === 'string' ? doc.excerpt : undefined,
      summary: typeof doc.summary === 'string' ? doc.summary : undefined,
      quote: typeof doc.quote === 'string' ? doc.quote : undefined,
      tags: Array.isArray(doc.tags)
        ? (doc.tags as Array<{ tag?: string }>)
        : undefined,
      isFeatured:
        typeof doc.isFeatured === 'boolean' ? doc.isFeatured : undefined,
      company: typeof doc.company === 'string' ? doc.company : undefined,
    }));
  },
};
