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
