import FormRenderer from '@/components/cms/FormRenderer';
import SectionHeading from './shared/SectionHeading';
import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

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
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const formId =
    sectionRecord.form && typeof sectionRecord.form === 'object'
      ? String((sectionRecord.form as { id?: string }).id || '')
      : typeof sectionRecord.form === 'string'
        ? sectionRecord.form
        : '';

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
          />
        ) : (
          <p style={{ color: resolvedBodyColor }}>No form selected.</p>
        )}
      </div>
    </section>
  );
}
