export const SEARCHABLE_COLLECTIONS = [
  'service-items',
  'blog-posts',
  'testimonials',
  'site-pages',
] as const;

export type SearchableCollection = (typeof SEARCHABLE_COLLECTIONS)[number];

export interface SearchParams {
  query: string;
  collectionFilter: string | null;
  tagFilter: string | null;
  featuredFilter: string | null;
  page: number;
  limit: number;
}

export function isSearchableCollection(
  value: string,
): value is SearchableCollection {
  return (SEARCHABLE_COLLECTIONS as readonly string[]).includes(value);
}

export function parseSearchParams(url: string): SearchParams {
  const { searchParams } = new URL(url);

  return {
    query: searchParams.get('q')?.trim() || '',
    collectionFilter: searchParams.get('collection'),
    tagFilter: searchParams.get('tag')?.trim() || null,
    featuredFilter: searchParams.get('featured'),
    page: Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1),
    limit: Math.min(
      50,
      Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10),
    ),
  };
}

export function hasAnySearchFilter(params: SearchParams): boolean {
  return !!(
    params.query ||
    params.collectionFilter ||
    params.tagFilter ||
    params.featuredFilter !== null
  );
}
