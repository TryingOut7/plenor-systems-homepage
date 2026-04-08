import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OrgSecondaryNav from '@/components/org-site/OrgSecondaryNav';
import { OrgAboutCard } from '@/components/org-site/OrgCards';
import { ABOUT_CATEGORIES, type AboutCategory } from '@/domain/org-site/constants';
import { getOrgAboutByCategory } from '@/infrastructure/cms/orgSiteQueries';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import { resolveCommunityBasePath } from '@/lib/community-site-config';
import { buildCommunityHref } from '@/lib/org-site-helpers';
import { resolveSiteUrl } from '@/lib/site-config';
import { getSiteSettings } from '@/payload/cms';

export const revalidate = 60;

type RouteParams = {
  category: string;
};

function asAboutCategory(value: string): AboutCategory | null {
  return ABOUT_CATEGORIES.includes(value as AboutCategory) ? (value as AboutCategory) : null;
}

function categoryLabel(category: AboutCategory): string {
  return category.replace(/_/g, ' ');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const basePath = resolveCommunityBasePath();
  if (!basePath) return {};

  const resolvedParams = await params;
  const category = asAboutCategory(resolvedParams.category);
  if (!category) return {};

  const label = categoryLabel(category);
  const cmsReadOptions = await getCmsReadOptions();
  const settings = await getSiteSettings(cmsReadOptions);
  const siteUrl = resolveSiteUrl(settings);
  const canonical = `${siteUrl}${buildCommunityHref(basePath, `about/${category}`)}`;

  return {
    title: `About: ${label}`,
    description: `Meet the ${label} behind the community.`,
    alternates: { canonical },
    openGraph: {
      title: `About: ${label}`,
      description: `Meet the ${label} behind the community.`,
      url: canonical,
    },
  };
}

export default async function AboutCategoryPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const basePath = resolveCommunityBasePath();
  if (!basePath) notFound();

  const resolvedParams = await params;
  const category = asAboutCategory(resolvedParams.category);
  if (!category) notFound();

  const cmsReadOptions = await getCmsReadOptions();
  const entries = await getOrgAboutByCategory(category, cmsReadOptions);

  const navItems = ABOUT_CATEGORIES.map((value) => ({
    label: categoryLabel(value),
    href: buildCommunityHref(basePath, `about/${value}`),
  }));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '70px 24px 96px' }}>
      <p className="section-label" style={{ marginBottom: '10px' }}>
        About
      </p>
      <h1 style={{ marginTop: 0, marginBottom: '12px', fontSize: 'clamp(32px, 5vw, 50px)' }}>
        {categoryLabel(category)}
      </h1>
      <p style={{ marginTop: 0, marginBottom: '24px', color: 'var(--ui-color-text-muted)' }}>
        Meet contributors in this profile category.
      </p>

      <OrgSecondaryNav items={navItems} activeHref={buildCommunityHref(basePath, `about/${category}`)} />

      {entries.length === 0 ? (
        <p style={{ color: 'var(--ui-color-text-muted)' }}>
          No profiles are published in this category yet.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '22px',
          }}
        >
          {entries.map((entry) => (
            <OrgAboutCard
              key={entry.id}
              profile={entry}
              href={buildCommunityHref(basePath, `about/${entry.category}/${entry.slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
