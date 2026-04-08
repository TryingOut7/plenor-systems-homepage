import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OrgSecondaryNav from '@/components/org-site/OrgSecondaryNav';
import { OrgLearningCard } from '@/components/org-site/OrgCards';
import {
  LEARNING_CATEGORIES,
  type LearningCategory,
} from '@/domain/org-site/constants';
import { getOrgLearningByCategory } from '@/infrastructure/cms/orgSiteQueries';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import { resolveCommunityBasePath } from '@/lib/community-site-config';
import { buildCommunityHref } from '@/lib/org-site-helpers';
import { resolveSiteUrl } from '@/lib/site-config';
import { getSiteSettings } from '@/payload/cms';

export const revalidate = 60;

type RouteParams = {
  category: string;
};

function asLearningCategory(value: string): LearningCategory | null {
  return LEARNING_CATEGORIES.includes(value as LearningCategory)
    ? (value as LearningCategory)
    : null;
}

function categoryLabel(category: LearningCategory): string {
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
  const category = asLearningCategory(resolvedParams.category);
  if (!category) return {};

  const label = categoryLabel(category);
  const cmsReadOptions = await getCmsReadOptions();
  const settings = await getSiteSettings(cmsReadOptions);
  const siteUrl = resolveSiteUrl(settings);
  const canonical = `${siteUrl}${buildCommunityHref(basePath, `learning/${category}`)}`;

  return {
    title: `Learning: ${label}`,
    description: `Learning and giving-back resources in ${label}.`,
    alternates: { canonical },
    openGraph: {
      title: `Learning: ${label}`,
      description: `Learning and giving-back resources in ${label}.`,
      url: canonical,
    },
  };
}

export default async function LearningCategoryPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const basePath = resolveCommunityBasePath();
  if (!basePath) notFound();

  const resolvedParams = await params;
  const category = asLearningCategory(resolvedParams.category);
  if (!category) notFound();

  const cmsReadOptions = await getCmsReadOptions();
  const entries = await getOrgLearningByCategory(category, cmsReadOptions);

  const navItems = LEARNING_CATEGORIES.map((value) => ({
    label: categoryLabel(value),
    href: buildCommunityHref(basePath, `learning/${value}`),
  }));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '70px 24px 96px' }}>
      <p className="section-label" style={{ marginBottom: '10px' }}>
        Learning and Giving Back
      </p>
      <h1 style={{ marginTop: 0, marginBottom: '12px', fontSize: 'clamp(32px, 5vw, 50px)' }}>
        {categoryLabel(category)}
      </h1>
      <p style={{ marginTop: 0, marginBottom: '24px', color: 'var(--ui-color-text-muted)' }}>
        Browse published resources and programs in this category.
      </p>

      <OrgSecondaryNav
        items={navItems}
        activeHref={buildCommunityHref(basePath, `learning/${category}`)}
      />

      {entries.length === 0 ? (
        <p style={{ color: 'var(--ui-color-text-muted)' }}>
          No learning resources are published in this category yet.
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
            <OrgLearningCard
              key={entry.id}
              learning={entry}
              href={buildCommunityHref(basePath, `learning/${entry.category}/${entry.slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
