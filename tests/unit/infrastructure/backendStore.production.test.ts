import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  vi.resetModules();
  process.env = { ...ORIGINAL_ENV };
});

describe('backendStore production fallback policy', () => {
  it('hard-fails idempotency writes when persistent table capability is unavailable', async () => {
    const env = process.env as Record<string, string | undefined>;
    env.NODE_ENV = 'production';
    delete env.SUPABASE_URL;
    delete env.SUPABASE_SERVICE_ROLE_KEY;

    const store = await import('@/infrastructure/persistence/backendStore');

    await expect(
      store.writeIdempotencyRecord({
        route: '/v1/forms/guide',
        key: 'k-1',
        fingerprint: 'fp-1',
        status: 200,
        body: { ok: true },
        createdAt: new Date().toISOString(),
      }),
    ).rejects.toThrow('backend_idempotency_keys');
  });

  it('hard-fails outbox enqueue/claim when persistent table capability is unavailable', async () => {
    const env = process.env as Record<string, string | undefined>;
    env.NODE_ENV = 'production';
    delete env.SUPABASE_URL;
    delete env.SUPABASE_SERVICE_ROLE_KEY;

    const store = await import('@/infrastructure/persistence/backendStore');

    await expect(
      store.enqueueOutboxJobs([
        {
          submissionId: 'guide_1',
          provider: 'email.guide',
          payload: { event: { id: 'evt-1' } },
        },
      ]),
    ).rejects.toThrow('backend_outbox_jobs');

    await expect(store.claimDueOutboxJobs(5)).rejects.toThrow(
      'backend_outbox_jobs',
    );
  });
});
