import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OrgSecondaryNav from '@/components/org-site/OrgSecondaryNav';
import { OrgSpotlightCard } from '@/components/org-site/OrgCards';
import {
  SPOTLIGHT_CATEGORIES,
  type SpotlightCategory,
} from '@/domain/org-site/constants';
import { getOrgSpotlightByCategory } from '@/infrastructure/cms/orgSiteQueries';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import { resolveCommunityBasePath } from '@/lib/community-site-config';
import { buildCommunityHref } from '@/lib/org-site-helpers';
import { resolveSiteUrl } from '@/lib/site-config';
import { getSiteSettings } from '@/payload/cms';

export const revalidate = 60;

type RouteParams = {
  category: string;
};

function asSpotlightCategory(value: string): SpotlightCategory | null {
  return SPOTLIGHT_CATEGORIES.includes(value as SpotlightCategory)
    ? (value as SpotlightCategory)
    : null;
}

function labelForCategory(category: SpotlightCategory): string {
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
  const category = asSpotlightCategory(resolvedParams.category);
  if (!category) return {};

  const categoryLabel = labelForCategory(category);
  const cmsReadOptions = await getCmsReadOptions();
  const settings = await getSiteSettings(cmsReadOptions);
  const siteUrl = resolveSiteUrl(settings);
  const canonical = `${siteUrl}${buildCommunityHref(basePath, `spotlight/${category}`)}`;

  return {
    title: `Spotlight: ${categoryLabel}`,
    description: `Community spotlight entries in the ${categoryLabel} category.`,
    alternates: { canonical },
    openGraph: {
      title: `Spotlight: ${categoryLabel}`,
      description: `Community spotlight entries in the ${categoryLabel} category.`,
      url: canonical,
    },
  };
}

export default async function SpotlightCategoryPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const basePath = resolveCommunityBasePath();
  if (!basePath) notFound();

  const resolvedParams = await params;
  const category = asSpotlightCategory(resolvedParams.category);
  if (!category) notFound();

  const cmsReadOptions = await getCmsReadOptions();
  const entries = await getOrgSpotlightByCategory(category, cmsReadOptions);

  const navItems = SPOTLIGHT_CATEGORIES.map((value) => ({
    label: labelForCategory(value),
    href: buildCommunityHref(basePath, `spotlight/${value}`),
  }));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '70px 24px 96px' }}>
      <p className="section-label" style={{ marginBottom: '10px' }}>
        Community Spotlight
      </p>
      <h1 style={{ marginTop: 0, marginBottom: '12px', fontSize: 'clamp(32px, 5vw, 50px)' }}>
        {labelForCategory(category)}
      </h1>
      <p style={{ marginTop: 0, marginBottom: '24px', color: 'var(--ui-color-text-muted)' }}>
        Explore people and organizations featured in this category.
      </p>

      <OrgSecondaryNav
        items={navItems}
        activeHref={buildCommunityHref(basePath, `spotlight/${category}`)}
      />

      {entries.length === 0 ? (
        <p style={{ color: 'var(--ui-color-text-muted)' }}>
          No spotlight entries are published in this category yet.
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
            <OrgSpotlightCard
              key={entry.id}
              spotlight={entry}
              href={buildCommunityHref(basePath, `spotlight/${entry.category}/${entry.slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
