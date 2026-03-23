import { createHash } from 'node:crypto';
import {
  readIdempotencyRecord,
  writeIdempotencyRecord,
} from '@/infrastructure/persistence/backendStore';

function canonicalize(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalize(entry)).join(',')}]`;
  }

  const object = value as Record<string, unknown>;
  const keys = Object.keys(object).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${canonicalize(object[key])}`)
    .join(',')}}`;
}

export function buildIdempotencyFingerprint(input: {
  route: string;
  body: unknown;
}): string {
  const source = `${input.route}::${canonicalize(input.body)}`;
  return createHash('sha256').update(source).digest('hex');
}

export async function getIdempotencyReplay(input: {
  route: string;
  key: string;
  fingerprint: string;
}): Promise<
  | {
      kind: 'replay';
      status: number;
      body: unknown;
      headers?: Record<string, string>;
    }
  | {
      kind: 'mismatch';
    }
  | null
> {
  const existing = await readIdempotencyRecord({
    route: input.route,
    key: input.key,
  });

  if (!existing) {
    return null;
  }

  if (existing.fingerprint !== input.fingerprint) {
    return {
      kind: 'mismatch',
    };
  }

  return {
    kind: 'replay',
    status: existing.status,
    body: existing.body,
    headers: existing.headers,
  };
}

export async function storeIdempotencyResult(input: {
  route: string;
  key: string;
  fingerprint: string;
  status: number;
  body: unknown;
  headers?: Record<string, string>;
}): Promise<void> {
  await writeIdempotencyRecord({
    route: input.route,
    key: input.key,
    fingerprint: input.fingerprint,
    status: input.status,
    body: input.body,
    headers: input.headers,
    createdAt: new Date().toISOString(),
  });
}
