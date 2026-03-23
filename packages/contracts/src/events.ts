export type OutboundEventType =
  | 'submission.guide.created'
  | 'submission.inquiry.created';

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
