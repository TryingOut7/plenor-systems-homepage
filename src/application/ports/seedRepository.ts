export interface SeedRepository {
  runSitePageSeed(): Promise<unknown>;
  runFormSeed(): Promise<unknown>;
}
