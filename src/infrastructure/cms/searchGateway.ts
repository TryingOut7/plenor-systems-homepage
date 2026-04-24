import type { SearchRepository } from '@/application/ports/searchRepository';
import type { SearchableCollection } from '@/domain/search/searchQuery';
import type { Where } from 'payload';

const FEATURED_COLLECTIONS = new Set<SearchableCollection>([
  'service-items',
  'blog-posts',
  'testimonials',
]);

type PayloadSearchCollection =
  | 'insight-entries'
  | 'site-pages'
  | 'solution-entries'
  | 'testimonials';

function resolvePayloadCollection(
  collection: SearchableCollection,
): PayloadSearchCollection {
  switch (collection) {
    case 'service-items':
      return 'solution-entries';
    case 'blog-posts':
      return 'insight-entries';
    default:
      return collection;
  }
}

async function findPublishedDocuments(params: {
  collection: SearchableCollection;
  query: string;
  featuredFilter: string | null;
  limit: number;
}): Promise<Array<Record<string, unknown>>> {
  const payloadCollection = resolvePayloadCollection(params.collection);
  const { getPayload } = await import('../../payload/client');
  const where: Record<string, unknown> = {
    workflowStatus: { equals: 'published' },
  };

  if (params.query) {
    const likeQuery = { like: `%${params.query}%` };

    if (payloadCollection === 'testimonials') {
      where.or = [
        { name: likeQuery },
        { company: likeQuery },
        { quote: likeQuery },
      ];
    } else {
      where.or = [
        { title: likeQuery },
        ...(payloadCollection === 'insight-entries' ? [{ excerpt: likeQuery }] : []),
        ...(payloadCollection === 'solution-entries' ? [{ summary: likeQuery }] : []),
      ];
    }
  }

  if (params.featuredFilter !== null && FEATURED_COLLECTIONS.has(params.collection)) {
    where.isFeatured = { equals: params.featuredFilter === 'true' };
  }

  const payload = await getPayload();
  const found = await payload.find({
    collection: payloadCollection,
    where: where as Where,
    limit: params.limit,
    page: 1,
  });

  return found.docs as unknown as Array<Record<string, unknown>>;
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
      name:
        typeof doc.name === 'string'
          ? doc.name
          : typeof doc.personName === 'string'
            ? doc.personName
            : undefined,
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
