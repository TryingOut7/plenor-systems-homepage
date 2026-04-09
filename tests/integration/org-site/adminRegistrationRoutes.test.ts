import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { REGISTRATION_STATUSES, type RegistrationStatus } from '@/domain/org-site/constants';
import { processOutboxTick } from '@/infrastructure/integrations/outboxService';
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

type AuditRow = {
  action: 'registration_status_update';
  actor_key_id: string;
  target_id: string;
  old_status: RegistrationStatus;
  new_status: RegistrationStatus;
  reason: string | null;
};

const ORIGINAL_ENV = { ...process.env };

const events = new Map<string, EventConfig>();
const submissionsByPublicId = new Map<string, SubmissionRecord>();
const auditLogs: AuditRow[] = [];
let autoIncrementId = 1;

function resetEnv() {
  process.env = { ...ORIGINAL_ENV };
}

function resetRepoState() {
  events.clear();
  submissionsByPublicId.clear();
  auditLogs.length = 0;
  autoIncrementId = 1;

  events.set('2001', {
    eventId: '2001',
    eventTitle: 'Free Event',
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

    auditLogs.push({
      action: 'registration_status_update',
      actor_key_id: input.actorKeyId,
      target_id: input.publicId,
      old_status: before.status,
      new_status: after.status,
      reason: input.internalReason || input.userFacingReason || null,
    });

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

const mockProcessOutboxTick = vi.mocked(processOutboxTick);

describe('org-site admin registration routes integration', () => {
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
    env.BACKEND_API_KEYS =
      'admin-secret:admin:admin-key-1,internal-secret:internal:internal-key-1';

    app = buildBackendServer();
  });

  afterEach(async () => {
    await app.close();
    resetEnv();
  });

  async function createFreeSubmission(): Promise<string> {
    const submitted = await app.inject({
      method: 'POST',
      url: '/v1/forms/registration',
      headers: { origin: 'http://localhost:3000' },
      payload: {
        eventId: '2001',
        name: 'Admin Flow User',
        email: `admin-flow-${Date.now()}@example.com`,
      },
    });

    expect(submitted.statusCode).toBe(200);
    return submitted.json().publicId as string;
  }

  it('returns 401 when admin key is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/v1/admin/registration-submissions',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().code).toBe('UNAUTHORIZED');
  });

  it('returns 403 when API key has wrong role', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/v1/admin/registration-submissions',
      headers: { 'x-api-key': 'internal-secret' },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().code).toBe('FORBIDDEN');
  });

  it('writes an audit log row when PATCH changes status', async () => {
    const publicId = await createFreeSubmission();

    const response = await app.inject({
      method: 'PATCH',
      url: `/v1/admin/registration-submissions/${publicId}`,
      headers: {
        'x-api-key': 'admin-secret',
        'idempotency-key': `audit-${publicId}`,
      },
      payload: {
        status: 'registration_confirmed',
        internalReason: 'Manual verification complete',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().submission.status).toBe('registration_confirmed');
    expect(auditLogs).toHaveLength(1);

    expect(auditLogs[0]).toMatchObject({
      action: 'registration_status_update',
      actor_key_id: 'admin-key-1',
      target_id: publicId,
      old_status: 'submitted',
      new_status: 'registration_confirmed',
      reason: 'Manual verification complete',
    });
    expect(mockProcessOutboxTick).toHaveBeenCalledWith(10);
  });

  it('replays PATCH with same idempotency key without re-applying the update', async () => {
    const publicId = await createFreeSubmission();
    const idempotencyKey = `patch-replay-${publicId}`;

    const first = await app.inject({
      method: 'PATCH',
      url: `/v1/admin/registration-submissions/${publicId}`,
      headers: {
        'x-api-key': 'admin-secret',
        'idempotency-key': idempotencyKey,
      },
      payload: {
        status: 'registration_confirmed',
      },
    });

    expect(first.statusCode).toBe(200);
    const callsAfterFirst = repository.updateSubmissionStatusWithAudit.mock.calls.length;

    const second = await app.inject({
      method: 'PATCH',
      url: `/v1/admin/registration-submissions/${publicId}`,
      headers: {
        'x-api-key': 'admin-secret',
        'idempotency-key': idempotencyKey,
      },
      payload: {
        status: 'registration_confirmed',
      },
    });

    expect(second.statusCode).toBe(200);
    expect(second.headers['x-idempotent-replay']).toBe('true');
    expect(repository.updateSubmissionStatusWithAudit.mock.calls.length).toBe(callsAfterFirst);
    expect(auditLogs).toHaveLength(1);
  });
});
