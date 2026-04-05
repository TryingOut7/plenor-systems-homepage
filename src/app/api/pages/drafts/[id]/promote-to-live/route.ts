import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { promoteDraftToLive } from '@/application/workspaces/workspaceMutationService';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';
import { createPayloadWorkspaceMutationRepository } from '@/infrastructure/workspaces/payloadWorkspaceMutationRepository';
import { requirePresetCreatorUser, toApiErrorResponse } from '../../../_shared';

async function shouldRetryPromotionLocally(response: NextResponse): Promise<boolean> {
  if (response.status !== 400) return false;

  const body = await response
    .clone()
    .json()
    .catch(() => null) as Record<string, unknown> | null;
  const message = typeof body?.message === 'string' ? body.message : '';

  return /field is invalid:\s*id/i.test(message);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolvedParams = await params;
  const proxied = await proxyRequestToBackend(
    request,
    `/v1/pages/drafts/${resolvedParams.id}/promote-to-live`,
  );
  if (proxied) {
    const fallbackToLocal = await shouldRetryPromotionLocally(proxied);
    if (!fallbackToLocal) return proxied;

    console.warn(
      'Backend promote-to-live returned invalid id validation; retrying through local Payload mutation path.',
    );
  }

  const { payload, user, errorResponse } = await requirePresetCreatorUser(request);
  if (errorResponse || !user) return errorResponse as NextResponse;

  try {
    const repository = createPayloadWorkspaceMutationRepository({ payload, user });
    const result = await promoteDraftToLive(repository, {
      draftId: resolvedParams.id,
    });

    return NextResponse.json({
      success: true,
      livePage: result,
    });
  } catch (error) {
    return toApiErrorResponse(error, 'Failed to promote draft to live.');
  }
}
