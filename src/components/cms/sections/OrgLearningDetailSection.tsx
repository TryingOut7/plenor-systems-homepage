import Image from 'next/image';
import Link from 'next/link';
import RichText from '@/components/cms/RichText';
import OrgSecondaryNav from '@/components/org-site/OrgSecondaryNav';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { LEARNING_CATEGORIES } from '@/lib/org-site-helpers';
import { extractMediaAsset } from '@/lib/org-site-helpers';
import { getOrgLearningById } from '@/lib/org-site-feed';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

async function OrgLearningDetailSectionServer({
  section,
  sectionKey,
  sectionStyle,
  innerStyle,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);

  const entryField = sectionRecord.learningEntry;
  const entryId =
    typeof entryField === 'number' || typeof entryField === 'string'
      ? Number(entryField)
      : typeof entryField === 'object' && entryField !== null
        ? Number((entryField as Record<string, unknown>).id)
        : null;
  if (!entryId) return null;

  const cmsReadOptions = await getCmsReadOptions();
  const entry = await getOrgLearningById(entryId, cmsReadOptions);
  if (!entry) return null;
  if (!entry.id || !entry.title) return null;

  const showCategoryNav = sectionRecord.showCategoryNav !== false;
  const categoryNavBasePath = '/learning';

  const navItems =
    showCategoryNav
      ? LEARNING_CATEGORIES.map((value) => ({
          label: value.replace(/_/g, ' '),
          href: `${categoryNavBasePath}/${value}`,
        }))
      : null;

  const image = extractMediaAsset(entry.thumbnail);

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
          Learning and Giving Back
        </p>
        <h1 style={{ marginTop: 0, marginBottom: '8px', fontSize: 'clamp(34px, 5vw, 54px)' }}>
          {entry.title}
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
      </article>
    </section>
  );
}

export default function OrgLearningDetailSection(props: SectionRendererProps) {
  return <OrgLearningDetailSectionServer {...props} />;
}
