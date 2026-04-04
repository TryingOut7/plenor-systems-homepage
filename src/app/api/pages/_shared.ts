import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { TypedUser } from 'payload';
import { inferWorkspaceErrorStatus } from '@/application/workspaces/workspaceErrorStatus';
import { getPayloadRouteSession } from '@/infrastructure/http/payloadRouteAuth';

export async function requirePresetCreatorUser(request: NextRequest): Promise<{
  errorResponse: NextResponse | null;
  payload: Awaited<ReturnType<typeof getPayloadRouteSession>>['payload'];
  user: TypedUser | null;
}> {
  const { payload, user, role } = await getPayloadRouteSession(request);

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

export async function requireWorkspaceUser(request: NextRequest): Promise<{
  errorResponse: NextResponse | null;
  payload: Awaited<ReturnType<typeof getPayloadRouteSession>>['payload'];
  user: TypedUser | null;
}> {
  const { payload, user, role } = await getPayloadRouteSession(request);

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

  if (!['admin', 'editor', 'author'].includes(role)) {
    return {
      payload,
      user: null,
      errorResponse: NextResponse.json(
        { success: false, message: 'Insufficient permissions.' },
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

export function toApiErrorResponse(error: unknown, defaultMessage = 'Operation failed.'): NextResponse {
  const message = error instanceof Error ? error.message : defaultMessage;
  const status = inferWorkspaceErrorStatus(message);
  return NextResponse.json({ success: false, message }, { status });
}
