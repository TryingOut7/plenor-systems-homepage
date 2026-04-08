// Re-export org-site CMS query functions so components can import from @/lib without
// violating the architecture boundary (src/components/** cannot import @/infrastructure/**).
export {
  getOrgAboutById,
  getOrgEventById,
  getOrgEventsByStatus,
  getOrgHomeFeatures,
  getOrgLearningById,
  getOrgLearningByCategory,
  getOrgSpotlightById,
  getOrgSpotlightByCategory,
  getOrgSponsorsGlobal,
} from '@/infrastructure/cms/orgSiteQueries';
