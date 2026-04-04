import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { promoteDraftToLive } from '@/application/workspaces/workspaceMutationService';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';
import { createPayloadWorkspaceMutationRepository } from '@/infrastructure/workspaces/payloadWorkspaceMutationRepository';
import { requirePresetCreatorUser, toApiErrorResponse } from '../../../_shared';

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
    return proxied;
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
