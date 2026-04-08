import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import RichText from '@/components/cms/RichText';
import OrgSecondaryNav from '@/components/org-site/OrgSecondaryNav';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import {
  LEARNING_CATEGORIES,
  type LearningCategory,
} from '@/domain/org-site/constants';
import { getOrgLearningByCategory } from '@/infrastructure/cms/orgSiteQueries';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import { resolveCommunityBasePath } from '@/lib/community-site-config';
import { buildCommunityHref, extractMediaAsset } from '@/lib/org-site-helpers';
import { resolveSiteUrl } from '@/lib/site-config';
import { getSiteSettings } from '@/payload/cms';

export const revalidate = 60;

type RouteParams = {
  category: string;
  slug: string;
};

function asCategory(value: string): LearningCategory | null {
  return LEARNING_CATEGORIES.includes(value as LearningCategory)
    ? (value as LearningCategory)
    : null;
}

function categoryLabel(value: LearningCategory): string {
  return value.replace(/_/g, ' ');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const basePath = resolveCommunityBasePath();
  if (!basePath) return {};

  const resolvedParams = await params;
  const category = asCategory(resolvedParams.category);
  if (!category) return {};

  const cmsReadOptions = await getCmsReadOptions();
  const [entries, settings] = await Promise.all([
    getOrgLearningByCategory(category, cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);
  const entry = entries.find((candidate) => candidate.slug === resolvedParams.slug);
  if (!entry) return {};

  const siteUrl = resolveSiteUrl(settings);
  const canonical = `${siteUrl}${buildCommunityHref(
    basePath,
    `learning/${category}/${resolvedParams.slug}`,
  )}`;
  const seo = entry.seo || {};
  const title = seo.metaTitle || entry.title || 'Learning resource';
  const description = seo.metaDescription || entry.shortSummary || '';
  const image = extractMediaAsset(entry.thumbnail);

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: !seo.noindex, follow: !seo.nofollow },
    openGraph: {
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      url: canonical,
      images: image?.url ? [{ url: image.url }] : undefined,
    },
  };
}

export default async function LearningDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const basePath = resolveCommunityBasePath();
  if (!basePath) notFound();

  const resolvedParams = await params;
  const category = asCategory(resolvedParams.category);
  if (!category) notFound();

  const cmsReadOptions = await getCmsReadOptions();
  const entries = await getOrgLearningByCategory(category, cmsReadOptions);
  const entry = entries.find((candidate) => candidate.slug === resolvedParams.slug);
  if (!entry) notFound();

  const navItems = LEARNING_CATEGORIES.map((value) => ({
    label: categoryLabel(value),
    href: buildCommunityHref(basePath, `learning/${value}`),
  }));
  const image = extractMediaAsset(entry.thumbnail);

  return (
    <article style={{ maxWidth: '980px', margin: '0 auto', padding: '70px 24px 96px' }}>
      <p className="section-label" style={{ marginBottom: '10px' }}>
        Learning and Giving Back
      </p>
      <h1 style={{ marginTop: 0, marginBottom: '8px', fontSize: 'clamp(34px, 5vw, 54px)' }}>
        {entry.title}
      </h1>
      <p style={{ marginTop: 0, color: 'var(--ui-color-text-muted)' }}>{categoryLabel(category)}</p>

      <OrgSecondaryNav
        items={navItems}
        activeHref={buildCommunityHref(basePath, `learning/${category}/${entry.slug}`)}
      />

      {image?.url ? (
        <Image
          src={image.url}
          alt={image.alt || entry.title}
          width={image.width || 800}
          height={image.height || 600}
          style={{
            width: '100%',
            height: 'auto',
            aspectRatio: '4 / 3',
            objectFit: 'cover',
            borderRadius: '12px',
            border: '1px solid var(--ui-color-border)',
            marginBottom: '20px',
          }}
        />
      ) : (
        <Image
          src="/media/qa-media-2.svg"
          alt="Learning image placeholder"
          width={800}
          height={600}
          style={{
            width: '100%',
            height: 'auto',
            aspectRatio: '4 / 3',
            objectFit: 'contain',
            borderRadius: '12px',
            border: '1px solid var(--ui-color-border)',
            marginBottom: '20px',
            backgroundColor: 'var(--ui-color-section-alt)',
          }}
        />
      )}

      {entry.author ? (
        <p style={{ marginTop: 0, marginBottom: '6px' }}>
          <strong>Author:</strong> {entry.author}
        </p>
      ) : null}
      <p style={{ marginTop: 0, marginBottom: '20px', lineHeight: 1.7 }}>{entry.shortSummary}</p>

      {entry.detailContent ? (
        <RichText data={entry.detailContent as SerializedEditorState} />
      ) : null}

      {entry.externalReferenceLink ? (
        <p style={{ marginTop: '22px' }}>
          <Link href={entry.externalReferenceLink} target="_blank" rel="noopener noreferrer">
            External reference
          </Link>
        </p>
      ) : null}

      <p style={{ marginTop: '28px' }}>
        <Link href={buildCommunityHref(basePath, `learning/${category}`)}>
          Back to {categoryLabel(category)}
        </Link>
      </p>
    </article>
  );
}
