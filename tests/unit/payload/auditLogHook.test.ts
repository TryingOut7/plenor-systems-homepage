import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { auditLogInternals } from '@/payload/hooks/auditLog';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = {
    ...ORIGINAL_ENV,
    OUTBOUND_WEBHOOK_URL: 'https://hooks.example.com/audit',
  };
  vi.restoreAllMocks();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.restoreAllMocks();
});

describe('system-risk audit alerts', () => {
  it('logs webhook delivery failures with the payload logger', async () => {
    const error = vi.fn();
    const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('connect failed'));

    await auditLogInternals.alertHighRiskAuditEvent({
      action: 'update',
      collection: 'redirect-rules',
      documentId: '1',
      documentTitle: '/old',
      fieldPath: 'redirect-rules.toPath',
      userEmail: 'admin@example.com',
      summary: 'admin@example.com changed redirect-rules.toPath',
      logger: { error },
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://hooks.example.com/audit',
      expect.objectContaining({
        method: 'POST',
        signal: expect.any(AbortSignal),
      }),
    );
    expect(error).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: 'System-risk CMS change detected',
        collection: 'redirect-rules',
      }),
    );
    expect(error).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: 'Failed to deliver system-risk audit webhook',
        errorMessage: 'connect failed',
      }),
    );
  });
});
