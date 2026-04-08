import RichText from '@/components/cms/RichText';
import OrgEventRegistrationFlow from '@/components/org-site/OrgEventRegistrationFlow';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { getOrgEventById } from '@/lib/org-site-feed';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import { extractMediaAsset } from '@/lib/org-site-helpers';
import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

async function OrgEventRegistrationSectionServer({
  section,
  sectionKey,
  sectionStyle,
  innerStyle,
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
      <div style={{ ...innerStyle, maxWidth: '920px' }}>
        <p className="section-label" style={{ marginBottom: '10px' }}>
          Registration
        </p>
        <h1 style={{ marginTop: 0, marginBottom: '8px', fontSize: 'clamp(32px, 5vw, 50px)' }}>
          {event.title}
        </h1>

        {event.registrationInstructions ? (
          <section style={{ marginBottom: '22px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '10px', fontSize: '24px' }}>
              Registration Instructions
            </h2>
            <RichText data={event.registrationInstructions as SerializedEditorState} />
          </section>
        ) : null}

        <OrgEventRegistrationFlow
          basePath=""
          event={{
            id: String(event.id),
            title: event.title,
            slug: event.slug,
            registrationRequired: event.registrationRequired === true,
            paymentRequired: event.paymentRequired === true,
            paymentReferenceFormat: event.paymentReferenceFormat,
            paymentInstructions:
              event.paymentInstructions as SerializedEditorState | null | undefined,
            zelleQr: extractMediaAsset(event.zelleQrCode),
            venmoQr: extractMediaAsset(event.venmoQrCode),
          }}
        />
      </div>
    </section>
  );
}

export default function OrgEventRegistrationSection(props: SectionRendererProps) {
  return <OrgEventRegistrationSectionServer {...props} />;
}
