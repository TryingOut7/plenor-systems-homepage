import type { OutboundEventV1 } from '@plenor/contracts/events';
import { getGuideEmailTemplate } from '@/infrastructure/cms/emailTemplateGateway';
import {
  saveGuideSubmissionToPayloadForm,
  saveInquirySubmissionToPayloadForm,
} from '@/infrastructure/cms/formSubmissionGateway';
import { queueCrmEvent } from '@/infrastructure/integrations/crmGateway';
import {
  sendGuideDeliveryEmail,
  sendInquiryRoutingEmails,
} from '@/infrastructure/integrations/emailGateway';
import { SignedWebhookProvider } from './signedWebhookProvider';
import type {
  CrmProvider,
  EmailProvider,
  IntegrationProviders,
  PayloadFormsProvider,
  WebhookProvider,
} from './providers';

class DefaultCrmProvider implements CrmProvider {
  async send(event: OutboundEventV1): Promise<void> {
    await queueCrmEvent({
      eventType: event.type,
      timestamp: event.occurredAt,
      event,
    });
  }
}

class DefaultEmailProvider implements EmailProvider {
  async sendGuideDelivery(input: {
    event: OutboundEventV1;
    name: string;
    email: string;
    templateId?: string | number;
  }): Promise<void> {
    let template;
    if (input.templateId != null) {
      template = await getGuideEmailTemplate(input.templateId);
    }

    await sendGuideDeliveryEmail({
      name: input.name,
      email: input.email,
      template,
    });
  }

  async sendInquiryRouting(input: {
    event: OutboundEventV1;
    name: string;
    email: string;
    company: string;
    challenge: string;
  }): Promise<void> {
    await sendInquiryRoutingEmails({
      name: input.name,
      email: input.email,
      company: input.company,
      challenge: input.challenge,
    });
  }
}

class DefaultPayloadFormsProvider implements PayloadFormsProvider {
  async saveGuideSubmission(input: {
    name: string;
    email: string;
  }): Promise<void> {
    if (process.env.CMS_SKIP_PAYLOAD === 'true') {
      return;
    }
    await saveGuideSubmissionToPayloadForm({
      name: input.name,
      email: input.email,
    });
  }

  async saveInquirySubmission(input: {
    name: string;
    email: string;
    company: string;
    challenge: string;
  }): Promise<void> {
    if (process.env.CMS_SKIP_PAYLOAD === 'true') {
      return;
    }
    await saveInquirySubmissionToPayloadForm({
      name: input.name,
      email: input.email,
      company: input.company,
      challenge: input.challenge,
    });
  }
}

const defaultCrmProvider = new DefaultCrmProvider();
const defaultEmailProvider = new DefaultEmailProvider();
const defaultWebhookProvider: WebhookProvider = new SignedWebhookProvider();
const defaultPayloadFormsProvider = new DefaultPayloadFormsProvider();

export function getIntegrationProviders(): IntegrationProviders {
  return {
    crm: defaultCrmProvider,
    email: defaultEmailProvider,
    webhook: defaultWebhookProvider,
    payloadForms: defaultPayloadFormsProvider,
  };
}
