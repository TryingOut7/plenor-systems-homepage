import { describe, expect, it } from 'vitest';
import { canTransition } from '@/domain/org-site/registrationWorkflow';
import type { RegistrationState } from '@/domain/org-site/registrationWorkflow';
import type { RegistrationStatus } from '@/domain/org-site/constants';

describe('canTransition', () => {
  // ── Public transitions ─────────────────────────────────────────────────────

  describe('public role — initial submission', () => {
    it('allows null → submitted (free event)', () => {
      expect(canTransition('public', null, 'submitted', false)).toBe(true);
    });

    it('allows null → submitted (paid event)', () => {
      expect(canTransition('public', null, 'submitted', true)).toBe(true);
    });
  });

  describe('public role — payment confirmation step', () => {
    it('allows payment_pending → payment_confirmation_submitted (paid)', () => {
      expect(canTransition('public', 'payment_pending', 'payment_confirmation_submitted', true)).toBe(true);
    });

    it('blocks payment_pending → payment_confirmation_submitted (free event)', () => {
      // Free event cannot enter payment states at all.
      expect(canTransition('public', 'payment_pending', 'payment_confirmation_submitted', false)).toBe(false);
    });

    it('blocks submitted → payment_confirmation_submitted (public must wait for admin)', () => {
      expect(canTransition('public', 'submitted', 'payment_confirmation_submitted', true)).toBe(false);
    });
  });

  describe('public role — blocked transitions', () => {
    it('blocks public from moving to payment_pending', () => {
      expect(canTransition('public', 'submitted', 'payment_pending', true)).toBe(false);
    });

    it('blocks public from moving to payment_confirmed', () => {
      expect(canTransition('public', 'payment_confirmation_submitted', 'payment_confirmed', true)).toBe(false);
    });

    it('blocks public from moving to registration_confirmed', () => {
      expect(canTransition('public', 'submitted', 'registration_confirmed', false)).toBe(false);
    });

    it('blocks public from moving to cancelled_rejected', () => {
      expect(canTransition('public', 'submitted', 'cancelled_rejected', false)).toBe(false);
    });
  });

  // ── Admin — free event ──────────────────────────────────────────────────────

  describe('admin role — free event', () => {
    it('allows submitted → registration_confirmed (free)', () => {
      expect(canTransition('admin', 'submitted', 'registration_confirmed', false)).toBe(true);
    });

    it('blocks submitted → payment_pending (free event)', () => {
      expect(canTransition('admin', 'submitted', 'payment_pending', false)).toBe(false);
    });

    it('blocks submitted → payment_confirmed (free event)', () => {
      expect(canTransition('admin', 'submitted', 'payment_confirmed', false)).toBe(false);
    });

    it('blocks submitted → payment_confirmation_submitted (free event)', () => {
      expect(canTransition('admin', 'submitted', 'payment_confirmation_submitted', false)).toBe(false);
    });

    it('allows any state → cancelled_rejected (free, admin)', () => {
      const states: RegistrationState[] = [
        'submitted',
        'registration_confirmed',
        'cancelled_rejected',
        null,
      ];
      for (const from of states) {
        expect(canTransition('admin', from, 'cancelled_rejected', false)).toBe(true);
      }
    });
  });

  // ── Admin — paid event (canonical sequence) ────────────────────────────────

  describe('admin role — paid event canonical sequence', () => {
    it('allows submitted → payment_pending (paid)', () => {
      expect(canTransition('admin', 'submitted', 'payment_pending', true)).toBe(true);
    });

    it('allows payment_confirmation_submitted → payment_confirmed (paid)', () => {
      expect(canTransition('admin', 'payment_confirmation_submitted', 'payment_confirmed', true)).toBe(true);
    });

    it('allows payment_confirmed → registration_confirmed (paid)', () => {
      expect(canTransition('admin', 'payment_confirmed', 'registration_confirmed', true)).toBe(true);
    });

    it('allows any state → cancelled_rejected (paid, admin)', () => {
      const states: RegistrationState[] = [
        'submitted',
        'payment_pending',
        'payment_confirmation_submitted',
        'payment_confirmed',
        'registration_confirmed',
        null,
      ];
      for (const from of states) {
        expect(canTransition('admin', from, 'cancelled_rejected', true)).toBe(true);
      }
    });
  });

  // ── Admin — paid event BLOCKED shortcuts ───────────────────────────────────

  describe('admin role — paid event blocked shortcuts', () => {
    it('blocks submitted → registration_confirmed (paid)', () => {
      // Admin must go through payment flow for paid events.
      expect(canTransition('admin', 'submitted', 'registration_confirmed', true)).toBe(false);
    });

    it('blocks payment_pending → payment_confirmed directly (paid)', () => {
      // Must wait for public to submit payment confirmation first.
      expect(canTransition('admin', 'payment_pending', 'payment_confirmed', true)).toBe(false);
    });

    it('blocks payment_pending → registration_confirmed directly (paid)', () => {
      expect(canTransition('admin', 'payment_pending', 'registration_confirmed', true)).toBe(false);
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('blocks transition from null to anything other than submitted', () => {
      const nonSubmitted: RegistrationStatus[] = [
        'payment_pending',
        'payment_confirmation_submitted',
        'payment_confirmed',
        'registration_confirmed',
      ];
      for (const to of nonSubmitted) {
        expect(canTransition('public', null, to, true)).toBe(false);
        expect(canTransition('admin', null, to, true)).toBe(false);
      }
    });
  });
});
