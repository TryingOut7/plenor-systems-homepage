import Image from 'next/image';
import Link from 'next/link';
import RichText from '@/components/cms/RichText';
import OrgSecondaryNav from '@/components/org-site/OrgSecondaryNav';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { SPOTLIGHT_CATEGORIES } from '@/lib/org-site-helpers';
import { extractMediaAsset } from '@/lib/org-site-helpers';
import { getOrgSpotlightById } from '@/lib/org-site-feed';
import { getCmsReadOptions } from '@/lib/cms-read-options';
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
        <h1 style={{ marginTop: 0, marginBottom: '8px', fontSize: 'clamp(34px, 5vw, 54px)' }}>
          {entry.name}
        </h1>
        <p style={{ marginTop: 0, color: 'var(--ui-color-text-muted)' }}>
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
            alt="Spotlight image placeholder"
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
        <p style={{ marginTop: 0, marginBottom: '20px', lineHeight: 1.7 }}>{entry.shortSummary}</p>

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
      </article>
    </section>
  );
}

export default function OrgSpotlightDetailSection(props: SectionRendererProps) {
  return <OrgSpotlightDetailSectionServer {...props} />;
}
