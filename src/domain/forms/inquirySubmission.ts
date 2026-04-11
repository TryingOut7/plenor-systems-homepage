import { isValidEmail, sanitizeText } from './common';

export interface InquirySubmissionInput {
  name?: unknown;
  email?: unknown;
  organization?: unknown;
  inquiryType?: unknown;
  message?: unknown;
  company?: unknown;
  challenge?: unknown;
}

export interface InquirySubmissionData {
  name: string;
  email: string;
  organization: string;
  inquiryType: string;
  message: string;
}

export type InquirySubmissionValidation =
  | { ok: true; data: InquirySubmissionData }
  | { ok: false; message: string };

export function validateInquirySubmission(
  input: InquirySubmissionInput,
): InquirySubmissionValidation {
  const rawName = typeof input.name === 'string' ? input.name : '';
  const rawEmail = typeof input.email === 'string' ? input.email : '';
  const normalizedEmail = rawEmail.trim().toLowerCase();
  const rawOrganization =
    typeof input.organization === 'string'
      ? input.organization
      : typeof input.company === 'string'
        ? input.company
        : '';
  const rawInquiryType = typeof input.inquiryType === 'string' ? input.inquiryType : '';
  const rawMessage =
    typeof input.message === 'string'
      ? input.message
      : typeof input.challenge === 'string'
        ? input.challenge
        : '';

  if (!rawName || rawName.trim().length === 0 || rawName.length > 200) {
    return { ok: false, message: 'Name is required (max 200 characters).' };
  }

  if (!normalizedEmail || normalizedEmail.length > 320 || !isValidEmail(normalizedEmail)) {
    return { ok: false, message: 'A valid email address is required.' };
  }

  if (rawOrganization.length > 300) {
    return {
      ok: false,
      message: 'Organization must be 300 characters or fewer.',
    };
  }

  if (!rawInquiryType || rawInquiryType.trim().length === 0 || rawInquiryType.length > 200) {
    return {
      ok: false,
      message: 'Inquiry type is required (max 200 characters).',
    };
  }

  if (!rawMessage || rawMessage.trim().length === 0 || rawMessage.length > 5000) {
    return {
      ok: false,
      message: 'Message is required (max 5000 characters).',
    };
  }

  return {
    ok: true,
    data: {
      name: sanitizeText(rawName.trim()),
      email: normalizedEmail,
      organization: sanitizeText(rawOrganization.trim()),
      inquiryType: sanitizeText(rawInquiryType.trim()),
      message: sanitizeText(rawMessage.trim()),
    },
  };
}
