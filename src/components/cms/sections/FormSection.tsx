import FormRenderer from '@/components/cms/FormRenderer';
import SectionHeading from './shared/SectionHeading';
import type { SectionRendererProps } from './types';
import { asSectionRecord, formRelationshipToId } from './utils';

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
  const formAlias =
    !formId &&
    (sectionRecord.formAlias === 'guide' || sectionRecord.formAlias === 'inquiry')
      ? (sectionRecord.formAlias as 'guide' | 'inquiry')
      : undefined;

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

        {formId || formAlias ? (
          <FormRenderer
            formId={formId}
            resolveAlias={formAlias}
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
