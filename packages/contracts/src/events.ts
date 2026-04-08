export type OutboxProvider =
  | 'crm'
  | 'webhook'
  | 'email.guide'
  | 'email.registration'
  | 'email.inquiry'
  | 'payload.forms.guide'
  | 'payload.forms.inquiry';

export type OutboundEventType =
  | 'submission.guide.created'
  | 'submission.inquiry.created'
  | 'submission.registration.created'
  | 'submission.registration.payment_confirmation.submitted';

export interface OutboundEventV1<TPayload = unknown> {
  version: 'v1';
  type: OutboundEventType;
  id: string;
  occurredAt: string;
  payload: TPayload;
}

export interface OutboundEventDeliveryResult {
  delivered: boolean;
  destination: string;
}
