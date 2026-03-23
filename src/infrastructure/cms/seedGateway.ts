import { seedSitePages } from '@/payload/seed/seedSitePages';

export async function runSitePageSeed(): Promise<unknown> {
  return seedSitePages();
}
