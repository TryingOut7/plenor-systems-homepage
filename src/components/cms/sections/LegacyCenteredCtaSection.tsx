import Link from 'next/link';
import type { SectionRendererProps } from './types';
import { asSectionRecord, isDarkTheme, normalizePath } from './utils';

export default function LegacyCenteredCtaSection({
  section,
  sectionKey,
  sectionStyle,
  theme,
  innerStyle,
  resolvedHeadingColor,
  resolvedBodyColor,
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
      <div style={{ ...innerStyle, maxWidth: '620px', textAlign: 'center' }}>
        <h2
          style={{
            fontFamily: 'var(--ui-font-display)',
            fontSize: 'clamp(26px, 4vw, 38px)',
            fontWeight: 700,
            color: resolvedHeadingColor,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            marginBottom: sectionRecord.body ? '16px' : '0',
          }}
        >
          {String(sectionRecord.heading || '')}
        </h2>

        {sectionRecord.body ? (
          <p
            style={{
              fontSize: '17px',
              color: resolvedBodyColor,
              lineHeight: 1.65,
              marginBottom: sectionRecord.buttonLabel ? '32px' : 0,
            }}
          >
            {String(sectionRecord.body)}
          </p>
        ) : null}

        {typeof sectionRecord.buttonLabel === 'string' && sectionRecord.buttonLabel.trim() ? (
          <Link
            href={normalizePath(String(sectionRecord.buttonHref || '#'))}
            className={isDarkTheme(theme) ? 'btn-ghost' : 'btn-secondary'}
          >
            {sectionRecord.buttonLabel}
          </Link>
        ) : null}

        {typeof sectionRecord.secondaryLinkLabel === 'string' &&
        sectionRecord.secondaryLinkLabel.trim() ? (
          <div style={{ marginTop: '18px' }}>
            <Link
              href={normalizePath(String(sectionRecord.secondaryLinkHref || '#'))}
              style={{
                color: resolvedBodyColor,
                fontSize: '14px',
                textDecoration: 'none',
                fontWeight: 500,
              }}
              className="text-link"
            >
              {sectionRecord.secondaryLinkLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
