import Link from 'next/link';
import SectionHeading from './shared/SectionHeading';
import type { SectionRendererProps } from './types';
import { asSectionRecord, normalizePath } from './utils';

export default function CtaSection({
  section,
  sectionKey,
  sectionStyle,
  theme,
  hTag,
  hSize,
  hFontSize,
  innerStyle,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);

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
      <div style={{ ...innerStyle, maxWidth: '700px', textAlign: 'center' }}>
        {typeof sectionRecord.sectionLabel === 'string' && sectionRecord.sectionLabel ? (
          <p
            className="section-label"
            style={{
              color:
                theme === 'white' || theme === 'light'
                  ? 'var(--ui-color-text-muted)'
                  : 'var(--ui-color-dark-text-muted)',
              marginBottom: '12px',
            }}
          >
            {sectionRecord.sectionLabel}
          </p>
        ) : null}

        {sectionRecord.heading ? (
          <SectionHeading
            tag={hTag}
            style={{
              fontFamily: 'var(--ui-font-display)',
              fontSize: hSize === 'md' ? 'clamp(26px, 4vw, 40px)' : hFontSize,
              color:
                theme === 'white' || theme === 'light'
                  ? 'var(--ui-color-primary)'
                  : 'var(--ui-color-dark-text)',
              marginBottom: '16px',
            }}
          >
            {String(sectionRecord.heading)}
          </SectionHeading>
        ) : null}
        {sectionRecord.body ? (
          <p
            style={{
              color:
                theme === 'white' || theme === 'light'
                  ? 'var(--ui-color-text-muted)'
                  : 'var(--ui-color-dark-text-muted)',
              marginBottom: sectionRecord.buttonLabel ? '24px' : 0,
            }}
          >
            {String(sectionRecord.body)}
          </p>
        ) : null}
        {sectionRecord.buttonLabel ? (
          <Link
            className={theme === 'white' || theme === 'light' ? 'btn-primary' : 'btn-ghost'}
            href={normalizePath(String(sectionRecord.buttonHref || '#'))}
          >
            {String(sectionRecord.buttonLabel)}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
