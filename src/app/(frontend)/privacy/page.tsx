import type { Metadata } from 'next';
import Link from 'next/link';
import RichText from '@/components/cms/RichText';
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
  const siteName = resolveSiteName(settings);
  return buildSitePageMetadata({
    slug: 'privacy',
    page: sitePage,
    settings,
    fallbackTitle: 'Privacy Policy',
    fallbackDescription: `Privacy Policy for ${siteName} — how we collect, use, and protect your data.`,
    fallbackNoindex: true,
    fallbackNofollow: true,
  });
}

const bodyText: React.CSSProperties = { fontSize: '16px', color: '#6B7280', lineHeight: 1.7, margin: 0 };
const h2Style: React.CSSProperties = { fontSize: '20px', fontWeight: 700, color: '#1B2D4F', marginBottom: '12px', marginTop: '40px' };

export default async function PrivacyPage() {
  const cmsReadOptions = await getCmsReadOptions();
  const settings = await getSiteSettings(cmsReadOptions);

  const siteName = resolveSiteName(settings);
  const contactEmail = resolveContactEmail(settings);
  const lastUpdated =
    settings?.privacyLastUpdated ||
    new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const cmsContent = settings?.privacyPolicy ?? null;

  return (
    <section aria-labelledby="privacy-heading" style={{ padding: '80px 24px', backgroundColor: '#ffffff' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <h1
          id="privacy-heading"
          style={{ fontSize: 'clamp(30px, 5vw, 40px)', fontWeight: 700, color: '#1B2D4F', marginBottom: '8px' }}
        >
          Privacy Policy
        </h1>
        <p style={{ ...bodyText, marginBottom: '8px' }}>
          <strong style={{ color: '#1A1A1A' }}>{siteName}</strong>
        </p>
        <p style={{ ...bodyText, marginBottom: '32px' }}>
          Last updated: {lastUpdated}
        </p>

        {cmsContent ? (
          <RichText data={cmsContent as SerializedEditorState} style={{ color: '#6B7280', lineHeight: 1.7 }} />
        ) : (
          <>
            <p style={bodyText}>
              This Privacy Policy explains how {siteName} collects, uses, and protects information
              you provide through this website.
            </p>

            <h2 style={h2Style}>1. Data we collect</h2>
            <p style={{ ...bodyText, marginBottom: '12px' }}>
              We collect personal data only when you submit one of the two forms on this website:
            </p>
            <ul style={{ ...bodyText, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong style={{ color: '#1A1A1A' }}>Free guide form:</strong> your name and email
                address.
              </li>
              <li>
                <strong style={{ color: '#1A1A1A' }}>Direct inquiry form:</strong> your name, email
                address, company name, and a description of your product and challenge.
              </li>
            </ul>
            <p style={{ ...bodyText, marginTop: '12px' }}>
              We do not collect any other personal information. We do not use cookies for tracking
              before you give consent. If analytics is active, page views and form submission events may
              be tracked after you accept the cookie consent notice.
            </p>

            <h2 style={h2Style}>2. How we use your data</h2>
            <ul style={{ ...bodyText, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong style={{ color: '#1A1A1A' }}>Free guide submissions:</strong> your name and
                email are used solely to deliver the PDF guide to you by automated email. You are not
                added to any mailing list. We will not send you marketing emails without a separate
                explicit opt-in.
              </li>
              <li>
                <strong style={{ color: '#1A1A1A' }}>Inquiry submissions:</strong> your information is
                used to respond to your inquiry and, where relevant, to prepare a proposal. It is
                shared with no third parties beyond the transactional email provider used to route the
                message.
              </li>
            </ul>

            <h2 style={h2Style}>3. Data retention</h2>
            <p style={bodyText}>
              Submissions are retained for a maximum of 12 months from the date of submission. After
              this period, records are deleted. You may request earlier deletion at any time (see
              Section 5).
            </p>

            <h2 style={h2Style}>4. Cookies and analytics</h2>
            <p style={bodyText}>
              If analytics is active on this site, it uses cookies to track page views and form
              submission events. No cookies are set and no data is collected before you give consent via
              the cookie consent banner. You may decline consent at any time using the banner. Declining
              does not affect your ability to use any feature of this website.
            </p>

            <h2 style={h2Style}>5. Your rights</h2>
            <p style={{ ...bodyText, marginBottom: '12px' }}>You have the right to:</p>
            <ul style={{ ...bodyText, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Request access to the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
            </ul>
            <p style={{ ...bodyText, marginTop: '12px' }}>
              Deletion requests are fulfilled within 30 days. To exercise any of these rights, contact
              us at the address in Section 6.
            </p>

            <h2 style={h2Style}>6. Contact</h2>
            <p style={bodyText}>
              For data-related queries, contact us at{' '}
              <a
                href={`mailto:${contactEmail}`}
                style={{ color: '#1B2D4F', textDecoration: 'underline' }}
              >
                {contactEmail}
              </a>
              .
            </p>
          </>
        )}

        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #E5E7EB' }}>
          <Link href="/" style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'underline' }}>
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
