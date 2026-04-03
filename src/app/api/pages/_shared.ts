import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { TypedUser } from 'payload';
import { getPayload } from '@/payload/client';

type UserRecord = Record<string, unknown>;

function resolveUserRole(user: unknown): string {
  if (!user || typeof user !== 'object') return '';
  const role = (user as UserRecord).role;
  return typeof role === 'string' ? role : '';
}

export async function requirePresetCreatorUser(request: NextRequest): Promise<{
  errorResponse: NextResponse | null;
  payload: Awaited<ReturnType<typeof getPayload>>;
  user: TypedUser | null;
}> {
  const payload = await getPayload();
  const authResult = await payload.auth({ headers: request.headers });
  const user = authResult.user as TypedUser | null;

  if (!user) {
    return {
      payload,
      user: null,
      errorResponse: NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 },
      ),
    };
  }

  const role = resolveUserRole(user);
  if (!['admin', 'editor'].includes(role)) {
    return {
      payload,
      user: null,
      errorResponse: NextResponse.json(
        { success: false, message: 'Only admins and editors can create presets.' },
        { status: 403 },
      ),
    };
  }

  return {
    payload,
    user,
    errorResponse: null,
  };
}

export async function readJsonBody(request: NextRequest): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) return {};
    return body as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function toApiErrorResponse(error: unknown): NextResponse {
  const message = error instanceof Error ? error.message : 'Failed to create preset.';
  const lowered = message.toLowerCase();
  const status = lowered.includes('not found') ? 404 : 400;
  return NextResponse.json({ success: false, message }, { status });
}
