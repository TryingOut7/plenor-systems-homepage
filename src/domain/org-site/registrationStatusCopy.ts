import type { RegistrationStatus } from './constants';

const STATUS_LABELS: Record<RegistrationStatus, string> = {
  submitted: 'Registration Submitted',
  payment_pending: 'Payment Pending',
  payment_confirmation_submitted: 'Payment Confirmation Submitted',
  payment_confirmed: 'Payment Confirmed',
  registration_confirmed: 'Registration Confirmed',
  cancelled_rejected: 'Registration Cancelled',
};

export function getRegistrationStatusLabel(status: RegistrationStatus): string {
  return STATUS_LABELS[status];
}

export function getRegistrationStatusMessage(input: {
  status: RegistrationStatus;
  userFacingReason: string | null;
  isPaidEvent: boolean;
}): string {
  if (input.status === 'submitted') {
    return input.isPaidEvent
      ? 'Registration received. Check back here or your email for payment instructions.'
      : "Your registration has been received. We'll notify you with next steps.";
  }

  if (input.status === 'payment_pending') {
    return 'Payment instructions are now available. Complete payment and submit confirmation below.';
  }

  if (input.status === 'payment_confirmation_submitted') {
    return 'Payment confirmation received. Pending admin verification.';
  }

  if (input.status === 'payment_confirmed') {
    return 'Payment verified. Awaiting final registration confirmation.';
  }

  if (input.status === 'registration_confirmed') {
    return "You're confirmed! See you at the event.";
  }

  if (input.status === 'cancelled_rejected') {
    return input.userFacingReason?.trim() || 'Registration cancelled.';
  }

  return 'Status unavailable.';
}
