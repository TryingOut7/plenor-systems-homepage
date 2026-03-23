import { logGuideSubmission, logInquirySubmission } from '@/lib/db';

export async function persistGuideSubmission(
  name: string,
  email: string,
): Promise<void> {
  await logGuideSubmission(name, email);
}

export async function persistInquirySubmission(
  name: string,
  email: string,
  company: string,
  challenge: string,
): Promise<void> {
  await logInquirySubmission(name, email, company, challenge);
}
