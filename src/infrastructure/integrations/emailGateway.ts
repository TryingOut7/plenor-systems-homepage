import {
  sendGuideEmail,
  sendInquiryEmails,
  sendRegistrationStatusUpdateEmail,
  type GuideEmailTemplate,
} from '@/lib/email';
import type { RegistrationStatus } from '@plenor/contracts/forms';

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
  eventTitle: string;
  registrantName: string;
  registrantEmail: string;
  statusCode: RegistrationStatus;
  statusLabel: string;
  userFacingReason: string | null;
  isPaid: boolean;
}): Promise<void> {
  await sendRegistrationStatusUpdateEmail({
    name: input.registrantName,
    email: input.registrantEmail,
    publicId: input.publicId,
    eventTitle: input.eventTitle,
    statusCode: input.statusCode,
    statusLabel: input.statusLabel,
    userFacingReason: input.userFacingReason,
    isPaid: input.isPaid,
  });
}
