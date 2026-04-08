import {
  sendGuideEmail,
  sendInquiryEmails,
  type GuideEmailTemplate,
} from '@/lib/email';

export type { GuideEmailTemplate };

export async function sendGuideDeliveryEmail(input: {
  name: string;
  email: string;
  template?: GuideEmailTemplate;
}): Promise<void> {
  await sendGuideEmail(input);
}

export async function sendInquiryRoutingEmails(input: {
  name: string;
  email: string;
  company: string;
  challenge: string;
}): Promise<void> {
  await sendInquiryEmails(input);
}

export async function sendRegistrationStatusEmail(input: {
  publicId: string;
  eventId: string;
  statusCode: string;
  statusLabel: string;
}): Promise<void> {
  // TODO(retention): add dedicated registration email templates once provider
  // copy and compliance retention policies are finalized.
  console.info('Registration status email provider placeholder invoked.', {
    publicId: input.publicId,
    eventId: input.eventId,
    statusCode: input.statusCode,
    statusLabel: input.statusLabel,
  });
}
