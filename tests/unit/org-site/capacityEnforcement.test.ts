import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RequestContext } from '@/application/shared/requestContext';
import { submitRegistration } from '@/application/org-site/registrationSubmissionService';

const getEventRegistrationConfigById = vi.fn();
const findSubmissionByEventAndEmail = vi.fn();
const countActiveSubmissionsForEvent = vi.fn();
const persistRegistrationSubmissionWithOutbox = vi.fn();

vi.mock('@/infrastructure/persistence/registrationSubmissionRepository', () => ({
  countActiveSubmissionsForEvent: (...args: Parameters<typeof countActiveSubmissionsForEvent>) =>
    countActiveSubmissionsForEvent(...args),
  findSubmissionByEventAndEmail: (...args: Parameters<typeof findSubmissionByEventAndEmail>) =>
    findSubmissionByEventAndEmail(...args),
  getEventRegistrationConfigById: (...args: Parameters<typeof getEventRegistrationConfigById>) =>
    getEventRegistrationConfigById(...args),
  getSubmissionByPublicId: vi.fn(async () => null),
  getSubmissionStatusByPublicId: vi.fn(async () => null),
  isStatusAtOrBeyond: vi.fn(() => false),
  persistPaymentConfirmationWithOutbox: vi.fn(async () => null),
  persistRegistrationSubmissionWithOutbox: (
    ...args: Parameters<typeof persistRegistrationSubmissionWithOutbox>
  ) => persistRegistrationSubmissionWithOutbox(...args),
}));

vi.mock('@/infrastructure/security/rateLimiter', () => ({
  checkRateLimit: vi.fn(async () => null),
}));

vi.mock('@/infrastructure/security/originVerifier', () => ({
  verifyRequestOrigin: vi.fn(() => null),
}));

vi.mock('@/infrastructure/integrations/outboxService', () => ({
  processOutboxTick: vi.fn(async () => ({ processed: 0, failed: 0 })),
}));

function makeContext(): RequestContext {
  return {
    requestId: 'req-capacity',
    method: 'POST',
    path: '/v1/forms/registration',
    url: 'http://localhost:8000/v1/forms/registration',
    origin: 'http://localhost:3000',
    host: 'localhost:8000',
    forwardedHost: null,
    forwardedProto: 'http',
    realIp: '127.0.0.1',
    forwardedFor: null,
    authorization: null,
    apiKey: null,
    idempotencyKey: null,
  };
}

function validBody(eventId = '101') {
  return {
    eventId,
    name: 'Alice Example',
    email: 'alice@example.com',
    participantCount: 1,
    instrument: 'Violin',
    ageGroup: 'Adult',
    contactPreferences: {
      email: true,
      sms: false,
      phone: false,
      preferredChannel: 'email',
    },
  };
}

function baseEventConfig() {
  return {
    eventId: '101',
    eventTitle: 'Test Event',
    paymentRequired: false,
    registrationRequired: true,
    maxRegistrations: null,
    registrationOpensAt: null,
    registrationClosesAt: null,
    status: 'published' as const,
  };
}

function readErrorCode(result: Awaited<ReturnType<typeof submitRegistration>>): string | undefined {
  const body = result.body as unknown;
  if (!body || typeof body !== 'object') return undefined;
  return typeof (body as { code?: unknown }).code === 'string'
    ? (body as { code: string }).code
    : undefined;
}

describe('registration capacity/open-close enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getEventRegistrationConfigById.mockResolvedValue(baseEventConfig());
    findSubmissionByEventAndEmail.mockResolvedValue(null);
    countActiveSubmissionsForEvent.mockResolvedValue(0);
    persistRegistrationSubmissionWithOutbox.mockResolvedValue({
      id: 1,
      publicId: '00000000-0000-4000-8000-000000000001',
      eventId: '101',
      status: 'submitted',
      registrationPayload: {
        name: 'Alice Example',
        email: 'alice@example.com',
      },
      paymentConfirmationPayload: null,
      internalReason: null,
      userFacingReason: null,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  it('returns 409 REGISTRATION_FULL when maxRegistrations has been reached', async () => {
    getEventRegistrationConfigById.mockResolvedValue({
      ...baseEventConfig(),
      maxRegistrations: 1,
    });
    countActiveSubmissionsForEvent.mockResolvedValue(1);

    const result = await submitRegistration(makeContext(), validBody());

    expect(result.status).toBe(409);
    expect(readErrorCode(result)).toBe('REGISTRATION_FULL');
    expect(persistRegistrationSubmissionWithOutbox).not.toHaveBeenCalled();
  });

  it('returns 422 REGISTRATION_NOT_OPEN when now is before registrationOpensAt', async () => {
    const opensAt = new Date(Date.now() + 60_000).toISOString();
    getEventRegistrationConfigById.mockResolvedValue({
      ...baseEventConfig(),
      registrationOpensAt: opensAt,
    });

    const result = await submitRegistration(makeContext(), validBody());

    expect(result.status).toBe(422);
    expect(readErrorCode(result)).toBe('REGISTRATION_NOT_OPEN');
    expect(persistRegistrationSubmissionWithOutbox).not.toHaveBeenCalled();
  });

  it('returns 422 REGISTRATION_CLOSED when now is after registrationClosesAt', async () => {
    const closesAt = new Date(Date.now() - 60_000).toISOString();
    getEventRegistrationConfigById.mockResolvedValue({
      ...baseEventConfig(),
      registrationClosesAt: closesAt,
    });

    const result = await submitRegistration(makeContext(), validBody());

    expect(result.status).toBe(422);
    expect(readErrorCode(result)).toBe('REGISTRATION_CLOSED');
    expect(persistRegistrationSubmissionWithOutbox).not.toHaveBeenCalled();
  });
});
