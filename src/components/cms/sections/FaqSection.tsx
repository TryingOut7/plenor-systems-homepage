import SectionHeading from './shared/SectionHeading';
import FaqAccordion from './shared/FaqAccordion';
import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';
import { stripTags } from '@/lib/sanitize';

function sanitizeFaqText(value: string): string {
  return stripTags(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}

export default function FaqSection({
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
  const rawItems = Array.isArray(sectionRecord.items) ? sectionRecord.items : [];
  const faqItems = rawItems.map((item: unknown) => {
    const i = item as { question?: string; answer?: string };
    return { question: String(i.question || ''), answer: String(i.answer || '') };
  });

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: sanitizeFaqText(item.question),
      acceptedAnswer: { '@type': 'Answer', text: sanitizeFaqText(item.answer) },
    })),
  };

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div style={{ ...innerStyle, maxWidth: '800px' }}>
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

        <FaqAccordion items={faqItems} theme={theme} />
      </div>
    </section>
  );
}
