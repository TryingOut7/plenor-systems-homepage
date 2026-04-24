import { cache } from 'react';
import type { CmsReadOptions } from '@/payload/cms';
import { getPayload } from '@/payload/client';
import { isPubliclyVisibleDoc } from '@/payload/access/publicVisibility';

type OrgReadOptions = CmsReadOptions;

type OrgVisibilityDoc = {
  _status?: unknown;
  workflowStatus?: unknown;
};

type OrgAboutProfileDoc = OrgVisibilityDoc & {
  id: number;
  slug?: string | null;
  name?: string | null;
  category?: string | null;
  shortBio?: string | null;
  detailContent?: unknown;
  profileImage?: unknown;
  additionalImages?: Array<{ id?: string | number | null; image?: unknown }>;
  roleTitle?: string | null;
  affiliation?: string | null;
  externalLink?: string | null;
};

type OrgSponsorsDoc = {
  pageTitle?: string | null;
  supportSummary?: unknown;
  sponsorAcknowledgmentContent?: unknown;
  donationInstructions?: unknown;
  zelleQrCode?: unknown;
  venmoQrCode?: unknown;
  paymentInstructionsContent?: unknown;
  supportContactPath?: string | null;
  sponsorLogos?: Array<{ id?: string | number | null; logo?: unknown; label?: string | null }>;
  featuredSupporterText?: unknown;
  supportFaq?: Array<{ id?: string | number | null; question?: string | null; answer?: string | null }>;
  displayOrder?: string[] | null;
};

type EmptyOrgDoc = Record<string, never>;

type OrgHomeSection<T> = {
  items: T[];
  placeholder: string | null;
};

export type OrgHomeFeaturesResult = {
  sectionOrder: string[];
  events: OrgHomeSection<EmptyOrgDoc>;
  spotlight: OrgHomeSection<EmptyOrgDoc>;
  learning: OrgHomeSection<EmptyOrgDoc>;
  sponsors: OrgSponsorsDoc | null;
};

function isDraftRead(options?: OrgReadOptions): boolean {
  return options?.draft === true;
}

function includeForRead<T extends OrgVisibilityDoc>(
  doc: T,
  options?: OrgReadOptions,
): boolean {
  return isDraftRead(options) || isPubliclyVisibleDoc(doc, { allowMissingWorkflowStatus: true });
}

function queryDraftOptions(options?: OrgReadOptions): {
  draft?: true;
  overrideAccess?: true;
} {
  return isDraftRead(options) ? { draft: true, overrideAccess: true } : {};
}

function emptyHomeSection<T>(): OrgHomeSection<T> {
  return { items: [], placeholder: null };
}

export const getOrgAboutById = cache(async function getOrgAboutById(
  id: number | string,
  options: OrgReadOptions = {},
): Promise<OrgAboutProfileDoc | null> {
  try {
    const payload = await getPayload();
    const doc = (await payload.findByID({
      collection: 'org-about-profiles',
      id,
      depth: 2,
      ...queryDraftOptions(options),
    })) as OrgAboutProfileDoc | null;

    if (!doc) return null;
    if (!includeForRead(doc, options)) return null;
    return doc;
  } catch {
    return null;
  }
});

export const getOrgSponsorsGlobal = cache(async function getOrgSponsorsGlobal(
  options: OrgReadOptions = {},
): Promise<OrgSponsorsDoc | null> {
  try {
    const payload = await getPayload();
    return (await payload.findGlobal({
      slug: 'org-sponsors',
      depth: 1,
      ...queryDraftOptions(options),
    })) as OrgSponsorsDoc | null;
  } catch {
    return null;
  }
});

// Legacy org-site collections were removed. Keep no-op compatibility exports so
// older internal helpers compile without reintroducing deleted collection slugs.
export const getOrgEventById = cache(async function getOrgEventById(): Promise<null> {
  return null;
});

export const getOrgLearningById = cache(async function getOrgLearningById(): Promise<null> {
  return null;
});

export const getOrgSpotlightById = cache(async function getOrgSpotlightById(): Promise<null> {
  return null;
});

export const getOrgEventsByStatus = cache(async function getOrgEventsByStatus(): Promise<
  EmptyOrgDoc[]
> {
  return [];
});

export const getOrgSpotlightByCategory = cache(
  async function getOrgSpotlightByCategory(): Promise<EmptyOrgDoc[]> {
    return [];
  },
);

export const getOrgLearningByCategory = cache(
  async function getOrgLearningByCategory(): Promise<EmptyOrgDoc[]> {
    return [];
  },
);

export const getOrgHomeFeatures = cache(async function getOrgHomeFeatures(
  options: OrgReadOptions = {},
): Promise<OrgHomeFeaturesResult> {
  return {
    sectionOrder: [],
    events: emptyHomeSection(),
    spotlight: emptyHomeSection(),
    learning: emptyHomeSection(),
    sponsors: await getOrgSponsorsGlobal(options),
  };
});
