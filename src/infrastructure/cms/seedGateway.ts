import type { SeedRepository } from '@/application/ports/seedRepository';

async function runSitePageSeed(): Promise<unknown> {
  const { seedSitePages } = await import('../../payload/seed/seedSitePages');
  return seedSitePages();
}

async function runPagePresetSeed(): Promise<unknown> {
  const { seedPagePresets } = await import('../../payload/seed/seedPagePresets');
  return seedPagePresets();
}

async function runFormSeed(): Promise<unknown> {
  const { seedForms } = await import('../../payload/seed/seedForms');
  return seedForms();
}

export const payloadSeedRepository: SeedRepository = {
  runSitePageSeed,
  runFormSeed,
};

export { runPagePresetSeed };
