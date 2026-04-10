import Image from 'next/image';
import Link from 'next/link';
import FormRenderer from '@/components/cms/FormRenderer';
import RichText from '@/components/cms/RichText';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { getOrgEventById } from '@/lib/org-site-feed';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import {
  extractMediaAsset,
  formatEventDateRange,
  formatEventTimeLabel,
} from '@/lib/org-site-helpers';
import type { OrgEvent } from '@/payload-types';
import SectionHeading from './shared/SectionHeading';
import {
  detailLeadStyle,
  detailMetaStyle,
  detailPanelStyle,
  detailSubsectionHeadingStyle,
  detailTitleStyle,
  getDetailMediaStyle,
} from './shared/detailStyles';
import type { SectionRendererProps } from './types';
import { asSectionRecord, formRelationshipToId } from './utils';

function relatedLinks(event: OrgEvent): Array<{ label: string; href: string }> {
  const links: Array<{ label: string; href: string }> = [];

  if (Array.isArray(event.relatedSpotlight)) {
    for (const entry of event.relatedSpotlight) {
      if (!entry || typeof entry !== 'object') continue;
      if (typeof entry.slug !== 'string' || typeof entry.category !== 'string') continue;
      if (typeof entry.name !== 'string') continue;
      links.push({ label: entry.name, href: `/spotlight/${entry.category}/${entry.slug}` });
    }
  }

  if (Array.isArray(event.relatedLearning)) {
    for (const entry of event.relatedLearning) {
      if (!entry || typeof entry !== 'object') continue;
      if (typeof entry.slug !== 'string' || typeof entry.category !== 'string') continue;
      if (typeof entry.title !== 'string') continue;
      links.push({ label: entry.title, href: `/learning/${entry.category}/${entry.slug}` });
    }
  }

  return links;
}

async function OrgEventDetailSectionServer({
  section,
  sectionKey,
  sectionStyle,
  innerStyle,
  theme,
  guideFormLabels,
  inquiryFormLabels,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);

  const eventField = sectionRecord.event;
  const eventId =
    typeof eventField === 'number' || typeof eventField === 'string'
      ? Number(eventField)
      : typeof eventField === 'object' && eventField !== null
        ? Number((eventField as Record<string, unknown>).id)
        : null;

  if (!eventId) return null;

  const cmsReadOptions = await getCmsReadOptions();
  const event = await getOrgEventById(eventId, cmsReadOptions);
  if (!event) return null;

  const showRegistrationCta = sectionRecord.showRegistrationCta !== false;

  const hero = extractMediaAsset(event.heroImage);
  const related = relatedLinks(event);
  const eventRecord = event as unknown as Record<string, unknown>;
  const formId = formRelationshipToId(eventRecord.registrationForm);

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
      <article style={{ ...innerStyle, maxWidth: '980px', padding: '0' }}>
        <p className="section-label" style={{ marginBottom: '8px' }}>
          {event.eventType.replace(/_/g, ' ')}
        </p>
        <SectionHeading
          tag="h1"
          style={{ ...detailTitleStyle, marginBottom: '14px' }}
        >
          {event.title}
        </SectionHeading>
        <p style={detailMetaStyle}>
          Status: {event.eventStatus.replace(/_/g, ' ')}
        </p>

        <div
          style={{
            ...detailPanelStyle,
            marginBottom: '24px',
            display: 'grid',
            gap: '8px',
          }}
        >
          <p style={{ margin: 0 }}>
            <strong>Date:</strong>{' '}
            {formatEventDateRange(event.startDate, event.endDate, event.eventTimezone)}
          </p>
          <p style={{ margin: 0 }}>
            <strong>Time:</strong> {formatEventTimeLabel(event.startDate, event.eventTimezone)}
          </p>
          {event.venue ? (
            <p style={{ margin: 0 }}>
              <strong>Venue:</strong> {event.venue}
            </p>
          ) : null}
          {event.location ? (
            <p style={{ margin: 0 }}>
              <strong>Location:</strong> {event.location}
            </p>
          ) : null}
        </div>

        {hero?.url ? (
          <Image
            src={hero.url}
            alt={hero.alt || event.title}
            width={hero.width || 1200}
            height={hero.height || 675}
            style={{
              ...getDetailMediaStyle({ aspectRatio: '16 / 9' }),
              marginBottom: '24px',
            }}
          />
        ) : (
          <Image
            src="/media/qa-media.svg"
            alt="Event image placeholder"
            width={1200}
            height={675}
            style={{
              ...getDetailMediaStyle({
                aspectRatio: '16 / 9',
                fit: 'contain',
                backgroundColor: 'var(--ui-color-section-alt)',
              }),
              marginBottom: '24px',
            }}
          />
        )}

        <p
          style={{
            ...detailLeadStyle,
            marginBottom: '22px',
          }}
        >
          {event.shortSummary}
        </p>

        {event.description ? (
          <RichText data={event.description as SerializedEditorState} />
        ) : null}

        {showRegistrationCta && event.registrationRequired ? (
          <section
            style={{
              marginTop: '32px',
              ...detailPanelStyle,
              padding: '22px',
            }}
          >
            <SectionHeading
              tag="h2"
              style={{ ...detailSubsectionHeadingStyle, marginBottom: '8px' }}
            >
              Registration
            </SectionHeading>
            <p style={{ marginTop: 0, color: 'var(--ui-color-text-muted)' }}>
              Registration is required for this event.
            </p>
            {event.registrationInstructions ? (
              <div style={{ marginBottom: '18px' }}>
                <RichText data={event.registrationInstructions as SerializedEditorState} />
              </div>
            ) : null}

            {formId ? (
              <div style={{ maxWidth: '700px' }}>
                <FormRenderer
                  formId={formId}
                  theme={theme}
                  guideFormLabels={guideFormLabels}
                  inquiryFormLabels={inquiryFormLabels}
                />
              </div>
            ) : (
              <p style={{ marginBottom: 0, color: 'var(--ui-color-text-muted)' }}>
                Registration form is not configured for this event yet.
              </p>
            )}
          </section>
        ) : null}

        {related.length > 0 ? (
          <section style={{ marginTop: '32px' }}>
            <SectionHeading tag="h2" style={detailSubsectionHeadingStyle}>
              Related community links
            </SectionHeading>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'grid', gap: '8px' }}>
              {related.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </section>
  );
}

export default function OrgEventDetailSection(props: SectionRendererProps) {
  return <OrgEventDetailSectionServer {...props} />;
}
