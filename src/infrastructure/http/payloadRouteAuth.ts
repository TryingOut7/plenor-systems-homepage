import type { NextRequest } from 'next/server';
import type { TypedUser } from 'payload';
import { getPayloadClient, type PayloadClient } from '@/infrastructure/payload/payloadClientProvider';

type UserRecord = Record<string, unknown>;
type HeaderRecord = Record<string, string | string[] | undefined>;

export type PayloadRouteSession = {
  payload: PayloadClient;
  role: string;
  user: TypedUser | null;
};

function resolveUserRole(user: unknown): string {
  if (!user || typeof user !== 'object') return '';
  const role = (user as UserRecord).role;
  return typeof role === 'string' ? role : '';
}

function toHeaders(input: Headers | HeaderRecord): Headers {
  if (input instanceof Headers) return input;

  const headers = new Headers();
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string') {
      headers.set(key, value);
      continue;
    }
    if (Array.isArray(value)) {
      for (const entry of value) {
        headers.append(key, entry);
      }
    }
  }
  return headers;
}

export async function getPayloadSessionFromHeaders(
  headersInput: Headers | HeaderRecord,
): Promise<PayloadRouteSession> {
  const payload = await getPayloadClient();
  const authResult = await payload.auth({ headers: toHeaders(headersInput) });
  const user = authResult.user as TypedUser | null;

  return {
    payload,
    user,
    role: resolveUserRole(user),
  };
}

export async function getPayloadRouteSession(
  request: NextRequest,
): Promise<PayloadRouteSession> {
  return getPayloadSessionFromHeaders(request.headers);
}
