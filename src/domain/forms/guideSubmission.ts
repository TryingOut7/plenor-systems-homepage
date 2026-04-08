import { isValidEmail, sanitizeText } from './common';

export interface GuideSubmissionInput {
  name?: unknown;
  email?: unknown;
  templateId?: unknown;
  formId?: unknown;
}

export interface GuideSubmissionData {
  name: string;
  email: string;
  templateId?: string | number;
  formId?: string | number;
}

export type GuideSubmissionValidation =
  | { ok: true; data: GuideSubmissionData }
  | { ok: false; message: string };

export function validateGuideSubmission(
  input: GuideSubmissionInput,
): GuideSubmissionValidation {
  const rawName = typeof input.name === 'string' ? input.name : '';
  const rawEmail = typeof input.email === 'string' ? input.email : '';
  const normalizedEmail = rawEmail.trim().toLowerCase();

  if (!rawName || rawName.trim().length === 0 || rawName.length > 200) {
    return { ok: false, message: 'Name is required (max 200 characters).' };
  }

  if (!normalizedEmail || normalizedEmail.length > 320 || !isValidEmail(normalizedEmail)) {
    return { ok: false, message: 'A valid email address is required.' };
  }

  const templateId =
    typeof input.templateId === 'string' || typeof input.templateId === 'number'
      ? input.templateId
      : undefined;
  const formId =
    typeof input.formId === 'string' || typeof input.formId === 'number'
      ? input.formId
      : undefined;

  return {
    ok: true,
    data: {
      name: sanitizeText(rawName.trim()),
      email: normalizedEmail,
      ...(templateId !== undefined ? { templateId } : {}),
      ...(formId !== undefined ? { formId } : {}),
    },
  };
}
