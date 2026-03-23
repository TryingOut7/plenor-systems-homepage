import { isValidEmail, sanitizeText } from './common';

export interface GuideSubmissionInput {
  name?: unknown;
  email?: unknown;
  templateId?: unknown;
}

export interface GuideSubmissionData {
  name: string;
  email: string;
  templateId?: string | number;
}

export type GuideSubmissionValidation =
  | { ok: true; data: GuideSubmissionData }
  | { ok: false; message: string };

export function validateGuideSubmission(
  input: GuideSubmissionInput,
): GuideSubmissionValidation {
  const rawName = typeof input.name === 'string' ? input.name : '';
  const rawEmail = typeof input.email === 'string' ? input.email : '';

  if (!rawName || rawName.trim().length === 0 || rawName.length > 200) {
    return { ok: false, message: 'Name is required (max 200 characters).' };
  }

  if (!rawEmail || rawEmail.length > 320 || !isValidEmail(rawEmail)) {
    return { ok: false, message: 'A valid email address is required.' };
  }

  const templateId =
    typeof input.templateId === 'string' || typeof input.templateId === 'number'
      ? input.templateId
      : undefined;

  return {
    ok: true,
    data: {
      name: sanitizeText(rawName.trim()),
      email: rawEmail.trim().toLowerCase(),
      ...(templateId !== undefined ? { templateId } : {}),
    },
  };
}
