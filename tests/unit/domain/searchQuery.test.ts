import { describe, expect, it } from 'vitest';
import {
  hasAnySearchFilter,
  isSearchableCollection,
  parseSearchParams,
} from '@/domain/search/searchQuery';

describe('domain/searchQuery', () => {
  it('parses search query parameters with defaults', () => {
    const params = parseSearchParams(
      'http://localhost:3000/api/search?q=qa&page=2&limit=20&collection=blog-posts&featured=true',
    );

    expect(params.query).toBe('qa');
    expect(params.page).toBe(2);
    expect(params.limit).toBe(20);
    expect(params.collectionFilter).toBe('blog-posts');
    expect(params.featuredFilter).toBe('true');
  });

  it('returns false when no filters are present', () => {
    const params = parseSearchParams('http://localhost:3000/api/search');
    expect(hasAnySearchFilter(params)).toBe(false);
  });

  it('recognizes searchable collection values', () => {
    expect(isSearchableCollection('service-items')).toBe(true);
    expect(isSearchableCollection('unknown')).toBe(false);
  });
});
