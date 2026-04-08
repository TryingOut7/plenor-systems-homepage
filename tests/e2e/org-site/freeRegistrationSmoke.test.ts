import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createBackendApiClient } from '@plenor/api-client';
import type { RegistrationStatus } from '@/domain/org-site/constants';
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

type SubmissionRecord = {
  id: number;
  publicId: string;
  eventId: string | null;
  status: RegistrationStatus;
  registrationPayload: RegistrationPayload;
  paymentConfirmationPayload: Record<string, unknown> | null;
  internalReason: string | null;
  userFacingReason: string | null;
  submittedAt: string;
  updatedAt: string;
};

const ORIGINAL_ENV = { ...process.env };

const events = new Map<string, EventConfig>();
const submissionsByPublicId = new Map<string, SubmissionRecord>();
const transitionHistory = new Map<string, RegistrationStatus[]>();
let autoIncrementId = 1;

function resetEnv() {
  process.env = { ...ORIGINAL_ENV };
}

function resetRepoState() {
  events.clear();
  submissionsByPublicId.clear();
  transitionHistory.clear();
  autoIncrementId = 1;

  events.set('3002', {
    eventId: '3002',
    eventTitle: 'Free Flow Event',
    paymentRequired: false,
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
    const sequence: RegistrationStatus[] = [
      'submitted',
      'payment_pending',
      'payment_confirmation_submitted',
      'payment_confirmed',
      'registration_confirmed',
      'cancelled_rejected',
    ];
    return sequence.indexOf(status) >= sequence.indexOf(baseline);
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
    transitionHistory.set(record.publicId, ['submitted']);
    return record;
  }),

  persistPaymentConfirmationWithOutbox: vi.fn(async () => null),

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
    transitionHistory.set(after.publicId, [...(transitionHistory.get(after.publicId) || []), after.status]);
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

describe('org-site free registration smoke (typed api client)', () => {
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

  it('runs free flow: submit -> admin confirm with no payment states', async () => {
    const client = createBackendApiClient(baseUrl);

    const submitted = await client.POST('/v1/forms/registration', {
      headers: { origin: 'http://localhost:3000' },
      body: {
        eventId: '3002',
        name: 'Free Smoke User',
        email: 'free-smoke@example.com',
      },
    });

    expect(submitted.response.status).toBe(200);
    expect(submitted.data?.status).toBe('submitted');
    const publicId = submitted.data?.publicId;
    expect(typeof publicId).toBe('string');
    if (!publicId) throw new Error('publicId missing from submission response');

    const confirmed = await client.PATCH('/v1/admin/registration-submissions/{publicId}', {
      params: {
        path: { publicId },
        header: { 'Idempotency-Key': `free-final-${publicId}` },
      },
      headers: {
        'x-api-key': 'admin-secret',
      } as Record<string, string>,
      body: {
        status: 'registration_confirmed',
      },
    });
    expect(confirmed.response.status).toBe(200);
    expect(confirmed.data?.submission.status).toBe('registration_confirmed');

    const status = await client.GET('/v1/forms/registration/{publicId}', {
      params: { path: { publicId } },
    });
    expect(status.response.status).toBe(200);
    expect(status.data?.status).toBe('registration_confirmed');

    const history = transitionHistory.get(publicId) || [];
    expect(history).toEqual(['submitted', 'registration_confirmed']);
    expect(history).not.toContain('payment_pending');
    expect(history).not.toContain('payment_confirmation_submitted');
    expect(history).not.toContain('payment_confirmed');
  });
});
