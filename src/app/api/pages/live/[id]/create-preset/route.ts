import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createPresetFromLivePage } from '@/application/workspaces/workspaceMutationService';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';
import { createPayloadWorkspaceMutationRepository } from '@/infrastructure/workspaces/payloadWorkspaceMutationRepository';
import { readJsonBody, requirePresetCreatorUser, toApiErrorResponse } from '../../../_shared';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolvedParams = await params;
  const proxied = await proxyRequestToBackend(
    request,
    `/v1/pages/live/${resolvedParams.id}/create-preset`,
  );
  if (proxied) {
    return proxied;
  }

  const { payload, user, errorResponse } = await requirePresetCreatorUser(request);
  if (errorResponse || !user) return errorResponse as NextResponse;

  const body = await readJsonBody(request);

  try {
    const repository = createPayloadWorkspaceMutationRepository({ payload, user });
    const preset = await createPresetFromLivePage(repository, {
      livePageId: resolvedParams.id,
      presetMeta: body,
    });

    return NextResponse.json({
      success: true,
      preset,
    });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
