import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import RichText from '@/components/cms/RichText';
import OrgSecondaryNav from '@/components/org-site/OrgSecondaryNav';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { ABOUT_CATEGORIES, type AboutCategory } from '@/domain/org-site/constants';
import { getOrgAboutByCategory } from '@/infrastructure/cms/orgSiteQueries';
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

function asCategory(value: string): AboutCategory | null {
  return ABOUT_CATEGORIES.includes(value as AboutCategory) ? (value as AboutCategory) : null;
}

function categoryLabel(value: AboutCategory): string {
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
    getOrgAboutByCategory(category, cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);
  const entry = entries.find((candidate) => candidate.slug === resolvedParams.slug);
  if (!entry) return {};

  const siteUrl = resolveSiteUrl(settings);
  const canonical = `${siteUrl}${buildCommunityHref(
    basePath,
    `about/${category}/${resolvedParams.slug}`,
  )}`;
  const seo = entry.seo || {};
  const title = seo.metaTitle || entry.name || 'About profile';
  const description = seo.metaDescription || entry.shortBio || '';
  const image = extractMediaAsset(entry.profileImage);

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

export default async function AboutDetailPage({
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
  const entries = await getOrgAboutByCategory(category, cmsReadOptions);
  const entry = entries.find((candidate) => candidate.slug === resolvedParams.slug);
  if (!entry) notFound();

  const navItems = ABOUT_CATEGORIES.map((value) => ({
    label: categoryLabel(value),
    href: buildCommunityHref(basePath, `about/${value}`),
  }));

  const image = extractMediaAsset(entry.profileImage);
  const galleryImages = Array.isArray(entry.additionalImages)
    ? entry.additionalImages
        .map((item) => extractMediaAsset(item.image))
        .filter((item): item is NonNullable<typeof item> => !!item)
    : [];

  return (
    <article style={{ maxWidth: '980px', margin: '0 auto', padding: '70px 24px 96px' }}>
      <p className="section-label" style={{ marginBottom: '10px' }}>
        About
      </p>
      <h1 style={{ marginTop: 0, marginBottom: '8px', fontSize: 'clamp(34px, 5vw, 54px)' }}>
        {entry.name}
      </h1>
      <p style={{ marginTop: 0, color: 'var(--ui-color-text-muted)' }}>{categoryLabel(category)}</p>

      <OrgSecondaryNav
        items={navItems}
        activeHref={buildCommunityHref(basePath, `about/${category}/${entry.slug}`)}
      />

      {image?.url ? (
        <Image
          src={image.url}
          alt={image.alt || entry.name}
          width={image.width || 800}
          height={image.height || 800}
          style={{
            width: '100%',
            height: 'auto',
            aspectRatio: '1 / 1',
            objectFit: 'cover',
            borderRadius: '12px',
            border: '1px solid var(--ui-color-border)',
            marginBottom: '20px',
          }}
        />
      ) : (
        <Image
          src="/media/qa-media-1.svg"
          alt="Profile image placeholder"
          width={800}
          height={800}
          style={{
            width: '100%',
            height: 'auto',
            aspectRatio: '1 / 1',
            objectFit: 'contain',
            borderRadius: '12px',
            border: '1px solid var(--ui-color-border)',
            marginBottom: '20px',
            backgroundColor: 'var(--ui-color-section-alt)',
          }}
        />
      )}

      {entry.roleTitle ? (
        <p style={{ marginTop: 0, marginBottom: '6px' }}>
          <strong>Role:</strong> {entry.roleTitle}
        </p>
      ) : null}
      {entry.affiliation ? (
        <p style={{ marginTop: 0, marginBottom: '16px' }}>
          <strong>Affiliation:</strong> {entry.affiliation}
        </p>
      ) : null}
      <p style={{ marginTop: 0, marginBottom: '20px', lineHeight: 1.7 }}>{entry.shortBio}</p>

      {entry.detailContent ? (
        <RichText data={entry.detailContent as SerializedEditorState} />
      ) : null}

      {galleryImages.length > 0 ? (
        <section style={{ marginTop: '24px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '12px' }}>Gallery</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            {galleryImages.map((galleryImage) => (
              <Image
                key={galleryImage.url}
                src={galleryImage.url}
                alt={galleryImage.alt || entry.name}
                width={galleryImage.width || 500}
                height={galleryImage.height || 500}
                style={{
                  width: '100%',
                  height: 'auto',
                  aspectRatio: '1 / 1',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  border: '1px solid var(--ui-color-border)',
                }}
              />
            ))}
          </div>
        </section>
      ) : null}

      {entry.externalLink ? (
        <p style={{ marginTop: '22px' }}>
          <Link href={entry.externalLink} target="_blank" rel="noopener noreferrer">
            External link
          </Link>
        </p>
      ) : null}

      <p style={{ marginTop: '28px' }}>
        <Link href={buildCommunityHref(basePath, `about/${category}`)}>
          Back to {categoryLabel(category)}
        </Link>
      </p>
    </article>
  );
}
