/**
 * CRM webhook integration.
 *
 * Fires a POST request to a configured CRM endpoint on form submissions.
 * Activate by setting these environment variables:
 *   CRM_WEBHOOK_URL    — The endpoint to POST form data to
 *   CRM_WEBHOOK_SECRET — (Optional) Shared secret sent as X-Webhook-Secret header
 *
 * Silently skips if CRM_WEBHOOK_URL is not set. Throws on HTTP errors so the
 * outbox can retry and dead-letter failed deliveries correctly.
 */

type CrmPayload = {
  event: 'inquiry' | 'guide_download';
  timestamp: string;
  data: Record<string, unknown>;
};

function isAllowedWebhookUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname;
    if (
      host === 'localhost' ||
      host.startsWith('127.') ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('169.254.') ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
      host === '[::1]'
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function fireCrmWebhook(payload: CrmPayload): Promise<void> {
  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) return;

  if (!isAllowedWebhookUrl(url)) {
    console.error('CRM webhook URL rejected: must be HTTPS and non-private.');
    return;
  }

  const secret = process.env.CRM_WEBHOOK_SECRET;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (secret) {
    headers['X-Webhook-Secret'] = secret;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '(no body)');
    throw new Error(`CRM webhook responded with ${res.status}: ${body}`);
  }
}
