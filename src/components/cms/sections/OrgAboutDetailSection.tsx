import Image from 'next/image';
import Link from 'next/link';
import RichText from '@/components/cms/RichText';
import OrgSecondaryNav from '@/components/org-site/OrgSecondaryNav';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { ABOUT_CATEGORIES } from '@/lib/org-site-helpers';
import { extractMediaAsset } from '@/lib/org-site-helpers';
import { getOrgAboutById } from '@/lib/org-site-feed';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import SectionHeading from './shared/SectionHeading';
import {
  detailGalleryGridStyle,
  detailLeadStyle,
  detailMetaStyle,
  detailSubsectionHeadingStyle,
  detailTitleStyle,
  getDetailMediaStyle,
} from './shared/detailStyles';
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
  const categoryLabel = (profile.category || 'about').replace(/_/g, ' ');
  const activeCategory = profile.category || 'about';
  const profileName = profile.name || 'Profile';

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
        <SectionHeading tag="h1" style={detailTitleStyle}>
          {profile.name}
        </SectionHeading>
        <p style={detailMetaStyle}>
          {categoryLabel}
        </p>

        {navItems ? (
          <OrgSecondaryNav
            items={navItems}
            activeHref={`${categoryNavBasePath}/${activeCategory}/${profile.slug}`}
          />
        ) : null}

        {image?.url ? (
          <Image
            src={image.url}
            alt={image.alt || profile.name}
            width={image.width || 800}
            height={image.height || 800}
            style={{
              ...getDetailMediaStyle({ aspectRatio: '1 / 1' }),
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
              ...getDetailMediaStyle({
                aspectRatio: '1 / 1',
                fit: 'contain',
                backgroundColor: 'var(--ui-color-section-alt)',
              }),
              marginBottom: '20px',
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
        <p style={detailLeadStyle}>{profile.shortBio}</p>

        {profile.detailContent ? (
          <RichText data={profile.detailContent as SerializedEditorState} />
        ) : null}

        {galleryImages.length > 0 ? (
          <section style={{ marginTop: '24px' }}>
            <SectionHeading tag="h2" style={detailSubsectionHeadingStyle}>
              Gallery
            </SectionHeading>
            <div style={detailGalleryGridStyle}>
              {galleryImages.map((galleryImage) => (
                <Image
                  key={galleryImage.url}
                  src={galleryImage.url}
                  alt={galleryImage.alt || profileName}
                  width={galleryImage.width || 500}
                  height={galleryImage.height || 500}
                  style={{
                    ...getDetailMediaStyle({ aspectRatio: '1 / 1' }),
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
