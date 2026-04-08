import {
  REGISTRATION_STATUSES,
  type RegistrationStatus,
} from '@/domain/org-site/constants';
import { isValidEmail, sanitizeText } from '@/domain/forms/common';

type ValidationOk<T> = { ok: true; data: T };
type ValidationErr = { ok: false; message: string };
type ValidationResult<T> = ValidationOk<T> | ValidationErr;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function findUnknownKeys(
  input: Record<string, unknown>,
  allowed: readonly string[],
): string[] {
  const allowedSet = new Set(allowed);
  return Object.keys(input).filter((key) => !allowedSet.has(key));
}

function ensureNoUnknownKeys(
  input: Record<string, unknown>,
  allowed: readonly string[],
): ValidationErr | null {
  const unknown = findUnknownKeys(input, allowed);
  if (unknown.length === 0) return null;
  return {
    ok: false,
    message: `Unknown field(s): ${unknown.sort((a, b) => a.localeCompare(b)).join(', ')}`,
  };
}

function readOptionalText(input: unknown, maxLength: number): string | undefined {
  if (typeof input !== 'string') return undefined;
  const trimmed = input.trim();
  if (!trimmed) return undefined;
  return sanitizeText(trimmed.slice(0, maxLength));
}

function readRequiredText(input: unknown, label: string, maxLength: number): ValidationResult<string> {
  if (typeof input !== 'string') {
    return { ok: false, message: `${label} is required.` };
  }
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, message: `${label} is required.` };
  }
  if (trimmed.length > maxLength) {
    return { ok: false, message: `${label} must be ${maxLength} characters or fewer.` };
  }
  return { ok: true, data: sanitizeText(trimmed) };
}

function readOptionalReason(input: unknown, label: string): ValidationResult<string | undefined> {
  if (input === null || input === undefined || input === '') {
    return { ok: true, data: undefined };
  }
  const parsed = readRequiredText(input, label, 2000);
  if (!parsed.ok) return parsed;
  return { ok: true, data: parsed.data };
}

export type RegistrationContactPreferences = {
  email?: boolean;
  sms?: boolean;
  phone?: boolean;
  preferredChannel?: 'email' | 'sms' | 'phone';
};

export type RegistrationPayload = {
  name: string;
  email: string;
  participantCount?: number;
  instrument?: string;
  ageGroup?: string;
  contactPreferences?: RegistrationContactPreferences;
};

export type RegistrationSubmissionRequestData = {
  eventId: string;
  registrationPayload: RegistrationPayload;
};

const REGISTRATION_TOP_LEVEL_KEYS = [
  'eventId',
  'name',
  'email',
  'participantCount',
  'instrument',
  'ageGroup',
  'contactPreferences',
] as const;

const CONTACT_PREFERENCE_KEYS = ['email', 'sms', 'phone', 'preferredChannel'] as const;

export function validateRegistrationSubmissionBody(input: unknown): ValidationResult<RegistrationSubmissionRequestData> {
  if (!isRecord(input)) {
    return { ok: false, message: 'Registration payload must be a JSON object.' };
  }

  const unknownTopLevel = ensureNoUnknownKeys(input, REGISTRATION_TOP_LEVEL_KEYS);
  if (unknownTopLevel) return unknownTopLevel;

  const eventIdResult = readRequiredText(input.eventId, 'eventId', 200);
  if (!eventIdResult.ok) return eventIdResult;

  const nameResult = readRequiredText(input.name, 'name', 200);
  if (!nameResult.ok) return nameResult;

  if (typeof input.email !== 'string') {
    return { ok: false, message: 'A valid email address is required.' };
  }
  const normalizedEmail = input.email.trim().toLowerCase();
  if (!normalizedEmail || normalizedEmail.length > 320 || !isValidEmail(normalizedEmail)) {
    return { ok: false, message: 'A valid email address is required.' };
  }

  let participantCount: number | undefined;
  if (input.participantCount !== undefined) {
    if (typeof input.participantCount !== 'number' || !Number.isInteger(input.participantCount)) {
      return { ok: false, message: 'participantCount must be a whole number.' };
    }
    if (input.participantCount < 1 || input.participantCount > 500) {
      return { ok: false, message: 'participantCount must be between 1 and 500.' };
    }
    participantCount = input.participantCount;
  }

  let contactPreferences: RegistrationContactPreferences | undefined;
  if (input.contactPreferences !== undefined) {
    if (!isRecord(input.contactPreferences)) {
      return { ok: false, message: 'contactPreferences must be an object.' };
    }
    const unknownPrefs = ensureNoUnknownKeys(input.contactPreferences, CONTACT_PREFERENCE_KEYS);
    if (unknownPrefs) return unknownPrefs;

    const preferredRaw = input.contactPreferences.preferredChannel;
    if (
      preferredRaw !== undefined &&
      preferredRaw !== 'email' &&
      preferredRaw !== 'sms' &&
      preferredRaw !== 'phone'
    ) {
      return {
        ok: false,
        message: 'contactPreferences.preferredChannel must be email, sms, or phone.',
      };
    }

    const boolKeys: Array<keyof Pick<RegistrationContactPreferences, 'email' | 'sms' | 'phone'>> = [
      'email',
      'sms',
      'phone',
    ];

    const parsed: RegistrationContactPreferences = {};
    for (const key of boolKeys) {
      const value = input.contactPreferences[key];
      if (value === undefined) continue;
      if (typeof value !== 'boolean') {
        return { ok: false, message: `contactPreferences.${key} must be a boolean.` };
      }
      parsed[key] = value;
    }

    if (preferredRaw !== undefined) {
      parsed.preferredChannel = preferredRaw;
    }

    if (Object.keys(parsed).length > 0) {
      contactPreferences = parsed;
    }
  }

  return {
    ok: true,
    data: {
      eventId: eventIdResult.data,
      registrationPayload: {
        name: nameResult.data,
        email: normalizedEmail,
        ...(participantCount !== undefined ? { participantCount } : {}),
        ...(readOptionalText(input.instrument, 120)
          ? { instrument: readOptionalText(input.instrument, 120) }
          : {}),
        ...(readOptionalText(input.ageGroup, 80) ? { ageGroup: readOptionalText(input.ageGroup, 80) } : {}),
        ...(contactPreferences ? { contactPreferences } : {}),
      },
    },
  };
}

export type PaymentMethod = 'zelle' | 'venmo';

export type PaymentConfirmationPayload = {
  payerName: string;
  paymentMethod: PaymentMethod;
  amount: number;
  paymentDate: string;
  referenceNote?: string;
};

export type PaymentConfirmationRequestData = {
  paymentConfirmationPayload: PaymentConfirmationPayload;
};

const PAYMENT_TOP_LEVEL_KEYS = [
  'payerName',
  'paymentMethod',
  'amount',
  'paymentDate',
  'referenceNote',
] as const;

export function validatePaymentConfirmationBody(input: unknown): ValidationResult<PaymentConfirmationRequestData> {
  if (!isRecord(input)) {
    return { ok: false, message: 'Payment confirmation payload must be a JSON object.' };
  }

  const unknownTopLevel = ensureNoUnknownKeys(input, PAYMENT_TOP_LEVEL_KEYS);
  if (unknownTopLevel) return unknownTopLevel;

  const payerNameResult = readRequiredText(input.payerName, 'payerName', 200);
  if (!payerNameResult.ok) return payerNameResult;

  if (input.paymentMethod !== 'zelle' && input.paymentMethod !== 'venmo') {
    return { ok: false, message: 'paymentMethod must be zelle or venmo.' };
  }

  if (typeof input.amount !== 'number' || !Number.isFinite(input.amount)) {
    return { ok: false, message: 'amount must be a valid number.' };
  }
  if (input.amount <= 0 || input.amount > 1_000_000) {
    return { ok: false, message: 'amount must be greater than 0 and reasonable.' };
  }

  if (typeof input.paymentDate !== 'string') {
    return { ok: false, message: 'paymentDate is required.' };
  }
  const parsedDate = new Date(input.paymentDate);
  if (Number.isNaN(parsedDate.valueOf())) {
    return { ok: false, message: 'paymentDate must be a valid date.' };
  }

  return {
    ok: true,
    data: {
      paymentConfirmationPayload: {
        payerName: payerNameResult.data,
        paymentMethod: input.paymentMethod,
        amount: Number(input.amount),
        paymentDate: parsedDate.toISOString(),
        ...(readOptionalText(input.referenceNote, 2000)
          ? { referenceNote: readOptionalText(input.referenceNote, 2000) }
          : {}),
      },
    },
  };
}

export type AdminStatusUpdateRequestData = {
  status: RegistrationStatus;
  internalReason?: string;
  userFacingReason?: string;
};

const ADMIN_STATUS_TOP_LEVEL_KEYS = ['status', 'internalReason', 'userFacingReason'] as const;

export function validateAdminStatusUpdateBody(input: unknown): ValidationResult<AdminStatusUpdateRequestData> {
  if (!isRecord(input)) {
    return { ok: false, message: 'Status update payload must be a JSON object.' };
  }

  const unknownTopLevel = ensureNoUnknownKeys(input, ADMIN_STATUS_TOP_LEVEL_KEYS);
  if (unknownTopLevel) return unknownTopLevel;

  if (!REGISTRATION_STATUSES.includes(input.status as RegistrationStatus)) {
    return { ok: false, message: 'status is invalid.' };
  }

  const internalReason = readOptionalReason(input.internalReason, 'internalReason');
  if (!internalReason.ok) return internalReason;

  const userFacingReason = readOptionalReason(input.userFacingReason, 'userFacingReason');
  if (!userFacingReason.ok) return userFacingReason;

  return {
    ok: true,
    data: {
      status: input.status as RegistrationStatus,
      ...(internalReason.data ? { internalReason: internalReason.data } : {}),
      ...(userFacingReason.data ? { userFacingReason: userFacingReason.data } : {}),
    },
  };
}

