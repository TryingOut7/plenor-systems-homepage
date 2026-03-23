import type {
  ContentNavigationResponse,
  ContentPageResponse,
} from '@plenor/contracts/content';

export type PublicContentPage = ContentPageResponse['page'];
export type PublicNavigation = ContentNavigationResponse;

export interface ContentRepository {
  getPublicPageBySlug(slug: string): Promise<PublicContentPage | null>;
  getPublicNavigation(): Promise<PublicNavigation>;
}
