import Image from 'next/image';
import Link from 'next/link';
import RichText from '@/components/cms/RichText';
import OrgSecondaryNav from '@/components/org-site/OrgSecondaryNav';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { SPOTLIGHT_CATEGORIES } from '@/lib/org-site-helpers';
import { extractMediaAsset } from '@/lib/org-site-helpers';
import { getOrgSpotlightById } from '@/lib/org-site-feed';
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

async function OrgSpotlightDetailSectionServer({
  section,
  sectionKey,
  sectionStyle,
  innerStyle,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);

  const entryField = sectionRecord.spotlightEntry;
  const entryId =
    typeof entryField === 'number' || typeof entryField === 'string'
      ? Number(entryField)
      : typeof entryField === 'object' && entryField !== null
        ? Number((entryField as Record<string, unknown>).id)
        : null;
  if (!entryId) return null;

  const cmsReadOptions = await getCmsReadOptions();
  const entry = await getOrgSpotlightById(entryId, cmsReadOptions);
  if (!entry) return null;
  if (!entry.id || !entry.name) return null;

  const showCategoryNav = sectionRecord.showCategoryNav !== false;
  const categoryNavBasePath = '/spotlight';

  const navItems =
    showCategoryNav
      ? SPOTLIGHT_CATEGORIES.map((value) => ({
          label: value.replace(/_/g, ' '),
          href: `${categoryNavBasePath}/${value}`,
        }))
      : null;

  const image = extractMediaAsset(entry.thumbnailImage);
  const galleryImages = Array.isArray(entry.additionalImages)
    ? entry.additionalImages
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
          Community Spotlight
        </p>
        <SectionHeading tag="h1" style={detailTitleStyle}>
          {entry.name}
        </SectionHeading>
        <p style={detailMetaStyle}>
          {entry.category.replace(/_/g, ' ')}
        </p>

        {navItems ? (
          <OrgSecondaryNav
            items={navItems}
            activeHref={`${categoryNavBasePath}/${entry.category}/${entry.slug}`}
          />
        ) : null}

        {image?.url ? (
          <Image
            src={image.url}
            alt={image.alt || entry.name}
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
            alt="Spotlight image placeholder"
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
        <p style={detailLeadStyle}>{entry.shortSummary}</p>

        {entry.detailContent ? (
          <RichText data={entry.detailContent as SerializedEditorState} />
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
                  alt={galleryImage.alt || entry.name}
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

        {entry.externalLink ? (
          <p style={{ marginTop: '22px' }}>
            <Link href={entry.externalLink} target="_blank" rel="noopener noreferrer">
              External link
            </Link>
          </p>
        ) : null}
      </article>
    </section>
  );
}

export default function OrgSpotlightDetailSection(props: SectionRendererProps) {
  return <OrgSpotlightDetailSectionServer {...props} />;
}
