import type { OutboundEventV1 } from '@plenor/contracts/events';

export interface CrmProvider {
  send(event: OutboundEventV1): Promise<void>;
}

export interface EmailProvider {
  sendGuideDelivery(input: {
    event: OutboundEventV1;
    name: string;
    email: string;
    templateId?: string | number;
  }): Promise<void>;
  sendInquiryRouting(input: {
    event: OutboundEventV1;
    name: string;
    email: string;
    company: string;
    challenge: string;
  }): Promise<void>;
  sendRegistrationStatusUpdate(input: {
    event: OutboundEventV1;
    publicId: string;
    eventId: string;
    statusCode: string;
    statusLabel: string;
  }): Promise<void>;
}

export interface WebhookProvider {
  send(event: OutboundEventV1): Promise<void>;
}

export interface PayloadFormsProvider {
  saveGuideSubmission(input: { name: string; email: string }): Promise<void>;
  saveInquirySubmission(input: {
    name: string;
    email: string;
    company: string;
    challenge: string;
  }): Promise<void>;
}

export interface IntegrationProviders {
  crm: CrmProvider;
  email: EmailProvider;
  webhook: WebhookProvider;
  payloadForms: PayloadFormsProvider;
}
