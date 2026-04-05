import { describe, expect, it } from 'vitest';
import {
  buildIdempotencyFingerprint,
  getIdempotencyReplay,
  storeIdempotencyResult,
} from '@/infrastructure/persistence/idempotencyService';

describe('idempotency service', () => {
  it('builds stable fingerprints for equivalent JSON payloads', () => {
    const first = buildIdempotencyFingerprint({
      route: '/v1/forms/guide',
      body: { b: 2, a: 1, nested: { y: 2, x: 1 } },
    });
    const second = buildIdempotencyFingerprint({
      route: '/v1/forms/guide',
      body: { a: 1, nested: { x: 1, y: 2 }, b: 2 },
    });

    expect(first).toBe(second);
  });

  it('replays saved response for matching key and payload', async () => {
    const route = '/v1/forms/guide';
    const key = `replay-key-${Date.now()}`;
    const fingerprint = buildIdempotencyFingerprint({
      route,
      body: { name: 'Alice', email: 'alice@example.com' },
    });

    await storeIdempotencyResult({
      route,
      key,
      fingerprint,
      status: 200,
      body: { success: true },
    });

    const replay = await getIdempotencyReplay({
      route,
      key,
      fingerprint,
    });

    expect(replay?.kind).toBe('replay');
    if (replay?.kind === 'replay') {
      expect(replay.status).toBe(200);
      expect(replay.body).toEqual({ success: true });
    }
  });

  it('returns mismatch when same key is reused with different payload', async () => {
    const route = '/v1/forms/inquiry';
    const key = `mismatch-key-${Date.now()}`;
    const firstFingerprint = buildIdempotencyFingerprint({
      route,
      body: { name: 'Alice', email: 'alice@example.com' },
    });
    const secondFingerprint = buildIdempotencyFingerprint({
      route,
      body: { name: 'Bob', email: 'bob@example.com' },
    });

    await storeIdempotencyResult({
      route,
      key,
      fingerprint: firstFingerprint,
      status: 200,
      body: { success: true },
    });

    const replay = await getIdempotencyReplay({
      route,
      key,
      fingerprint: secondFingerprint,
    });

    expect(replay?.kind).toBe('mismatch');
  });
});
