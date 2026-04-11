import {
  persistGuideSubmissionRecord,
  persistInquirySubmissionRecord,
  type StoredSubmission,
} from '@/infrastructure/persistence/backendStore';

export async function persistGuideSubmission(
  name: string,
  email: string,
): Promise<StoredSubmission> {
  return persistGuideSubmissionRecord({ name, email });
}

export async function persistInquirySubmission(
  name: string,
  email: string,
  organization: string,
  inquiryType: string,
  message: string,
): Promise<StoredSubmission> {
  return persistInquirySubmissionRecord({
    name,
    email,
    organization,
    inquiryType,
    message,
  });
}
