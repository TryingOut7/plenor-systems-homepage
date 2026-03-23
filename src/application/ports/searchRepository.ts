import type { SearchableCollection } from '@/domain/search/searchQuery';

export interface SearchDocument {
  id: string | number;
  title?: string;
  personName?: string;
  slug?: string;
  excerpt?: string;
  summary?: string;
  quote?: string;
  tags?: Array<{ tag?: string }>;
  isFeatured?: boolean;
  company?: string;
}

export interface SearchRepository {
  findPublishedDocuments(params: {
    collection: SearchableCollection;
    query: string;
    featuredFilter: string | null;
    limit: number;
  }): Promise<SearchDocument[]>;
}
