import { Resend } from 'resend';

// Resend client — instantiated lazily so missing env vars only throw at send time.
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY environment variable is not set.');
  return new Resend(key);
}

const FROM = `${process.env.RESEND_FROM_NAME ?? 'Plenor Systems'} <${process.env.RESEND_FROM_EMAIL ?? 'noreply@plenor.ai'}>`;
const REPLY_TO = process.env.CONTACT_EMAIL ?? 'hello@plenor.ai';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? 'hello@plenor.ai';
const GUIDE_PDF_URL = process.env.GUIDE_PDF_URL ?? '';

/** Strip CR/LF to prevent email header injection. */
function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]/g, '');
}

// ── Guide delivery email ──────────────────────────────────────────────────────

export async function sendGuideEmail({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const resend = getResend();

  const pdfLine = GUIDE_PDF_URL
    ? `<p style="margin:0 0 24px;">
         <a href="${GUIDE_PDF_URL}"
            style="display:inline-block;background:#1B2D4F;color:#ffffff;font-weight:700;
                   font-size:15px;padding:12px 24px;border-radius:6px;text-decoration:none;">
           Download the guide
         </a>
       </p>
       <p style="margin:0 0 16px;font-size:13px;color:#6B7280;">
         If the button doesn't work, copy and paste this link into your browser:<br/>
         <a href="${GUIDE_PDF_URL}" style="color:#1B2D4F;">${GUIDE_PDF_URL}</a>
       </p>`
    : `<p style="margin:0 0 16px;color:#DC2626;font-size:14px;">
         <strong>Note:</strong> The guide PDF link has not been configured yet.
         Please contact ${CONTACT_EMAIL} to receive the guide.
       </p>`;

  await resend.emails.send({
    from: FROM,
    to: email,
    replyTo: REPLY_TO,
    subject: 'Your free guide from Plenor Systems',
    html: guideEmailHtml({ name, pdfLine }),
  });
}

function guideEmailHtml({ name, pdfLine }: { name: string; pdfLine: string }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Your free guide from Plenor Systems</title>
</head>
<body style="margin:0;padding:0;background:#F8F9FA;font-family:system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8F9FA;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:8px;border:1px solid #E5E7EB;">
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:#1B2D4F;">
                Plenor Systems
              </p>
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1A1A1A;line-height:1.3;">
                Here's your guide, ${escapeHtml(name)}.
              </h1>
              <p style="margin:0 0 24px;font-size:16px;color:#6B7280;line-height:1.6;">
                <strong style="color:#1A1A1A;">The 7 Most Common Product Development Mistakes — and How to Avoid Them</strong>
                covers the specific errors teams make in Testing & QA and Launch & Go-to-Market,
                and what to do instead.
              </p>
              ${pdfLine}
              <p style="margin:0 0 16px;font-size:15px;color:#6B7280;line-height:1.6;">
                If you have questions about anything in the guide, or want to talk about how the
                framework applies to your product, reply to this email or contact us at
                <a href="mailto:${REPLY_TO}" style="color:#1B2D4F;">${REPLY_TO}</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;border-top:1px solid #E5E7EB;margin-top:32px;">
              <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.5;">
                You received this email because you requested the free guide at plenor.ai.
                This is a one-time delivery — you have not been subscribed to any mailing list.
                <br/>
                © 2026 Plenor Systems.
                <a href="https://plenor.ai/privacy" style="color:#6B7280;">Privacy Policy</a>
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

  // 1. Notify Plenor Systems inbox
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
    subject: 'We received your inquiry — Plenor Systems',
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
<body style="margin:0;padding:32px;font-family:system-ui,-apple-system,sans-serif;background:#F8F9FA;">
  <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:8px;border:1px solid #E5E7EB;padding:32px;">
    <tr><td>
      <h1 style="margin:0 0 24px;font-size:20px;font-weight:700;color:#1B2D4F;">New inquiry</h1>
      <table role="presentation" width="100%" style="border-collapse:collapse;">
        ${row('Name', escapeHtml(name))}
        ${row('Email', `<a href="mailto:${escapeHtml(email)}" style="color:#1B2D4F;">${escapeHtml(email)}</a>`)}
        ${row('Company', escapeHtml(company))}
        ${row('Challenge', escapeHtml(challenge).replace(/\n/g, '<br/>'))}
      </table>
      <p style="margin:24px 0 0;font-size:13px;color:#6B7280;">
        Submitted: ${new Date().toUTCString()}
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 0;font-size:14px;font-weight:600;color:#1A1A1A;width:100px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;font-size:14px;color:#6B7280;line-height:1.5;">${value}</td>
  </tr>`;
}

function inquiryAckHtml({ name }: { name: string }) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>We received your inquiry</title></head>
<body style="margin:0;padding:0;background:#F8F9FA;font-family:system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8F9FA;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:8px;border:1px solid #E5E7EB;">
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:#1B2D4F;">
                Plenor Systems
              </p>
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1A1A1A;line-height:1.3;">
                We received your inquiry, ${escapeHtml(name)}.
              </h1>
              <p style="margin:0 0 16px;font-size:16px;color:#6B7280;line-height:1.6;">
                We review every inquiry and respond within 2 business days with initial thoughts
                or a proposal request.
              </p>
              <p style="margin:0 0 16px;font-size:16px;color:#6B7280;line-height:1.6;">
                In the meantime, if you haven't already, the free guide covers the specific
                mistakes the framework is designed to prevent:
              </p>
              <p style="margin:0 0 24px;">
                <a href="https://plenor.ai/contact#guide"
                   style="display:inline-block;background:#1B2D4F;color:#ffffff;font-weight:700;
                          font-size:15px;padding:12px 24px;border-radius:6px;text-decoration:none;">
                  Get the free guide
                </a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;border-top:1px solid #E5E7EB;">
              <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.5;">
                © 2026 Plenor Systems.
                <a href="https://plenor.ai/privacy" style="color:#6B7280;">Privacy Policy</a>
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
