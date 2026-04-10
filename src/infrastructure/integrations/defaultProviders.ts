import type { OutboundEventV1 } from '@plenor/contracts/events';
import { getGuideEmailTemplate } from '@/infrastructure/cms/emailTemplateGateway';
import { getGuideFormEmailConfig } from '@/infrastructure/cms/guideFormEmailGateway';
import {
  saveGuideSubmissionToPayloadForm,
  saveInquirySubmissionToPayloadForm,
} from '@/infrastructure/cms/formSubmissionGateway';
import { queueCrmEvent } from '@/infrastructure/integrations/crmGateway';
import {
  sendGuideDeliveryEmail,
  sendInquiryRoutingEmails,
} from '@/infrastructure/integrations/emailGateway';
import { createStructuredLogger } from '@/lib/structuredLogger';
import { SignedWebhookProvider } from './signedWebhookProvider';
import type {
  CrmProvider,
  EmailProvider,
  IntegrationProviders,
  PayloadFormsProvider,
  WebhookProvider,
} from './providers';

const logger = createStructuredLogger('infrastructure.integrations.defaultProviders');

class DefaultCrmProvider implements CrmProvider {
  async send(event: OutboundEventV1): Promise<void> {
    if (
      event.type !== 'submission.guide.created' &&
      event.type !== 'submission.inquiry.created'
    ) {
      logger.info('Skipping CRM dispatch for unsupported event type.', {
        eventType: event.type,
      });
      return;
    }

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
    formId?: string | number;
  }): Promise<void> {
    const formEmailConfig = await getGuideFormEmailConfig(input.formId);
    if (formEmailConfig.hasCustomEmails) {
      // Per-form "Emails" blocks are configured in Forms CMS, so the plugin's
      // form-submissions email hook is the source of truth for this submission.
      // Skip fallback template sending here to avoid duplicate emails.
      return;
    }

    const resolvedTemplateId = formEmailConfig.templateId ?? input.templateId;
    let template;
    if (resolvedTemplateId != null) {
      template = await getGuideEmailTemplate(resolvedTemplateId);
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
    formId?: string | number;
  }): Promise<void> {
    if (process.env.CMS_SKIP_PAYLOAD === 'true') {
      return;
    }
    await saveGuideSubmissionToPayloadForm({
      name: input.name,
      email: input.email,
      formId: input.formId,
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
