import { Resend } from 'resend';
import { escapeHtml } from './sanitize';

// Resend client — instantiated lazily so missing env vars only throw at send time.
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY environment variable is not set.');
  return new Resend(key);
}

const FROM = `${process.env.RESEND_FROM_NAME ?? 'Website'} <${process.env.RESEND_FROM_EMAIL ?? 'noreply@example.com'}>`;
const REPLY_TO = process.env.CONTACT_EMAIL ?? 'contact@example.com';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? 'contact@example.com';
const GUIDE_PDF_URL = process.env.GUIDE_PDF_URL ?? '';
const SITE_URL = (process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SERVER_URL ?? '').replace(/\/$/, '');
const PRIVACY_POLICY_URL = process.env.PRIVACY_POLICY_URL ?? (SITE_URL ? `${SITE_URL}/privacy` : '/privacy');
const GUIDE_PAGE_URL = process.env.GUIDE_PAGE_URL ?? (SITE_URL ? `${SITE_URL}/contact#guide` : '/contact#guide');

// Brand copy — configurable via env vars so changes don't require code edits.
const BRAND_NAME = process.env.RESEND_FROM_NAME ?? 'Website';
const GUIDE_TITLE = process.env.GUIDE_TITLE ?? 'The 7 Most Common Product Development Mistakes — and How to Avoid Them';
const CURRENT_YEAR = new Date().getFullYear();

function siteHostLabel(): string {
  if (!SITE_URL) return 'this website';
  try {
    return new URL(SITE_URL).host;
  } catch {
    return SITE_URL;
  }
}

// Email-safe color palette. CSS variables cannot be used in email HTML (client
// support is near-zero), so colors are centralised here instead.
const C = {
  primary: '#1B2D4F',
  muted:   '#6B7280',
  text:    '#1A1A1A',
  bg:      '#F8F9FA',
  white:   '#ffffff',
  border:  '#E5E7EB',
  error:   '#DC2626',
} as const;

/** Strip CR/LF to prevent email header injection. */
function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]/g, '');
}

// ── Guide delivery email ──────────────────────────────────────────────────────

export interface GuideEmailTemplate {
  subject?: string;
  heading?: string;
  highlightTitle?: string;
  body?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  replyTo?: string;
}

export async function sendGuideEmail({
  name,
  email,
  template,
}: {
  name: string;
  email: string;
  template?: GuideEmailTemplate;
}) {
  const resend = getResend();

  const buttonUrl = template?.buttonUrl || GUIDE_PDF_URL;
  const buttonLabel = template?.buttonLabel || 'Download the guide';

  const pdfLine = buttonUrl
    ? `<p style="margin:0 0 24px;">
         <a href="${buttonUrl}"
            style="display:inline-block;background:${C.primary};color:${C.white};font-weight:700;
                   font-size:15px;padding:12px 24px;border-radius:6px;text-decoration:none;">
           ${escapeHtml(buttonLabel)}
         </a>
       </p>
       <p style="margin:0 0 16px;font-size:13px;color:${C.muted};">
         If the button doesn't work, copy and paste this link into your browser:<br/>
         <a href="${buttonUrl}" style="color:${C.primary};">${buttonUrl}</a>
       </p>`
    : `<p style="margin:0 0 16px;color:${C.error};font-size:14px;">
         <strong>Note:</strong> The guide PDF link has not been configured yet.
         Please contact ${CONTACT_EMAIL} to receive the guide.
       </p>`;

  await resend.emails.send({
    from: FROM,
    to: email,
    replyTo: template?.replyTo || REPLY_TO,
    subject: template?.subject || `Your free guide from ${BRAND_NAME}`,
    html: guideEmailHtml({
      name,
      pdfLine,
      heading: template?.heading,
      highlightTitle: template?.highlightTitle,
      bodyText: template?.body,
    }),
  });
}

function guideEmailHtml({
  name,
  pdfLine,
  heading,
  highlightTitle,
  bodyText,
}: {
  name: string;
  pdfLine: string;
  heading?: string;
  highlightTitle?: string;
  bodyText?: string;
}) {
  const resolvedHeading = heading
    ? escapeHtml(heading).replace(/\{name\}/g, escapeHtml(name))
    : `Here's your guide, ${escapeHtml(name)}.`;

  const bodyBlock = highlightTitle || bodyText
    ? `<p style="margin:0 0 24px;font-size:16px;color:${C.muted};line-height:1.6;">
        ${highlightTitle ? `<strong style="color:${C.text};">${escapeHtml(highlightTitle)}</strong>` : ''}
        ${bodyText ? `${highlightTitle ? '<br/>' : ''}${escapeHtml(bodyText)}` : ''}
       </p>`
    : `<p style="margin:0 0 24px;font-size:16px;color:${C.muted};line-height:1.6;">
        <strong style="color:${C.text};">${escapeHtml(GUIDE_TITLE)}</strong>
        covers the specific errors teams make in Testing &amp; QA and Launch &amp; Go-to-Market,
        and what to do instead.
       </p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Your free guide from ${BRAND_NAME}</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};font-family:system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" style="max-width:560px;background:${C.white};border-radius:8px;border:1px solid ${C.border};">
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:${C.primary};">
                ${BRAND_NAME}
              </p>
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:${C.text};line-height:1.3;">
                ${resolvedHeading}
              </h1>
              ${bodyBlock}
              ${pdfLine}
              <p style="margin:0 0 16px;font-size:15px;color:${C.muted};line-height:1.6;">
                If you have questions about anything in the guide, or want to talk about how the
                framework applies to your product, reply to this email or contact us at
                <a href="mailto:${REPLY_TO}" style="color:${C.primary};">${REPLY_TO}</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;border-top:1px solid ${C.border};margin-top:32px;">
              <p style="margin:0;font-size:13px;color:${C.muted};line-height:1.5;">
                You received this email because you requested the free guide at ${escapeHtml(siteHostLabel())}.
                This is a one-time delivery — you have not been subscribed to any mailing list.
                <br/>
                © ${CURRENT_YEAR} ${BRAND_NAME}.
                <a href="${PRIVACY_POLICY_URL}" style="color:${C.muted};">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Inquiry routing emails ────────────────────────────────────────────────────

export async function sendInquiryEmails({
  name,
  email,
  company,
  challenge,
}: {
  name: string;
  email: string;
  company: string;
  challenge: string;
}) {
  const resend = getResend();

  // 1. Notify primary inbox
  await resend.emails.send({
    from: FROM,
    to: CONTACT_EMAIL,
    replyTo: sanitizeHeaderValue(email),
    subject: sanitizeHeaderValue(`New inquiry from ${name} (${company})`),
    html: inquiryNotificationHtml({ name, email, company, challenge }),
  });

  // 2. Acknowledgment to visitor
  await resend.emails.send({
    from: FROM,
    to: email,
    replyTo: REPLY_TO,
    subject: `We received your inquiry — ${BRAND_NAME}`,
    html: inquiryAckHtml({ name }),
  });
}

function inquiryNotificationHtml({
  name,
  email,
  company,
  challenge,
}: {
  name: string;
  email: string;
  company: string;
  challenge: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>New inquiry</title></head>
<body style="margin:0;padding:32px;font-family:system-ui,-apple-system,sans-serif;background:${C.bg};">
  <table role="presentation" width="100%" style="max-width:560px;background:${C.white};border-radius:8px;border:1px solid ${C.border};padding:32px;">
    <tr><td>
      <h1 style="margin:0 0 24px;font-size:20px;font-weight:700;color:${C.primary};">New inquiry</h1>
      <table role="presentation" width="100%" style="border-collapse:collapse;">
        ${row('Name', escapeHtml(name))}
        ${row('Email', `<a href="mailto:${escapeHtml(email)}" style="color:${C.primary};">${escapeHtml(email)}</a>`)}
        ${row('Company', escapeHtml(company))}
        ${row('Challenge', escapeHtml(challenge).replace(/\n/g, '<br/>'))}
      </table>
      <p style="margin:24px 0 0;font-size:13px;color:${C.muted};">
        Submitted: ${new Date().toUTCString()}
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 0;font-size:14px;font-weight:600;color:${C.text};width:100px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;font-size:14px;color:${C.muted};line-height:1.5;">${value}</td>
  </tr>`;
}

function inquiryAckHtml({ name }: { name: string }) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>We received your inquiry</title></head>
<body style="margin:0;padding:0;background:${C.bg};font-family:system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" style="max-width:560px;background:${C.white};border-radius:8px;border:1px solid ${C.border};">
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:${C.primary};">
                ${BRAND_NAME}
              </p>
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:${C.text};line-height:1.3;">
                We received your inquiry, ${escapeHtml(name)}.
              </h1>
              <p style="margin:0 0 16px;font-size:16px;color:${C.muted};line-height:1.6;">
                We review every inquiry and respond within 2 business days with initial thoughts
                or a proposal request.
              </p>
              <p style="margin:0 0 16px;font-size:16px;color:${C.muted};line-height:1.6;">
                In the meantime, if you haven't already, the free guide covers the specific
                mistakes the framework is designed to prevent:
              </p>
              <p style="margin:0 0 24px;">
                <a href="${GUIDE_PAGE_URL}"
                   style="display:inline-block;background:${C.primary};color:${C.white};font-weight:700;
                          font-size:15px;padding:12px 24px;border-radius:6px;text-decoration:none;">
                  Get the free guide
                </a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;border-top:1px solid ${C.border};">
              <p style="margin:0;font-size:13px;color:${C.muted};line-height:1.5;">
                © ${CURRENT_YEAR} ${BRAND_NAME}.
                <a href="${PRIVACY_POLICY_URL}" style="color:${C.muted};">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

