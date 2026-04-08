import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createBackendApiClient } from '@plenor/api-client';
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

  events.set('3001', {
    eventId: '3001',
    eventTitle: 'Paid Flow Event',
    paymentRequired: true,
    registrationRequired: true,
    maxRegistrations: null,
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
  countActiveSubmissionsForEvent: vi.fn(async () => submissionsByPublicId.size),

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

  listSubmissions: vi.fn(async (input: { page: number; limit: number }) => {
    const items = [...submissionsByPublicId.values()].sort((a, b) =>
      b.submittedAt.localeCompare(a.submittedAt),
    );
    const byStatus: Partial<Record<RegistrationStatus, number>> = {};
    for (const item of items) {
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
    }

    const start = (input.page - 1) * input.limit;
    return {
      items: items.slice(start, start + input.limit),
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

describe('org-site paid registration smoke (typed api client)', () => {
  let app: FastifyInstance;
  let baseUrl: string;

  beforeAll(async () => {
    resetEnv();
    const env = process.env as Record<string, string | undefined>;
    env.NODE_ENV = 'development';
    env.PAYLOAD_SECRET = 'test-secret';
    env.CMS_SKIP_PAYLOAD = 'true';
    env.BACKEND_RATE_LIMIT_MAX = '500';
    env.BACKEND_RATE_LIMIT_WINDOW_MS = '60000';
    env.ALLOW_IN_MEMORY_RATE_LIMIT_FALLBACK = 'true';
    env.BACKEND_API_KEYS =
      'admin-secret:admin:admin-key-1,internal-secret:internal:internal-key-1';

    app = buildBackendServer();
    baseUrl = await app.listen({ host: '127.0.0.1', port: 0 });
  });

  beforeEach(() => {
    resetRepoState();
  });

  afterAll(async () => {
    await app.close();
    resetEnv();
  });

  it('runs full paid flow: submit -> pending -> payment confirmation -> payment confirmed -> registration confirmed', async () => {
    const client = createBackendApiClient(baseUrl);

    const submitted = await client.POST('/v1/forms/registration', {
      headers: { origin: 'http://localhost:3000' },
      body: {
        eventId: '3001',
        name: 'Paid Smoke User',
        email: 'paid-smoke@example.com',
      },
    });

    expect(submitted.response.status).toBe(200);
    expect(submitted.data?.status).toBe('submitted');
    const publicId = submitted.data?.publicId;
    expect(typeof publicId).toBe('string');
    if (!publicId) throw new Error('publicId missing from submission response');

    const moveToPending = await client.PATCH('/v1/admin/registration-submissions/{publicId}', {
      params: {
        path: { publicId },
        header: { 'Idempotency-Key': `paid-pending-${publicId}` },
      },
      headers: {
        'x-api-key': 'admin-secret',
      } as Record<string, string>,
      body: {
        status: 'payment_pending',
      },
    });
    expect(moveToPending.response.status).toBe(200);
    expect(moveToPending.data?.submission.status).toBe('payment_pending');

    const paymentSubmitted = await client.POST('/v1/forms/registration/{publicId}/payment-confirmation', {
      params: { path: { publicId } },
      headers: { origin: 'http://localhost:3000' },
      body: {
        payerName: 'Paid Smoke User',
        paymentMethod: 'zelle',
        amount: 42,
        paymentDate: '2026-04-08',
        referenceNote: 'SMOKE-3001',
      },
    });
    expect(paymentSubmitted.response.status).toBe(200);
    expect(paymentSubmitted.data?.status).toBe('payment_confirmation_submitted');

    const markPaymentConfirmed = await client.PATCH('/v1/admin/registration-submissions/{publicId}', {
      params: {
        path: { publicId },
        header: { 'Idempotency-Key': `paid-confirm-${publicId}` },
      },
      headers: {
        'x-api-key': 'admin-secret',
      } as Record<string, string>,
      body: {
        status: 'payment_confirmed',
      },
    });
    expect(markPaymentConfirmed.response.status).toBe(200);
    expect(markPaymentConfirmed.data?.submission.status).toBe('payment_confirmed');

    const markRegistrationConfirmed = await client.PATCH('/v1/admin/registration-submissions/{publicId}', {
      params: {
        path: { publicId },
        header: { 'Idempotency-Key': `paid-final-${publicId}` },
      },
      headers: {
        'x-api-key': 'admin-secret',
      } as Record<string, string>,
      body: {
        status: 'registration_confirmed',
      },
    });
    expect(markRegistrationConfirmed.response.status).toBe(200);
    expect(markRegistrationConfirmed.data?.submission.status).toBe('registration_confirmed');

    const status = await client.GET('/v1/forms/registration/{publicId}', {
      params: { path: { publicId } },
    });
    expect(status.response.status).toBe(200);
    expect(status.data?.status).toBe('registration_confirmed');
  });
});
