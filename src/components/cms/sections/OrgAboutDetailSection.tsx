import Image from 'next/image';
import Link from 'next/link';
import RichText from '@/components/cms/RichText';
import OrgSecondaryNav from '@/components/org-site/OrgSecondaryNav';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { ABOUT_CATEGORIES } from '@/lib/org-site-helpers';
import { extractMediaAsset } from '@/lib/org-site-helpers';
import { getOrgAboutById } from '@/lib/org-site-feed';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

async function OrgAboutDetailSectionServer({
  section,
  sectionKey,
  sectionStyle,
  innerStyle,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);

  const profileField = sectionRecord.profile;
  const profileId =
    typeof profileField === 'number' || typeof profileField === 'string'
      ? Number(profileField)
      : typeof profileField === 'object' && profileField !== null
        ? Number((profileField as Record<string, unknown>).id)
        : null;
  if (!profileId) return null;

  const cmsReadOptions = await getCmsReadOptions();
  const profile = await getOrgAboutById(profileId, cmsReadOptions);
  if (!profile) return null;
  if (!profile.id || !profile.name) return null;

  const showCategoryNav = sectionRecord.showCategoryNav !== false;
  const categoryNavBasePath = '/about';

  const navItems =
    showCategoryNav
      ? ABOUT_CATEGORIES.map((value) => ({
          label: value.replace(/_/g, ' '),
          href: `${categoryNavBasePath}/${value}`,
        }))
      : null;

  const image = extractMediaAsset(profile.profileImage);
  const galleryImages = Array.isArray(profile.additionalImages)
    ? profile.additionalImages
        .map((item) => extractMediaAsset(item.image))
        .filter((item): item is NonNullable<typeof item> => !!item)
    : [];

  return (
    <section
      key={sectionKey}
      id={typeof sectionRecord.anchorId === 'string' ? sectionRecord.anchorId : undefined}
      style={sectionStyle}
      className={
        typeof sectionRecord.customClassName === 'string'
          ? sectionRecord.customClassName
          : undefined
      }
    >
      <article style={{ ...innerStyle, maxWidth: '980px' }}>
        <p className="section-label" style={{ marginBottom: '10px' }}>
          About
        </p>
        <h1 style={{ marginTop: 0, marginBottom: '8px', fontSize: 'clamp(34px, 5vw, 54px)' }}>
          {profile.name}
        </h1>
        <p style={{ marginTop: 0, color: 'var(--ui-color-text-muted)' }}>
          {profile.category.replace(/_/g, ' ')}
        </p>

        {navItems ? (
          <OrgSecondaryNav
            items={navItems}
            activeHref={`${categoryNavBasePath}/${profile.category}/${profile.slug}`}
          />
        ) : null}

        {image?.url ? (
          <Image
            src={image.url}
            alt={image.alt || profile.name}
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

        {profile.roleTitle ? (
          <p style={{ marginTop: 0, marginBottom: '6px' }}>
            <strong>Role:</strong> {profile.roleTitle}
          </p>
        ) : null}
        {profile.affiliation ? (
          <p style={{ marginTop: 0, marginBottom: '16px' }}>
            <strong>Affiliation:</strong> {profile.affiliation}
          </p>
        ) : null}
        <p style={{ marginTop: 0, marginBottom: '20px', lineHeight: 1.7 }}>{profile.shortBio}</p>

        {profile.detailContent ? (
          <RichText data={profile.detailContent as SerializedEditorState} />
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
                  alt={galleryImage.alt || profile.name}
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

        {profile.externalLink ? (
          <p style={{ marginTop: '22px' }}>
            <Link href={profile.externalLink} target="_blank" rel="noopener noreferrer">
              External link
            </Link>
          </p>
        ) : null}
      </article>
    </section>
  );
}

export default function OrgAboutDetailSection(props: SectionRendererProps) {
  return <OrgAboutDetailSectionServer {...props} />;
}
