import FormRenderer from '@/components/cms/FormRenderer';
import SectionHeading from './shared/SectionHeading';
import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

function formRelationshipToId(form: unknown): string {
  if (form == null) return '';
  if (typeof form === 'number' || typeof form === 'bigint') return String(form);
  if (typeof form === 'string') return form;
  if (typeof form === 'object' && 'id' in form) {
    const id = (form as { id?: unknown }).id;
    if (id != null) return String(id);
  }
  return '';
}

export default function FormSection({
  section,
  sectionKey,
  sectionStyle,
  theme,
  hTag,
  hSize,
  hFontSize,
  innerStyle,
  resolvedHeadingColor,
  resolvedBodyColor,
  guideFormLabels,
  inquiryFormLabels,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const formId = formRelationshipToId(sectionRecord.form);

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
      <div style={{ ...innerStyle, maxWidth: '700px' }}>
        {typeof sectionRecord.sectionLabel === 'string' && sectionRecord.sectionLabel ? (
          <p
            className="section-label"
            style={{ color: resolvedBodyColor, marginBottom: '12px' }}
          >
            {sectionRecord.sectionLabel}
          </p>
        ) : null}

        {sectionRecord.heading ? (
          <SectionHeading
            tag={hTag}
            style={{
              fontFamily: 'var(--ui-font-display)',
              fontSize: hSize === 'md' ? 'clamp(26px, 3.5vw, 38px)' : hFontSize,
              fontWeight: 700,
              color: resolvedHeadingColor,
              marginBottom: '12px',
            }}
          >
            {String(sectionRecord.heading)}
          </SectionHeading>
        ) : null}

        {sectionRecord.subheading ? (
          <p style={{ color: resolvedBodyColor, fontSize: '16px', marginBottom: '32px' }}>
            {String(sectionRecord.subheading)}
          </p>
        ) : null}

        {formId ? (
          <FormRenderer
            formId={formId}
            successMessage={
              typeof sectionRecord.successMessage === 'string'
                ? sectionRecord.successMessage
                : undefined
            }
            theme={theme}
            guideFormLabels={guideFormLabels}
            inquiryFormLabels={inquiryFormLabels}
          />
        ) : (
          <p style={{ color: resolvedBodyColor }}>No form selected.</p>
        )}
      </div>
    </section>
  );
}
