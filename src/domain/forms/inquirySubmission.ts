import { isValidEmail, sanitizeText } from './common';

export interface InquirySubmissionInput {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  challenge?: unknown;
}

export interface InquirySubmissionData {
  name: string;
  email: string;
  company: string;
  challenge: string;
}

export type InquirySubmissionValidation =
  | { ok: true; data: InquirySubmissionData }
  | { ok: false; message: string };

export function validateInquirySubmission(
  input: InquirySubmissionInput,
): InquirySubmissionValidation {
  const rawName = typeof input.name === 'string' ? input.name : '';
  const rawEmail = typeof input.email === 'string' ? input.email : '';
  const rawCompany = typeof input.company === 'string' ? input.company : '';
  const rawChallenge = typeof input.challenge === 'string' ? input.challenge : '';

  if (!rawName || rawName.trim().length === 0 || rawName.length > 200) {
    return { ok: false, message: 'Name is required (max 200 characters).' };
  }

  if (!rawEmail || rawEmail.length > 320 || !isValidEmail(rawEmail)) {
    return { ok: false, message: 'A valid email address is required.' };
  }

  if (!rawCompany || rawCompany.trim().length === 0 || rawCompany.length > 300) {
    return {
      ok: false,
      message: 'Company name is required (max 300 characters).',
    };
  }

  if (
    !rawChallenge ||
    rawChallenge.trim().length === 0 ||
    rawChallenge.length > 5000
  ) {
    return {
      ok: false,
      message:
        'Please describe your product and challenge (max 5000 characters).',
    };
  }

  return {
    ok: true,
    data: {
      name: sanitizeText(rawName.trim()),
      email: rawEmail.trim().toLowerCase(),
      company: sanitizeText(rawCompany.trim()),
      challenge: sanitizeText(rawChallenge.trim()),
    },
  };
}
