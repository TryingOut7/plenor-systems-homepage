import {
  REGISTRATION_STATUSES,
  type RegistrationStatus,
} from '@/domain/org-site/constants';

export type RegistrationActorRole = 'public' | 'admin';
export type RegistrationState = RegistrationStatus | null;

const SUBMITTED = REGISTRATION_STATUSES[0];
const PAYMENT_PENDING = REGISTRATION_STATUSES[1];
const PAYMENT_CONFIRMATION_SUBMITTED = REGISTRATION_STATUSES[2];
const PAYMENT_CONFIRMED = REGISTRATION_STATUSES[3];
const REGISTRATION_CONFIRMED = REGISTRATION_STATUSES[4];
const CANCELLED_REJECTED = REGISTRATION_STATUSES[5];

const PAYMENT_STATES = new Set<RegistrationStatus>([
  PAYMENT_PENDING,
  PAYMENT_CONFIRMATION_SUBMITTED,
  PAYMENT_CONFIRMED,
]);

function isPaymentState(state: RegistrationStatus): boolean {
  return PAYMENT_STATES.has(state);
}

export function canTransition(
  role: RegistrationActorRole,
  from: RegistrationState,
  to: RegistrationStatus,
  eventIsPaid: boolean,
): boolean {
  if (to === CANCELLED_REJECTED) {
    return role === 'admin';
  }

  // Free-event workflow never enters payment states.
  if (!eventIsPaid && isPaymentState(to)) {
    return false;
  }

  if (role === 'public') {
    if (from === null && to === SUBMITTED) {
      return true;
    }

    if (eventIsPaid && from === PAYMENT_PENDING && to === PAYMENT_CONFIRMATION_SUBMITTED) {
      return true;
    }

    return false;
  }

  // Admin transitions.
  if (!eventIsPaid) {
    return from === SUBMITTED && to === REGISTRATION_CONFIRMED;
  }

  // Paid event canonical sequence.
  if (from === SUBMITTED && to === PAYMENT_PENDING) {
    return true;
  }
  if (from === PAYMENT_CONFIRMATION_SUBMITTED && to === PAYMENT_CONFIRMED) {
    return true;
  }
  if (from === PAYMENT_CONFIRMED && to === REGISTRATION_CONFIRMED) {
    return true;
  }

  return false;
}

