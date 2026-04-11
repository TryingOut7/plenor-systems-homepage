import type { Metadata } from 'next';
import Link from 'next/link';
import OrgSecondaryNav from '@/components/org-site/OrgSecondaryNav';
import CmsPreviewDiffBanner from '@/components/CmsPreviewDiffBanner';
import PageChromeOverrides from '@/components/PageChromeOverrides';
import UniversalSections from '@/components/cms/UniversalSections';
import {
  ABOUT_SECONDARY_NAV_ITEMS,
  ABOUT_SECTION_VALUES,
  mapAboutSectionToProfileCategories,
  readAllowedQueryValue,
} from '@/lib/plenor-site';
import {
  getAboutProfiles,
  getCollectionData,
  getSitePageBySlug,
  getSiteSettings,
} from '@/payload/cms';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || 'Plenor.ai';

  return {
    title: `About | ${siteName}`,
    description:
      'Background, leadership, and operating principles behind Plenor.',
  };
}

export default async function AboutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const selectedSection = readAllowedQueryValue(
    resolvedSearchParams.section,
    ABOUT_SECTION_VALUES,
  );

  const cmsReadOptions = { draft: false };
  const [sitePage, siteSettings, collectionData, profiles] = await Promise.all([
    getSitePageBySlug('about', cmsReadOptions),
    getSiteSettings(cmsReadOptions),
    getCollectionData(cmsReadOptions),
    getAboutProfiles(cmsReadOptions),
  ]);

  const profileCategories = mapAboutSectionToProfileCategories(selectedSection);
  const visibleProfiles = profileCategories.length
    ? profiles.filter((profile) => profile.category && profileCategories.includes(profile.category))
    : profiles;

  const showNarrativeSections =
    !selectedSection ||
    selectedSection === 'company' ||
    selectedSection === 'working-principles';
  const showProfiles =
    !selectedSection || selectedSection === 'founder' || selectedSection === 'leadership';

  return (
    <>
      {sitePage ? <PageChromeOverrides page={sitePage} /> : null}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px 96px' }}>
        <CmsPreviewDiffBanner
          summary={sitePage ? (sitePage as Record<string, unknown>).previewDiffSummary : undefined}
        />
        <p className="section-label" style={{ marginBottom: '12px' }}>
          About
        </p>
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.125rem)',
            lineHeight: 1.1,
            margin: '0 0 16px',
            color: 'var(--ui-color-primary)',
          }}
        >
          {sitePage?.title || 'About Plenor'}
        </h1>
        <p
          style={{
            maxWidth: '720px',
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'var(--ui-color-text-muted)',
            margin: '0 0 32px',
          }}
        >
          Company context, founder and leadership profiles, and the working principles
          behind Plenor’s CMS-driven delivery model.
        </p>

        <OrgSecondaryNav
          items={ABOUT_SECONDARY_NAV_ITEMS}
          activeHref={selectedSection ? `/about?section=${selectedSection}` : '/about'}
          navLabel="About sections"
        />

        {showNarrativeSections && sitePage?.sections?.length ? (
          <div style={{ marginTop: '32px' }}>
            <UniversalSections
              sections={sitePage.sections}
              collections={collectionData}
              guideFormLabels={siteSettings?.guideForm}
              inquiryFormLabels={siteSettings?.inquiryForm}
            />
          </div>
        ) : null}

        {showProfiles ? (
          <section style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: 'var(--ui-color-primary)' }}>
              {selectedSection === 'founder'
                ? 'Founder'
                : selectedSection === 'leadership'
                  ? 'Leadership'
                  : 'Profiles'}
            </h2>
            {visibleProfiles.length === 0 ? (
              <p style={{ color: 'var(--ui-color-text-muted)' }}>
                No published profiles are available yet.
              </p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '20px',
                }}
              >
                {visibleProfiles.map((profile) => (
                  <article
                    key={profile.id || profile.slug}
                    style={{
                      backgroundColor: 'var(--ui-color-surface)',
                      border: '1px solid var(--ui-color-border)',
                      borderRadius: 'var(--ui-card-radius)',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <p className="section-label" style={{ margin: 0 }}>
                      {profile.displayLabel}
                    </p>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '1.375rem',
                        lineHeight: 1.3,
                        color: 'var(--ui-color-primary)',
                      }}
                    >
                      {profile.name}
                    </h3>
                    {profile.roleTitle ? (
                      <p style={{ margin: 0, color: 'var(--ui-color-text-muted)' }}>
                        {profile.roleTitle}
                      </p>
                    ) : null}
                    {profile.shortBio ? (
                      <p style={{ margin: 0, color: 'var(--ui-color-text-muted)', lineHeight: 1.7 }}>
                        {profile.shortBio}
                      </p>
                    ) : null}
                    {profile.slug ? (
                      <p style={{ margin: 'auto 0 0' }}>
                        <Link href={`/about/${profile.slug}`} style={{ fontWeight: 700 }}>
                          View profile
                        </Link>
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>
    </>
  );
}
