import type { SeedRepository } from '@/application/ports/seedRepository';

async function runSitePageSeed(): Promise<unknown> {
  const { seedSitePages } = await import('../../payload/seed/seedSitePages');
  return seedSitePages();
}

export const payloadSeedRepository: SeedRepository = {
  runSitePageSeed,
};
