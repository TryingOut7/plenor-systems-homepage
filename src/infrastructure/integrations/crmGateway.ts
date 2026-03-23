import { fireCrmWebhook } from '@/lib/crm-webhook';

export type CrmEventName = 'guide_download' | 'inquiry';

export async function queueCrmEvent(input: {
  event: CrmEventName;
  timestamp: string;
  data: Record<string, unknown>;
}): Promise<void> {
  await fireCrmWebhook(input);
}
