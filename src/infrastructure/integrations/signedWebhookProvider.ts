import { createHmac } from 'node:crypto';
import type { OutboundEventV1 } from '@plenor/contracts/events';
import type { WebhookProvider } from './providers';

function buildSignature(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export class SignedWebhookProvider implements WebhookProvider {
  async send(event: OutboundEventV1): Promise<void> {
    const url = process.env.OUTBOUND_WEBHOOK_URL?.trim();
    if (!url) return;

    const body = JSON.stringify(event);
    const secret = process.env.OUTBOUND_WEBHOOK_SECRET?.trim();
    const signature = secret ? buildSignature(body, secret) : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Event-Version': event.version,
      'X-Event-Type': event.type,
      'X-Event-Id': event.id,
    };

    if (signature) {
      headers['X-Plenor-Signature'] = signature;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`Outbound webhook failed with status ${response.status}`);
    }
  }
}
