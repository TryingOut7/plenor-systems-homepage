import type { Metadata } from 'next';
import Link from 'next/link';
import RichText from '@/components/cms/RichText';
import SectionHeading from '@/components/cms/sections/shared/SectionHeading';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { getSitePageBySlug, getSiteSettings } from '@/payload/cms';
import { buildSitePageMetadata } from '@/lib/page-metadata';
import { resolveContactEmail, resolveSiteName } from '@/lib/site-config';
import { getCmsReadOptions } from '@/lib/cms-read-options';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const cmsReadOptions = await getCmsReadOptions();
  const [sitePage, settings] = await Promise.all([
    getSitePageBySlug('privacy', cmsReadOptions),
    getSiteSettings(cmsReadOptions),
  ]);
  return buildSitePageMetadata({
    slug: 'privacy',
    page: sitePage,
    settings,
    fallbackTitle: 'Privacy Policy | Plenor Systems',
    fallbackDescription: 'Review how Plenor Systems handles information submitted through its website and contact form.',
    forceFallback: true,
  });
}

const bodyText: React.CSSProperties = {
  fontSize: '16px',
  color: 'var(--ui-color-text-muted)',
  lineHeight: 1.7,
  margin: 0,
};
const h2Style: React.CSSProperties = {
  fontSize: '24px',
  color: 'var(--ui-color-primary)',
  marginBottom: '12px',
  marginTop: '40px',
};

export default async function PrivacyPage() {
  const cmsReadOptions = await getCmsReadOptions();
  const settings = await getSiteSettings(cmsReadOptions);

  const siteName = resolveSiteName(settings);
  const contactEmail = resolveContactEmail(settings);
  const lastUpdated =
    settings?.privacyLastUpdated ||
    'August 4, 2026';
  const cmsContent = settings?.privacyPolicy ?? null;

  return (
    <section aria-labelledby="privacy-heading" style={{ padding: '64px 24px', backgroundColor: '#ffffff' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <SectionHeading
          tag="h1"
          id="privacy-heading"
          style={{
            fontSize: 'clamp(30px, 5vw, 40px)',
            color: 'var(--ui-color-primary)',
            marginTop: 0,
            marginBottom: '8px',
          }}
        >
          Privacy Policy
        </SectionHeading>
        <p style={{ ...bodyText, marginBottom: '8px' }}>
          <strong style={{ color: 'var(--ui-color-text)' }}>{siteName}</strong>
        </p>
        <p style={{ ...bodyText, marginBottom: '32px' }}>
          Effective date: {lastUpdated}
        </p>

        {cmsContent ? (
          <RichText
            data={cmsContent as SerializedEditorState}
            style={{ color: 'var(--ui-color-text-muted)', lineHeight: 1.7 }}
          />
        ) : (
          <>
            <p style={bodyText}>
              {siteName} respects your privacy. This policy explains how information submitted through
              the Plenor website is collected, used, and handled.
            </p>

            <SectionHeading tag="h2" style={h2Style}>Information We Collect</SectionHeading>
            <p style={bodyText}>
              We may collect information submitted through the contact form or by email, including
              your name, business email address, company name, and inquiry details.
            </p>
            <p style={{ ...bodyText, marginTop: '12px' }}>
              We may also collect limited technical information needed to operate, maintain, and secure
              the website.
            </p>

            <SectionHeading tag="h2" style={h2Style}>How We Use Information</SectionHeading>
            <p style={{ ...bodyText, marginBottom: '12px' }}>We may use information to:</p>
            <ul style={{ ...bodyText, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Respond to inquiries</li>
              <li>Evaluate potential engagements</li>
              <li>Communicate about Plenor services</li>
              <li>Operate and secure the website</li>
              <li>Meet legal obligations</li>
            </ul>

            <SectionHeading tag="h2" style={h2Style}>How We Share Information</SectionHeading>
            <p style={bodyText}>
              We may share information with service providers that support hosting, email, form
              processing, or related technical operations.
            </p>
            <p style={{ ...bodyText, marginTop: '12px' }}>
              We may also disclose information when required by law. Plenor does not sell personal
              information.
            </p>

            <SectionHeading tag="h2" style={h2Style}>Data Security</SectionHeading>
            <p style={bodyText}>
              We use reasonable measures to protect the information we receive. No website or electronic
              system can be guaranteed to be completely secure.
            </p>

            <SectionHeading tag="h2" style={h2Style}>Your Information</SectionHeading>
            <p style={bodyText}>
              You may contact us to request access to, correction of, or deletion of personal information
              you submitted, subject to applicable legal requirements.
            </p>

            <SectionHeading tag="h2" style={h2Style}>Changes to This Policy</SectionHeading>
            <p style={bodyText}>
              We may update this policy when our website or information-handling practices change. The
              effective date identifies the latest version.
            </p>

            <SectionHeading tag="h2" style={h2Style}>Contact</SectionHeading>
            <p style={bodyText}>
              Questions may be sent to{' '}
              <a
                href={`mailto:${contactEmail}`}
                style={{ color: 'var(--ui-color-primary)', textDecoration: 'underline' }}
              >
                {contactEmail}
              </a>
              .
            </p>
          </>
        )}

        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--ui-color-border)' }}>
          <Link href="/" style={{ color: 'var(--ui-color-text-muted)', fontSize: '14px', textDecoration: 'underline' }}>
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
