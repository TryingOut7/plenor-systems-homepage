import { describe, expect, it } from 'vitest';
import { REGISTRATION_STATUSES } from '@/domain/org-site/constants';
import { canTransition, type RegistrationState } from '@/domain/org-site/registrationWorkflow';

const [
  SUBMITTED,
  PAYMENT_PENDING,
  PAYMENT_CONFIRMATION_SUBMITTED,
  PAYMENT_CONFIRMED,
  REGISTRATION_CONFIRMED,
  CANCELLED_REJECTED,
] = REGISTRATION_STATUSES;

const ALL_FROM_STATES: RegistrationState[] = [
  null,
  SUBMITTED,
  PAYMENT_PENDING,
  PAYMENT_CONFIRMATION_SUBMITTED,
  PAYMENT_CONFIRMED,
  REGISTRATION_CONFIRMED,
  CANCELLED_REJECTED,
];

const PAYMENT_STATES = [
  PAYMENT_PENDING,
  PAYMENT_CONFIRMATION_SUBMITTED,
  PAYMENT_CONFIRMED,
] as const;

describe('free event FSM', () => {
  it('never allows transitions into payment states for free events', () => {
    for (const from of ALL_FROM_STATES) {
      for (const to of PAYMENT_STATES) {
        expect(canTransition('public', from, to, false)).toBe(false);
        expect(canTransition('admin', from, to, false)).toBe(false);
      }
    }
  });

  it('allows the canonical free-event path only', () => {
    expect(canTransition('public', null, SUBMITTED, false)).toBe(true);
    expect(canTransition('admin', SUBMITTED, REGISTRATION_CONFIRMED, false)).toBe(true);

    // Free-event admin confirmation cannot be skipped before submission.
    expect(canTransition('admin', null, REGISTRATION_CONFIRMED, false)).toBe(false);

    // Admin can still cancel/reject from any state.
    expect(canTransition('admin', SUBMITTED, CANCELLED_REJECTED, false)).toBe(true);
    expect(canTransition('admin', REGISTRATION_CONFIRMED, CANCELLED_REJECTED, false)).toBe(true);
  });
});
