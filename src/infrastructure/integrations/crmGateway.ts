import { fireCrmWebhook } from '@/lib/crm-webhook';
import type { OutboundEventV1 } from '@plenor/contracts/events';

export type CrmEventName = 'guide_download' | 'inquiry';
export type CrmEventType =
  | 'submission.guide.created'
  | 'submission.inquiry.created';

export async function queueCrmEvent(input: {
  eventType: CrmEventType;
  timestamp: string;
  event: OutboundEventV1;
}): Promise<void> {
  const mappedEvent: CrmEventName =
    input.eventType === 'submission.guide.created' ? 'guide_download' : 'inquiry';

  const payload =
    input.event.payload && typeof input.event.payload === 'object'
      ? (input.event.payload as Record<string, unknown>)
      : {};

  await fireCrmWebhook({
    event: mappedEvent,
    timestamp: input.timestamp,
    data: {
      version: input.event.version,
      eventId: input.event.id,
      ...payload,
    },
  });
}
