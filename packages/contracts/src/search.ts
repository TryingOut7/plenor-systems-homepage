import type { BackendErrorResponse } from './errors';

export interface SearchResultItem {
  id: string | number;
  collection: string;
  title: string;
  slug?: string;
  excerpt?: string;
  tags?: string[];
  isFeatured?: boolean;
}

export interface SearchResponse {
  results: SearchResultItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    requestId?: string;
  };
  facets: {
    collection: Record<string, number>;
    tag: Record<string, number>;
  };
}

export interface SearchErrorResponse {
  error: string;
  code?: BackendErrorResponse['code'];
  message?: string;
  status?: number;
  success?: false;
}
