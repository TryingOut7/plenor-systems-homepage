import type { ReactNode } from 'react';
import Image from 'next/image';
import RichText from '@/components/cms/RichText';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { getOrgSponsorsGlobal } from '@/lib/org-site-feed';
import { getCmsReadOptions } from '@/lib/cms-read-options';
import { extractMediaAsset } from '@/lib/org-site-helpers';
import type { SectionRendererProps } from './types';
import { asSectionRecord } from './utils';

type DisplayOrderKey =
  | 'support_summary'
  | 'sponsor_acknowledgment'
  | 'donation_instructions'
  | 'payment_instructions'
  | 'sponsor_logos'
  | 'support_faq'
  | 'featured_supporter_text';

const DEFAULT_SECTION_ORDER: DisplayOrderKey[] = [
  'support_summary',
  'sponsor_acknowledgment',
  'donation_instructions',
  'payment_instructions',
  'sponsor_logos',
  'support_faq',
  'featured_supporter_text',
];

function normalizeDisplayOrder(value: unknown): DisplayOrderKey[] {
  if (!Array.isArray(value) || value.length === 0) return DEFAULT_SECTION_ORDER;

  const valid = new Set<DisplayOrderKey>(DEFAULT_SECTION_ORDER);
  const seen = new Set<DisplayOrderKey>();
  const ordered: DisplayOrderKey[] = [];

  for (const entry of value) {
    if (!valid.has(entry as DisplayOrderKey)) continue;
    const key = entry as DisplayOrderKey;
    if (seen.has(key)) continue;
    seen.add(key);
    ordered.push(key);
  }

  const missing = DEFAULT_SECTION_ORDER.filter((key) => !seen.has(key));
  return [...ordered, ...missing];
}

async function OrgSponsorsSectionServer({
  section,
  sectionKey,
  sectionStyle,
  innerStyle,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);

  const cmsReadOptions = await getCmsReadOptions();
  const sponsors = await getOrgSponsorsGlobal(cmsReadOptions);
  if (!sponsors) return null;

  const zelleQr = extractMediaAsset(sponsors.zelleQrCode);
  const venmoQr = extractMediaAsset(sponsors.venmoQrCode);
  const displayOrder = normalizeDisplayOrder(sponsors.displayOrder);

  const sectionRenderers: Record<DisplayOrderKey, ReactNode | null> = {
    support_summary: sponsors.supportSummary ? (
      <section key="support_summary" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '10px' }}>Support Summary</h2>
        <RichText data={sponsors.supportSummary as SerializedEditorState} />
      </section>
    ) : null,
    sponsor_acknowledgment: sponsors.sponsorAcknowledgmentContent ? (
      <section key="sponsor_acknowledgment" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '10px' }}>Sponsor Acknowledgment</h2>
        <RichText data={sponsors.sponsorAcknowledgmentContent as SerializedEditorState} />
      </section>
    ) : null,
    donation_instructions: sponsors.donationInstructions ? (
      <section key="donation_instructions" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '10px' }}>Donation Instructions</h2>
        <RichText data={sponsors.donationInstructions as SerializedEditorState} />
      </section>
    ) : null,
    payment_instructions: (
      <section key="payment_instructions" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '10px' }}>Payment Instructions</h2>
        {sponsors.paymentInstructionsContent ? (
          <RichText data={sponsors.paymentInstructionsContent as SerializedEditorState} />
        ) : (
          <p style={{ color: 'var(--ui-color-text-muted)' }}>
            Payment instructions have not been published yet.
          </p>
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginTop: '12px',
          }}
        >
          <div>
            <p className="section-label" style={{ marginBottom: '8px' }}>
              Zelle
            </p>
            {zelleQr?.url ? (
              <Image
                src={zelleQr.url}
                alt={zelleQr.alt || 'Zelle QR code'}
                width={zelleQr.width || 500}
                height={zelleQr.height || 500}
                style={{
                  width: '100%',
                  maxWidth: '260px',
                  height: 'auto',
                  aspectRatio: '1 / 1',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid var(--ui-color-border)',
                }}
              />
            ) : (
              <Image
                src="/media/qa-media-1.svg"
                alt="Zelle QR placeholder"
                width={260}
                height={260}
                style={{
                  width: '100%',
                  maxWidth: '260px',
                  height: 'auto',
                  aspectRatio: '1 / 1',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  border: '1px solid var(--ui-color-border)',
                  backgroundColor: 'var(--ui-color-section-alt)',
                }}
              />
            )}
          </div>
          <div>
            <p className="section-label" style={{ marginBottom: '8px' }}>
              Venmo
            </p>
            {venmoQr?.url ? (
              <Image
                src={venmoQr.url}
                alt={venmoQr.alt || 'Venmo QR code'}
                width={venmoQr.width || 500}
                height={venmoQr.height || 500}
                style={{
                  width: '100%',
                  maxWidth: '260px',
                  height: 'auto',
                  aspectRatio: '1 / 1',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid var(--ui-color-border)',
                }}
              />
            ) : (
              <Image
                src="/media/qa-media-2.svg"
                alt="Venmo QR placeholder"
                width={260}
                height={260}
                style={{
                  width: '100%',
                  maxWidth: '260px',
                  height: 'auto',
                  aspectRatio: '1 / 1',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  border: '1px solid var(--ui-color-border)',
                  backgroundColor: 'var(--ui-color-section-alt)',
                }}
              />
            )}
          </div>
        </div>
      </section>
    ),
    sponsor_logos:
      Array.isArray(sponsors.sponsorLogos) && sponsors.sponsorLogos.length > 0 ? (
        <section key="sponsor_logos" style={{ marginBottom: '24px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '10px' }}>Sponsor Logos</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            {sponsors.sponsorLogos.map((logo) => {
              const media = extractMediaAsset(logo.logo);
              if (!media?.url) return null;
              return (
                <div
                  key={`${media.url}-${logo.id || ''}`}
                  style={{
                    border: '1px solid var(--ui-color-border)',
                    borderRadius: '10px',
                    padding: '10px',
                    backgroundColor: 'var(--ui-color-surface)',
                  }}
                >
                  <Image
                    src={media.url}
                    alt={media.alt || logo.label || 'Sponsor logo'}
                    width={media.width || 500}
                    height={media.height || 500}
                    style={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'contain',
                      maxHeight: '120px',
                    }}
                  />
                  {logo.label ? (
                    <p
                      style={{ margin: '8px 0 0', fontSize: '14px', color: 'var(--ui-color-text-muted)' }}
                    >
                      {logo.label}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null,
    support_faq:
      Array.isArray(sponsors.supportFaq) && sponsors.supportFaq.length > 0 ? (
        <section key="support_faq" style={{ marginBottom: '24px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '10px' }}>Support FAQ</h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            {sponsors.supportFaq.map((faq) => (
              <details
                key={faq.id || faq.question}
                style={{
                  border: '1px solid var(--ui-color-border)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{faq.question}</summary>
                <p style={{ marginBottom: 0, color: 'var(--ui-color-text-muted)' }}>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null,
    featured_supporter_text: sponsors.featuredSupporterText ? (
      <section key="featured_supporter_text" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '10px' }}>Featured Supporter</h2>
        <RichText data={sponsors.featuredSupporterText as SerializedEditorState} />
      </section>
    ) : null,
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
      <div style={{ ...innerStyle, maxWidth: '980px' }}>
        <p className="section-label" style={{ marginBottom: '10px' }}>
          Sponsors
        </p>
        <h1 style={{ marginTop: 0, marginBottom: '14px', fontSize: 'clamp(34px, 5vw, 54px)' }}>
          {sponsors.pageTitle}
        </h1>

        {displayOrder.map((key) => sectionRenderers[key])}

        {sponsors.supportContactPath ? (
          <p style={{ marginTop: '16px' }}>
            <strong>Support contact:</strong>{' '}
            <a href={sponsors.supportContactPath}>{sponsors.supportContactPath}</a>
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default function OrgSponsorsSection(props: SectionRendererProps) {
  return <OrgSponsorsSectionServer {...props} />;
}
