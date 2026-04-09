import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { REGISTRATION_STATUSES, type RegistrationStatus } from '@/domain/org-site/constants';
import { buildBackendServer } from '../../../apps/backend/src/server';

type EventConfig = {
  eventId: string;
  eventTitle: string;
  paymentRequired: boolean;
  registrationRequired: boolean;
  maxRegistrations: number | null;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  status: 'draft' | 'published' | null;
};

type RegistrationPayload = {
  name: string;
  email: string;
  participantCount?: number;
  instrument?: string;
  ageGroup?: string;
  contactPreferences?: {
    email?: boolean;
    sms?: boolean;
    phone?: boolean;
    preferredChannel?: 'email' | 'sms' | 'phone';
  };
};

type PaymentConfirmationPayload = {
  payerName: string;
  paymentMethod: 'zelle' | 'venmo';
  amount: number;
  paymentDate: string;
  referenceNote?: string;
};

type SubmissionRecord = {
  id: number;
  publicId: string;
  eventId: string | null;
  status: RegistrationStatus;
  registrationPayload: RegistrationPayload;
  paymentConfirmationPayload: PaymentConfirmationPayload | null;
  internalReason: string | null;
  userFacingReason: string | null;
  submittedAt: string;
  updatedAt: string;
};

const ORIGINAL_ENV = { ...process.env };

const events = new Map<string, EventConfig>();
const submissionsByPublicId = new Map<string, SubmissionRecord>();
let autoIncrementId = 1;

function resetEnv() {
  process.env = { ...ORIGINAL_ENV };
}

function resetRepoState() {
  events.clear();
  submissionsByPublicId.clear();
  autoIncrementId = 1;

  events.set('1001', {
    eventId: '1001',
    eventTitle: 'Free Workshop',
    paymentRequired: false,
    registrationRequired: true,
    maxRegistrations: null,
    registrationOpensAt: null,
    registrationClosesAt: null,
    status: 'published',
  });

  events.set('1002', {
    eventId: '1002',
    eventTitle: 'Paid Concert',
    paymentRequired: true,
    registrationRequired: true,
    maxRegistrations: null,
    registrationOpensAt: null,
    registrationClosesAt: null,
    status: 'published',
  });

  events.set('1003', {
    eventId: '1003',
    eventTitle: 'Capacity Capped',
    paymentRequired: false,
    registrationRequired: true,
    maxRegistrations: 1,
    registrationOpensAt: null,
    registrationClosesAt: null,
    status: 'published',
  });
}

function nextPublicId(): string {
  const suffix = autoIncrementId.toString(16).padStart(12, '0');
  autoIncrementId += 1;
  return `00000000-0000-4000-8000-${suffix}`;
}

function readStatusIndex(status: RegistrationStatus): number {
  return REGISTRATION_STATUSES.indexOf(status);
}

const repository = {
  countActiveSubmissionsForEvent: vi.fn(async (eventId: string) => {
    let count = 0;
    for (const record of submissionsByPublicId.values()) {
      if (record.eventId !== eventId) continue;
      if (record.status === 'cancelled_rejected') continue;
      count += 1;
    }
    return count;
  }),

  findSubmissionByEventAndEmail: vi.fn(async (eventId: string, email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    for (const record of submissionsByPublicId.values()) {
      if (record.eventId !== eventId) continue;
      if ((record.registrationPayload.email || '').toLowerCase() === normalizedEmail) {
        return record;
      }
    }
    return null;
  }),

  getEventRegistrationConfigById: vi.fn(async (eventId: string, options?: { publishedOnly?: boolean }) => {
    const found = events.get(String(eventId));
    if (!found) return null;
    if (options?.publishedOnly !== false && found.status !== 'published') return null;
    return found;
  }),

  getSubmissionByPublicId: vi.fn(async (publicId: string) => {
    return submissionsByPublicId.get(publicId) || null;
  }),

  getSubmissionStatusByPublicId: vi.fn(async (publicId: string) => {
    const found = submissionsByPublicId.get(publicId);
    if (!found) return null;
    return {
      publicId: found.publicId,
      status: found.status,
      userFacingReason: found.userFacingReason,
    };
  }),

  isStatusAtOrBeyond: vi.fn((status: RegistrationStatus, baseline: RegistrationStatus) => {
    return readStatusIndex(status) >= readStatusIndex(baseline);
  }),

  persistRegistrationSubmissionWithOutbox: vi.fn(async (input: {
    eventId: string;
    registrationPayload: RegistrationPayload;
    eventTitle: string;
    isPaid: boolean;
  }) => {
    const now = new Date().toISOString();
    const record: SubmissionRecord = {
      id: autoIncrementId,
      publicId: nextPublicId(),
      eventId: input.eventId,
      status: 'submitted',
      registrationPayload: input.registrationPayload,
      paymentConfirmationPayload: null,
      internalReason: null,
      userFacingReason: null,
      submittedAt: now,
      updatedAt: now,
    };

    submissionsByPublicId.set(record.publicId, record);
    return record;
  }),

  persistPaymentConfirmationWithOutbox: vi.fn(async (input: {
    publicId: string;
    payload: PaymentConfirmationPayload;
    eventTitle: string;
    isPaid: boolean;
  }) => {
    const existing = submissionsByPublicId.get(input.publicId);
    if (!existing) return null;

    const updated: SubmissionRecord = {
      ...existing,
      paymentConfirmationPayload: input.payload,
      status: 'payment_confirmation_submitted',
      updatedAt: new Date().toISOString(),
    };

    submissionsByPublicId.set(updated.publicId, updated);
    return updated;
  }),

  listSubmissions: vi.fn(async () => {
    const items = [...submissionsByPublicId.values()].sort((a, b) =>
      b.submittedAt.localeCompare(a.submittedAt),
    );
    const byStatus: Partial<Record<RegistrationStatus, number>> = {};
    for (const item of items) {
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
    }

    return {
      items,
      total: items.length,
      byStatus,
    };
  }),

  updateSubmissionStatusWithAudit: vi.fn(async (input: {
    publicId: string;
    nextStatus: RegistrationStatus;
    internalReason?: string;
    userFacingReason?: string;
    actorKeyId: string;
    eventTitle: string;
    isPaid: boolean;
  }) => {
    const before = submissionsByPublicId.get(input.publicId) || null;
    if (!before) return { before: null, after: null };

    const after: SubmissionRecord = {
      ...before,
      status: input.nextStatus,
      internalReason: input.internalReason || null,
      userFacingReason: input.userFacingReason || null,
      updatedAt: new Date().toISOString(),
    };

    submissionsByPublicId.set(after.publicId, after);
    return { before, after };
  }),
};

vi.mock('@/infrastructure/persistence/registrationSubmissionRepository', () => ({
  countActiveSubmissionsForEvent: (...args: Parameters<typeof repository.countActiveSubmissionsForEvent>) =>
    repository.countActiveSubmissionsForEvent(...args),
  findSubmissionByEventAndEmail: (...args: Parameters<typeof repository.findSubmissionByEventAndEmail>) =>
    repository.findSubmissionByEventAndEmail(...args),
  getEventRegistrationConfigById: (...args: Parameters<typeof repository.getEventRegistrationConfigById>) =>
    repository.getEventRegistrationConfigById(...args),
  getSubmissionByPublicId: (...args: Parameters<typeof repository.getSubmissionByPublicId>) =>
    repository.getSubmissionByPublicId(...args),
  getSubmissionStatusByPublicId: (...args: Parameters<typeof repository.getSubmissionStatusByPublicId>) =>
    repository.getSubmissionStatusByPublicId(...args),
  isStatusAtOrBeyond: (...args: Parameters<typeof repository.isStatusAtOrBeyond>) =>
    repository.isStatusAtOrBeyond(...args),
  persistPaymentConfirmationWithOutbox: (
    ...args: Parameters<typeof repository.persistPaymentConfirmationWithOutbox>
  ) => repository.persistPaymentConfirmationWithOutbox(...args),
  persistRegistrationSubmissionWithOutbox: (
    ...args: Parameters<typeof repository.persistRegistrationSubmissionWithOutbox>
  ) => repository.persistRegistrationSubmissionWithOutbox(...args),
  listSubmissions: (...args: Parameters<typeof repository.listSubmissions>) =>
    repository.listSubmissions(...args),
  updateSubmissionStatusWithAudit: (
    ...args: Parameters<typeof repository.updateSubmissionStatusWithAudit>
  ) => repository.updateSubmissionStatusWithAudit(...args),
}));

vi.mock('@/infrastructure/security/rateLimiter', () => {
  const mocked = {
    checkRateLimit: vi.fn(async () => null),
    consumeRateLimitBucket: vi.fn(async () => ({ limited: false, retryAfterSeconds: 0 })),
  };
  return {
    ...mocked,
    default: mocked,
  };
});

vi.mock('@/infrastructure/security/originVerifier', () => ({
  verifyRequestOrigin: vi.fn(() => null),
}));

vi.mock('@/infrastructure/integrations/outboxService', () => ({
  processOutboxTick: vi.fn(async () => ({ processed: 0, failed: 0 })),
}));

describe('org-site registration routes integration', () => {
  let app: FastifyInstance;

  beforeEach(() => {
    resetEnv();
    resetRepoState();

    const env = process.env as Record<string, string | undefined>;
    env.NODE_ENV = 'development';
    env.PAYLOAD_SECRET = 'test-secret';
    env.CMS_SKIP_PAYLOAD = 'true';
    env.BACKEND_RATE_LIMIT_MAX = '500';
    env.BACKEND_RATE_LIMIT_WINDOW_MS = '60000';
    env.ALLOW_IN_MEMORY_RATE_LIMIT_FALLBACK = 'true';
    env.BACKEND_API_KEYS = 'admin-secret:admin:admin-test,internal-secret:internal:internal-test';

    app = buildBackendServer();
  });

  afterEach(async () => {
    await app.close();
    resetEnv();
  });

  it('enforces capacity with 409 REGISTRATION_FULL', async () => {
    const first = await app.inject({
      method: 'POST',
      url: '/v1/forms/registration',
      headers: { origin: 'http://localhost:3000' },
      payload: {
        eventId: '1003',
        name: 'First Person',
        email: 'first@example.com',
      },
    });

    expect(first.statusCode).toBe(200);

    const second = await app.inject({
      method: 'POST',
      url: '/v1/forms/registration',
      headers: { origin: 'http://localhost:3000' },
      payload: {
        eventId: '1003',
        name: 'Second Person',
        email: 'second@example.com',
      },
    });

    expect(second.statusCode).toBe(409);
    expect(second.json().code).toBe('REGISTRATION_FULL');
  });

  it('rejects duplicate submissions for the same event + email with 409 ALREADY_EXISTS', async () => {
    const payload = {
      eventId: '1001',
      name: 'Duplicate User',
      email: 'dup@example.com',
    };

    const first = await app.inject({
      method: 'POST',
      url: '/v1/forms/registration',
      headers: { origin: 'http://localhost:3000' },
      payload,
    });
    expect(first.statusCode).toBe(200);

    const second = await app.inject({
      method: 'POST',
      url: '/v1/forms/registration',
      headers: { origin: 'http://localhost:3000' },
      payload,
    });

    expect(second.statusCode).toBe(409);
    expect(second.json().code).toBe('ALREADY_EXISTS');
  });

  it('supports paid payment-confirmation replay-safe 200', async () => {
    const submitted = await app.inject({
      method: 'POST',
      url: '/v1/forms/registration',
      headers: { origin: 'http://localhost:3000' },
      payload: {
        eventId: '1002',
        name: 'Paid User',
        email: 'paid@example.com',
      },
    });

    expect(submitted.statusCode).toBe(200);
    const publicId = submitted.json().publicId as string;

    const moveToPending = await app.inject({
      method: 'PATCH',
      url: `/v1/admin/registration-submissions/${publicId}`,
      headers: {
        'x-api-key': 'admin-secret',
        'idempotency-key': `pending-${publicId}`,
      },
      payload: {
        status: 'payment_pending',
      },
    });

    expect(moveToPending.statusCode).toBe(200);

    const confirmationPayload = {
      payerName: 'Paid User',
      paymentMethod: 'zelle',
      amount: 50,
      paymentDate: '2026-04-08',
      referenceNote: 'RG-1002',
    };

    const firstConfirmation = await app.inject({
      method: 'POST',
      url: `/v1/forms/registration/${publicId}/payment-confirmation`,
      headers: { origin: 'http://localhost:3000' },
      payload: confirmationPayload,
    });

    expect(firstConfirmation.statusCode).toBe(200);
    expect(firstConfirmation.json().status).toBe('payment_confirmation_submitted');

    const replayConfirmation = await app.inject({
      method: 'POST',
      url: `/v1/forms/registration/${publicId}/payment-confirmation`,
      headers: { origin: 'http://localhost:3000' },
      payload: {
        ...confirmationPayload,
        amount: 999,
      },
    });

    expect(replayConfirmation.statusCode).toBe(200);
    expect(replayConfirmation.json().status).toBe('payment_confirmation_submitted');

    const statusResponse = await app.inject({
      method: 'GET',
      url: `/v1/forms/registration/${publicId}`,
    });

    expect(statusResponse.statusCode).toBe(200);
    expect(statusResponse.json().status).toBe('payment_confirmation_submitted');
    expect(statusResponse.json()).not.toHaveProperty('publicId');
  });

  it('allows free-event admin transition submitted -> registration_confirmed directly', async () => {
    const submitted = await app.inject({
      method: 'POST',
      url: '/v1/forms/registration',
      headers: { origin: 'http://localhost:3000' },
      payload: {
        eventId: '1001',
        name: 'Free User',
        email: 'free@example.com',
      },
    });

    expect(submitted.statusCode).toBe(200);
    const publicId = submitted.json().publicId as string;

    const confirmed = await app.inject({
      method: 'PATCH',
      url: `/v1/admin/registration-submissions/${publicId}`,
      headers: {
        'x-api-key': 'admin-secret',
        'idempotency-key': `confirm-${publicId}`,
      },
      payload: {
        status: 'registration_confirmed',
      },
    });

    expect(confirmed.statusCode).toBe(200);
    expect(confirmed.json().submission.status).toBe('registration_confirmed');
  });
});
