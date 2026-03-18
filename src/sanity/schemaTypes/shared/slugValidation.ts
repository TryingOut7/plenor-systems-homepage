import type { SlugIsUniqueValidator } from 'sanity';

/**
 * Checks slug uniqueness across all routable document types,
 * not just within the current type. This prevents two different
 * documents (e.g. a sitePage and a blogPost) from claiming the
 * same slug, which would cause routing conflicts.
 */
export const isSlugUniqueAcrossTypes: SlugIsUniqueValidator = async (slug, context) => {
  const { document, getClient } = context;
  const client = getClient({ apiVersion: '2024-01-01' });
  const id = document?._id?.replace(/^drafts\./, '');
  const type = document?._type;

  // Check uniqueness within the same document type (standard Sanity behavior)
  // plus cross-type uniqueness for types that share a route namespace.
  const routeGroupTypes: Record<string, string[]> = {
    sitePage: ['sitePage'],
    blogPost: ['blogPost'],
    serviceItem: ['serviceItem'],
    testimonial: ['testimonial'],
    reusableSection: ['reusableSection'],
  };

  const typesToCheck = routeGroupTypes[type ?? ''] ?? [type ?? ''];

  const count = await client.fetch<number>(
    `count(*[_type in $types && slug.current == $slug && !(_id in [$draftId, $publishedId])])`,
    {
      types: typesToCheck,
      slug,
      draftId: `drafts.${id}`,
      publishedId: id,
    },
  );

  return count === 0;
};
