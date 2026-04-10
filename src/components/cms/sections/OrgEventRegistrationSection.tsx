import FormRenderer from '@/components/cms/FormRenderer';
import RichText from '@/components/cms/RichText';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { getOrgEventById } from '@/lib/org-site-feed';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import type { SectionRendererProps } from './types';
import { asSectionRecord, formRelationshipToId } from './utils';

async function OrgEventRegistrationSectionServer({
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

        {event.registrationRequired !== true ? (
          <section
            style={{
              border: '1px solid var(--ui-color-border)',
              borderRadius: '10px',
              padding: '18px',
            }}
          >
            <p style={{ margin: 0 }}>This event does not currently require registration.</p>
          </section>
        ) : formId ? (
          <div style={{ maxWidth: '700px' }}>
            <FormRenderer
              formId={formId}
              theme={theme}
              guideFormLabels={guideFormLabels}
              inquiryFormLabels={inquiryFormLabels}
            />
          </div>
        ) : (
          <section
            style={{
              border: '1px solid var(--ui-color-border)',
              borderRadius: '10px',
              padding: '18px',
            }}
          >
            <p style={{ margin: 0 }}>No registration form is configured for this event yet.</p>
          </section>
        )}
      </div>
    </section>
  );
}

export default function OrgEventRegistrationSection(props: SectionRendererProps) {
  return <OrgEventRegistrationSectionServer {...props} />;
}
