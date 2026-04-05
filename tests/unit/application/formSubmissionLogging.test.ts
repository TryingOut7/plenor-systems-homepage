import { afterEach, describe, expect, it, vi } from 'vitest';
import { submitGuideForm } from '@/application/forms/guideSubmissionService';
import { submitInquiryForm } from '@/application/forms/inquirySubmissionService';
import type { RequestContext } from '@/application/shared/requestContext';

const persistGuideSubmission = vi.fn();
const persistInquirySubmission = vi.fn();

vi.mock('@/infrastructure/persistence/submissionRepository', () => ({
  persistGuideSubmission: (...args: Parameters<typeof persistGuideSubmission>) =>
    persistGuideSubmission(...args),
  persistInquirySubmission: (...args: Parameters<typeof persistInquirySubmission>) =>
    persistInquirySubmission(...args),
}));

vi.mock('@/infrastructure/integrations/outboxService', () => ({
  enqueueIntegrationJobs: vi.fn(async () => 0),
  processOutboxTick: vi.fn(async () => ({ processed: 0, failed: 0 })),
}));

vi.mock('@/infrastructure/security/rateLimiter', () => ({
  checkRateLimit: vi.fn(() => null),
}));

vi.mock('@/infrastructure/security/originVerifier', () => ({
  verifyRequestOrigin: vi.fn(() => null),
}));

function makeContext(): RequestContext {
  return {
    requestId: 'req-log-redaction',
    method: 'POST',
    path: '/v1/forms/guide',
    url: 'http://localhost:3000/api/guide',
    origin: 'http://localhost:3000',
    host: 'localhost:3000',
    forwardedHost: null,
    forwardedProto: 'http',
    realIp: '127.0.0.1',
    forwardedFor: null,
    authorization: null,
    apiKey: null,
    idempotencyKey: null,
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('form submission error logging', () => {
  it('does not log raw guide PII payload on persistence failures', async () => {
    persistGuideSubmission.mockRejectedValueOnce(new Error('db unavailable'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const result = await submitGuideForm(makeContext(), {
      name: 'Alice Example',
      email: 'alice@example.com',
      templateId: 'guide-v1',
    });

    expect(result.status).toBe(500);
    expect(errorSpy).toHaveBeenCalledTimes(1);

    const combinedLog = JSON.stringify(errorSpy.mock.calls[0] || []);
    expect(combinedLog).not.toContain('Alice Example');
    expect(combinedLog).not.toContain('alice@example.com');
    expect(combinedLog).toContain('emailDomain');
  });

  it('does not log raw inquiry payload/body on persistence failures', async () => {
    persistInquirySubmission.mockRejectedValueOnce(new Error('db unavailable'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const result = await submitInquiryForm(makeContext(), {
      name: 'Bob Example',
      email: 'bob@example.com',
      company: 'Acme Corporation',
      challenge: 'We need support for QA and launch operations.',
    });

    expect(result.status).toBe(500);
    expect(errorSpy).toHaveBeenCalledTimes(1);

    const combinedLog = JSON.stringify(errorSpy.mock.calls[0] || []);
    expect(combinedLog).not.toContain('Bob Example');
    expect(combinedLog).not.toContain('bob@example.com');
    expect(combinedLog).not.toContain('Acme Corporation');
    expect(combinedLog).not.toContain('QA and launch operations');
    expect(combinedLog).toContain('challengeLength');
  });
});
