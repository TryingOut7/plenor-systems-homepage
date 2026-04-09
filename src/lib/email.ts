import { Resend } from 'resend';
import { getRegistrationStatusMessage } from '@/domain/org-site/registrationStatusCopy';
import { getPayload } from '@/payload/client';
import type { SiteSettings, UISettings } from '@/payload/cms';
import type { RegistrationStatus } from '@plenor/contracts/forms';
import { resolveSiteUrl } from './site-config';
import { escapeHtml } from './sanitize';

// Resend client — instantiated lazily so missing env vars only throw at send time.
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY environment variable is not set.');
  return new Resend(key);
}

const FROM = `${process.env.RESEND_FROM_NAME ?? 'Website'} <${process.env.RESEND_FROM_EMAIL ?? 'noreply@example.com'}>`;
const CURRENT_YEAR = new Date().getFullYear();

const DEFAULT_GUIDE_TITLE = 'The 7 Most Common Product Development Mistakes — and How to Avoid Them';
const DEFAULT_EMAIL_BRAND = process.env.RESEND_FROM_NAME ?? 'Website';
const DEFAULT_CONTACT_EMAIL = 'contact@example.com';
const DEFAULT_GUIDE_BODY =
  'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead.';
const DEFAULT_GUIDE_SUBJECT = 'Your free guide from {brandName}';
const DEFAULT_GUIDE_HEADING = "Here's your guide, {name}.";
const DEFAULT_GUIDE_BUTTON_LABEL = 'Download the guide';
const DEFAULT_INQUIRY_NOTIFICATION_SUBJECT = 'New inquiry from {name} ({company})';
const DEFAULT_INQUIRY_ACK_SUBJECT = 'We received your inquiry — {brandName}';
const DEFAULT_INQUIRY_ACK_HEADING = 'We received your inquiry, {name}.';
const DEFAULT_INQUIRY_ACK_BODY =
  'We review every inquiry and respond within 2 business days with initial thoughts or a proposal request.';
const REGISTRATION_EMAIL_SUBJECT_PREFIX = 'Registration Update';

type EmailPalette = {
  primary: string;
  muted: string;
  text: string;
  background: string;
  white: string;
  border: string;
  error: string;
};

type EmailRuntimeConfig = {
  siteUrl: string;
  brandName: string;
  contactEmail: string;
  replyTo: string;
  guideTitle: string;
  guidePdfUrl: string;
  guidePageUrl: string;
  privacyPolicyUrl: string;
  guideSubject: string;
  guideHeading: string;
  guideBody: string;
  guideButtonLabel: string;
  inquiryNotificationSubject: string;
  inquiryAckSubject: string;
  inquiryAckHeading: string;
  inquiryAckBody: string;
  palette: EmailPalette;
};

const DEFAULT_PALETTE: EmailPalette = {
  primary: '#1B2D4F',
  muted: '#6B7280',
  text: '#1A1A1A',
  background: '#F8F9FA',
  white: '#FFFFFF',
  border: '#E5E7EB',
  error: '#DC2626',
};

const EMAIL_SETTINGS_CACHE_TTL_MS = 30_000;
let runtimeConfigCache: { expiresAt: number; value: EmailRuntimeConfig } | null = null;

function readTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function applyTemplate(template: string, variables: Record<string, string>): string {
  return Object.entries(variables).reduce((result, [key, value]) => {
    return result.replaceAll(`{${key}}`, value);
  }, template);
}

function resolveUrlLike(value: string, siteUrl: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) return siteUrl ? `${siteUrl}${trimmed}` : trimmed;
  return trimmed;
}

function buildFallbackRuntimeConfig(): EmailRuntimeConfig {
  const envSiteUrl = (process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SERVER_URL ?? '').replace(/\/$/, '');
  const privacyFromEnv = readTrimmedString(process.env.PRIVACY_POLICY_URL);
  const guidePageFromEnv = readTrimmedString(process.env.GUIDE_PAGE_URL);
  const guidePdfFromEnv = readTrimmedString(process.env.GUIDE_PDF_URL);

  return {
    siteUrl: envSiteUrl,
    brandName: DEFAULT_EMAIL_BRAND,
    contactEmail: DEFAULT_CONTACT_EMAIL,
    replyTo: DEFAULT_CONTACT_EMAIL,
    guideTitle: readTrimmedString(process.env.GUIDE_TITLE) || DEFAULT_GUIDE_TITLE,
    guidePdfUrl: resolveUrlLike(guidePdfFromEnv, envSiteUrl),
    guidePageUrl: resolveUrlLike(guidePageFromEnv || '/contact#guide', envSiteUrl),
    privacyPolicyUrl: resolveUrlLike(privacyFromEnv || '/privacy', envSiteUrl),
    guideSubject: DEFAULT_GUIDE_SUBJECT,
    guideHeading: DEFAULT_GUIDE_HEADING,
    guideBody: DEFAULT_GUIDE_BODY,
    guideButtonLabel: DEFAULT_GUIDE_BUTTON_LABEL,
    inquiryNotificationSubject: DEFAULT_INQUIRY_NOTIFICATION_SUBJECT,
    inquiryAckSubject: DEFAULT_INQUIRY_ACK_SUBJECT,
    inquiryAckHeading: DEFAULT_INQUIRY_ACK_HEADING,
    inquiryAckBody: DEFAULT_INQUIRY_ACK_BODY,
    palette: DEFAULT_PALETTE,
  };
}

async function loadRuntimeConfigFromCms(): Promise<Partial<EmailRuntimeConfig>> {
  const payload = await getPayload();
  const [siteSettingsRaw, uiSettingsRaw] = await Promise.all([
    payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
      overrideAccess: true,
    }),
    payload.findGlobal({
      slug: 'ui-settings',
      depth: 0,
      overrideAccess: true,
    }),
  ]);

  const siteSettings = (siteSettingsRaw as SiteSettings | null) ?? null;
  const uiSettings = (uiSettingsRaw as UISettings | null) ?? null;
  const routing = siteSettings?.contentRouting;
  const emailDefaults = siteSettings?.emailDefaults;
  const siteUrl = resolveSiteUrl(siteSettings);

  const contactEmail = readTrimmedString(siteSettings?.contactEmail) || DEFAULT_CONTACT_EMAIL;
  const brandName =
    readTrimmedString(emailDefaults?.brandName) ||
    readTrimmedString(siteSettings?.siteName) ||
    DEFAULT_EMAIL_BRAND;

  const nextPalette = uiSettings?.emailPalette ?? {};
  const palette: EmailPalette = {
    primary: readTrimmedString(nextPalette.primary) || DEFAULT_PALETTE.primary,
    muted: readTrimmedString(nextPalette.muted) || DEFAULT_PALETTE.muted,
    text: readTrimmedString(nextPalette.text) || DEFAULT_PALETTE.text,
    background: readTrimmedString(nextPalette.background) || DEFAULT_PALETTE.background,
    white: readTrimmedString(nextPalette.white) || DEFAULT_PALETTE.white,
    border: readTrimmedString(nextPalette.border) || DEFAULT_PALETTE.border,
    error: readTrimmedString(nextPalette.error) || DEFAULT_PALETTE.error,
  };

  return {
    siteUrl,
    brandName,
    contactEmail,
    replyTo: contactEmail,
    guideTitle: readTrimmedString(routing?.guideTitle) || DEFAULT_GUIDE_TITLE,
    guidePdfUrl: resolveUrlLike(readTrimmedString(routing?.guidePdfUrl), siteUrl),
    guidePageUrl: resolveUrlLike(readTrimmedString(routing?.guidePageUrl) || '/contact#guide', siteUrl),
    privacyPolicyUrl: resolveUrlLike(readTrimmedString(routing?.privacyPolicyUrl) || '/privacy', siteUrl),
    guideSubject: readTrimmedString(emailDefaults?.guideSubject) || DEFAULT_GUIDE_SUBJECT,
    guideHeading: readTrimmedString(emailDefaults?.guideHeading) || DEFAULT_GUIDE_HEADING,
    guideBody: readTrimmedString(emailDefaults?.guideBody) || DEFAULT_GUIDE_BODY,
    guideButtonLabel: readTrimmedString(emailDefaults?.guideButtonLabel) || DEFAULT_GUIDE_BUTTON_LABEL,
    inquiryNotificationSubject:
      readTrimmedString(emailDefaults?.inquiryNotificationSubject) || DEFAULT_INQUIRY_NOTIFICATION_SUBJECT,
    inquiryAckSubject: readTrimmedString(emailDefaults?.inquiryAckSubject) || DEFAULT_INQUIRY_ACK_SUBJECT,
    inquiryAckHeading: readTrimmedString(emailDefaults?.inquiryAckHeading) || DEFAULT_INQUIRY_ACK_HEADING,
    inquiryAckBody: readTrimmedString(emailDefaults?.inquiryAckBody) || DEFAULT_INQUIRY_ACK_BODY,
    palette,
  };
}

async function getRuntimeConfig(): Promise<EmailRuntimeConfig> {
  if (runtimeConfigCache && runtimeConfigCache.expiresAt > Date.now()) {
    return runtimeConfigCache.value;
  }

  const fallback = buildFallbackRuntimeConfig();
  try {
    const cms = await loadRuntimeConfigFromCms();
    const merged: EmailRuntimeConfig = {
      ...fallback,
      ...cms,
      palette: {
        ...fallback.palette,
        ...(cms.palette || {}),
      },
    };
    runtimeConfigCache = { value: merged, expiresAt: Date.now() + EMAIL_SETTINGS_CACHE_TTL_MS };
    return merged;
  } catch {
    runtimeConfigCache = { value: fallback, expiresAt: Date.now() + EMAIL_SETTINGS_CACHE_TTL_MS };
    return fallback;
  }
}

function siteHostLabel(siteUrl: string): string {
  if (!siteUrl) return 'this website';
  try {
    return new URL(siteUrl).host;
  } catch {
    return siteUrl;
  }
}

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
  const config = await getRuntimeConfig();

  const buttonUrl = resolveUrlLike(template?.buttonUrl || config.guidePdfUrl, config.siteUrl);
  const buttonLabel = template?.buttonLabel || config.guideButtonLabel;
  const C = config.palette;

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
         Please contact ${config.contactEmail} to receive the guide.
       </p>`;

  await resend.emails.send({
    from: FROM,
    to: email,
    replyTo: template?.replyTo || config.replyTo,
    subject:
      template?.subject ||
      sanitizeHeaderValue(
        applyTemplate(config.guideSubject, {
          brandName: config.brandName,
          name,
          company: '',
        }),
      ),
    html: guideEmailHtml({
      name,
      pdfLine,
      heading: template?.heading,
      highlightTitle: template?.highlightTitle,
      bodyText: template?.body,
      config,
    }),
  });
}

function guideEmailHtml({
  name,
  pdfLine,
  heading,
  highlightTitle,
  bodyText,
  config,
}: {
  name: string;
  pdfLine: string;
  heading?: string;
  highlightTitle?: string;
  bodyText?: string;
  config: EmailRuntimeConfig;
}) {
  const C = config.palette;
  const resolvedHeading = heading
    ? escapeHtml(
      applyTemplate(heading, { name, brandName: config.brandName, company: '' }),
    )
    : escapeHtml(
      applyTemplate(config.guideHeading, {
        name,
        brandName: config.brandName,
        company: '',
      }),
    );

  const bodyBlock = highlightTitle || bodyText
    ? `<p style="margin:0 0 24px;font-size:16px;color:${C.muted};line-height:1.6;">
        ${highlightTitle ? `<strong style="color:${C.text};">${escapeHtml(highlightTitle)}</strong>` : ''}
        ${bodyText ? `${highlightTitle ? '<br/>' : ''}${escapeHtml(bodyText)}` : ''}
       </p>`
    : `<p style="margin:0 0 24px;font-size:16px;color:${C.muted};line-height:1.6;">
        <strong style="color:${C.text};">${escapeHtml(config.guideTitle)}</strong>
        ${escapeHtml(config.guideBody)}
       </p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${escapeHtml(applyTemplate(config.guideSubject, { name, brandName: config.brandName, company: '' }))}</title>
</head>
<body style="margin:0;padding:0;background:${C.background};font-family:system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.background};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" style="max-width:560px;background:${C.white};border-radius:8px;border:1px solid ${C.border};">
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:${C.primary};">
                ${escapeHtml(config.brandName)}
              </p>
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:${C.text};line-height:1.3;">
                ${resolvedHeading}
              </h1>
              ${bodyBlock}
              ${pdfLine}
              <p style="margin:0 0 16px;font-size:15px;color:${C.muted};line-height:1.6;">
                If you have questions about anything in the guide, or want to talk about how the
                framework applies to your product, reply to this email or contact us at
                <a href="mailto:${escapeHtml(config.replyTo)}" style="color:${C.primary};">${escapeHtml(config.replyTo)}</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;border-top:1px solid ${C.border};margin-top:32px;">
              <p style="margin:0;font-size:13px;color:${C.muted};line-height:1.5;">
                You received this email because you requested the free guide at ${escapeHtml(siteHostLabel(config.siteUrl))}.
                This is a one-time delivery — you have not been subscribed to any mailing list.
                <br/>
                © ${CURRENT_YEAR} ${escapeHtml(config.brandName)}.
                <a href="${escapeHtml(config.privacyPolicyUrl)}" style="color:${C.muted};">Privacy Policy</a>
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
  const config = await getRuntimeConfig();
  const C = config.palette;

  // 1. Notify primary inbox
  await resend.emails.send({
    from: FROM,
    to: config.contactEmail,
    replyTo: sanitizeHeaderValue(email),
    subject: sanitizeHeaderValue(
      applyTemplate(config.inquiryNotificationSubject, {
        name,
        company,
        brandName: config.brandName,
      }),
    ),
    html: inquiryNotificationHtml({ name, email, company, challenge, palette: C }),
  });

  // 2. Acknowledgment to visitor
  await resend.emails.send({
    from: FROM,
    to: email,
    replyTo: config.replyTo,
    subject: sanitizeHeaderValue(
      applyTemplate(config.inquiryAckSubject, {
        name,
        company,
        brandName: config.brandName,
      }),
    ),
    html: inquiryAckHtml({ name, config }),
  });
}

function inquiryNotificationHtml({
  name,
  email,
  company,
  challenge,
  palette,
}: {
  name: string;
  email: string;
  company: string;
  challenge: string;
  palette: EmailPalette;
}) {
  const C = palette;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>New inquiry</title></head>
<body style="margin:0;padding:32px;font-family:system-ui,-apple-system,sans-serif;background:${C.background};">
  <table role="presentation" width="100%" style="max-width:560px;background:${C.white};border-radius:8px;border:1px solid ${C.border};padding:32px;">
    <tr><td>
      <h1 style="margin:0 0 24px;font-size:20px;font-weight:700;color:${C.primary};">New inquiry</h1>
      <table role="presentation" width="100%" style="border-collapse:collapse;">
        ${row('Name', escapeHtml(name), C)}
        ${row('Email', `<a href="mailto:${escapeHtml(email)}" style="color:${C.primary};">${escapeHtml(email)}</a>`, C)}
        ${row('Company', escapeHtml(company), C)}
        ${row('Challenge', escapeHtml(challenge).replace(/\n/g, '<br/>'), C)}
      </table>
      <p style="margin:24px 0 0;font-size:13px;color:${C.muted};">
        Submitted: ${new Date().toUTCString()}
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

function row(label: string, value: string, palette: EmailPalette) {
  return `<tr>
    <td style="padding:8px 0;font-size:14px;font-weight:600;color:${palette.text};width:100px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;font-size:14px;color:${palette.muted};line-height:1.5;">${value}</td>
  </tr>`;
}

function inquiryAckHtml({
  name,
  config,
}: {
  name: string;
  config: EmailRuntimeConfig;
}) {
  const C = config.palette;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>We received your inquiry</title></head>
<body style="margin:0;padding:0;background:${C.background};font-family:system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.background};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" style="max-width:560px;background:${C.white};border-radius:8px;border:1px solid ${C.border};">
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:${C.primary};">
                ${escapeHtml(config.brandName)}
              </p>
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:${C.text};line-height:1.3;">
                ${escapeHtml(
                  applyTemplate(config.inquiryAckHeading, {
                    name,
                    company: '',
                    brandName: config.brandName,
                  }),
                )}
              </h1>
              <p style="margin:0 0 16px;font-size:16px;color:${C.muted};line-height:1.6;">
                ${escapeHtml(config.inquiryAckBody)}
              </p>
              <p style="margin:0 0 16px;font-size:16px;color:${C.muted};line-height:1.6;">
                In the meantime, if you haven't already, the free guide covers the specific
                mistakes the framework is designed to prevent:
              </p>
              <p style="margin:0 0 24px;">
                <a href="${escapeHtml(config.guidePageUrl)}"
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
                © ${CURRENT_YEAR} ${escapeHtml(config.brandName)}.
                <a href="${escapeHtml(config.privacyPolicyUrl)}" style="color:${C.muted};">Privacy Policy</a>
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

export async function sendRegistrationStatusUpdateEmail({
  name,
  email,
  publicId,
  eventTitle,
  statusCode,
  statusLabel,
  userFacingReason,
  isPaid,
}: {
  name: string;
  email: string;
  publicId: string;
  eventTitle: string;
  statusCode: RegistrationStatus;
  statusLabel: string;
  userFacingReason?: string | null;
  isPaid: boolean;
}) {
  const resend = getResend();
  const config = await getRuntimeConfig();
  const safeEventTitle = eventTitle.trim() || 'Event';
  const summary = getRegistrationStatusMessage({
    status: statusCode,
    userFacingReason: userFacingReason ?? null,
    isPaidEvent: isPaid,
  });

  await resend.emails.send({
    from: FROM,
    to: email,
    replyTo: config.replyTo,
    subject: sanitizeHeaderValue(
      `${REGISTRATION_EMAIL_SUBJECT_PREFIX}: ${statusLabel} — ${safeEventTitle}`,
    ),
    html: registrationStatusEmailHtml({
      name,
      publicId,
      eventTitle: safeEventTitle,
      statusLabel,
      summary,
      userFacingReason: userFacingReason ?? null,
      config,
    }),
  });
}

function registrationStatusEmailHtml({
  name,
  publicId,
  eventTitle,
  statusLabel,
  summary,
  userFacingReason,
  config,
}: {
  name: string;
  publicId: string;
  eventTitle: string;
  statusLabel: string;
  summary: string;
  userFacingReason: string | null;
  config: EmailRuntimeConfig;
}) {
  const C = config.palette;
  const reasonText = userFacingReason?.trim();

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>${escapeHtml(statusLabel)}</title></head>
<body style="margin:0;padding:0;background:${C.background};font-family:system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.background};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" style="max-width:560px;background:${C.white};border-radius:8px;border:1px solid ${C.border};">
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:${C.primary};">
                ${escapeHtml(config.brandName)}
              </p>
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:${C.text};line-height:1.3;">
                ${escapeHtml(statusLabel)}
              </h1>
              <p style="margin:0 0 16px;font-size:16px;color:${C.muted};line-height:1.6;">
                ${escapeHtml(name)}, ${escapeHtml(summary)}
              </p>
              <table role="presentation" width="100%" style="border-collapse:collapse;margin:0 0 24px;">
                ${row('Event', escapeHtml(eventTitle), C)}
                ${row('Status', escapeHtml(statusLabel), C)}
                ${row('Registration ID', `<code style="font-size:13px;">${escapeHtml(publicId)}</code>`, C)}
                ${reasonText ? row('Reason', escapeHtml(reasonText), C) : ''}
              </table>
              <p style="margin:0 0 16px;font-size:15px;color:${C.muted};line-height:1.6;">
                Keep your registration ID handy when checking the status page on ${escapeHtml(siteHostLabel(config.siteUrl))}.
              </p>
              <p style="margin:0 0 16px;font-size:15px;color:${C.muted};line-height:1.6;">
                Questions? Reply to this email or contact
                <a href="mailto:${escapeHtml(config.replyTo)}" style="color:${C.primary};">${escapeHtml(config.replyTo)}</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;border-top:1px solid ${C.border};">
              <p style="margin:0;font-size:13px;color:${C.muted};line-height:1.5;">
                © ${CURRENT_YEAR} ${escapeHtml(config.brandName)}.
                <a href="${escapeHtml(config.privacyPolicyUrl)}" style="color:${C.muted};">Privacy Policy</a>
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
