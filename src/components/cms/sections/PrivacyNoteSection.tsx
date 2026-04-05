import Link from 'next/link';
import type { SectionRendererProps } from './types';
import { asSectionRecord, normalizePath } from './utils';

export default function PrivacyNoteSection({
  section,
  sectionKey,
  sectionStyle,
  innerStyle,
  resolvedMutedColor,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const policyHref =
    typeof sectionRecord.policyLinkHref === 'string' && sectionRecord.policyLinkHref.trim()
      ? normalizePath(sectionRecord.policyLinkHref.trim())
      : '/privacy';

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
      <div style={{ ...innerStyle, maxWidth: '860px' }}>
        <p style={{ color: resolvedMutedColor, fontSize: '13px', margin: 0, textAlign: 'center' }}>
          {String(sectionRecord.label || 'By submitting this form, you agree to our')}{' '}
          <Link href={policyHref} style={{ color: resolvedMutedColor, textDecoration: 'underline' }}>
            {String(sectionRecord.policyLinkLabel || 'Privacy Policy')}
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
