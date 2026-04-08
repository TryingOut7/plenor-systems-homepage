// Re-export org-site CMS query functions so components can import from @/lib without
// violating the architecture boundary (src/components/** cannot import @/infrastructure/**).
export {
  getOrgEventsByStatus,
  getOrgHomeFeatures,
  getOrgLearningByCategory,
  getOrgSpotlightByCategory,
} from '@/infrastructure/cms/orgSiteQueries';
