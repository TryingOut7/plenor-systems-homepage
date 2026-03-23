export async function runSitePageSeed(): Promise<unknown> {
  const { seedSitePages } = await import('../../payload/seed/seedSitePages');
  return seedSitePages();
}
