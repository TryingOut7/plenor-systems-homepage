export type SeedSummary = {
  created: string[];
  skipped: string[];
  errors: string[];
};

// The event / spotlight / learning verification content model was retired.
// Keep this seed entry point as a safe no-op so internal tooling does not fail.
export async function seedOrgVerificationPages(): Promise<SeedSummary> {
  return {
    created: [],
    skipped: [
      'org-verification-pages: retired legacy org event/spotlight/learning seed workflow',
    ],
    errors: [],
  };
}
