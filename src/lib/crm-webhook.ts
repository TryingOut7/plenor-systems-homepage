/**
 * CRM webhook integration.
 *
 * Fires a POST request to a configured CRM endpoint on form submissions.
 * Activate by setting these environment variables:
 *   CRM_WEBHOOK_URL    — The endpoint to POST form data to
 *   CRM_WEBHOOK_SECRET — (Optional) Shared secret sent as X-Webhook-Secret header
 *
 * Silently skips if CRM_WEBHOOK_URL is not set. Errors are logged but never
 * block the main form submission flow.
 */

type CrmPayload = {
  event: 'inquiry' | 'guide_download';
  timestamp: string;
  data: Record<string, unknown>;
};

export async function fireCrmWebhook(payload: CrmPayload): Promise<void> {
  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) return;

  const secret = process.env.CRM_WEBHOOK_SECRET;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (secret) {
    headers['X-Webhook-Secret'] = secret;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      console.error(`CRM webhook responded with ${res.status}: ${await res.text().catch(() => '(no body)')}`);
    }
  } catch (err) {
    console.error('CRM webhook failed:', err);
  }
}
