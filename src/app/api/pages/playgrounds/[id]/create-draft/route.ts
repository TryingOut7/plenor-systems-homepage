import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createDraftFromPlayground } from '@/application/workspaces/workspaceMutationService';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';
import { createPayloadWorkspaceMutationRepository } from '@/infrastructure/workspaces/payloadWorkspaceMutationRepository';
import { readJsonBody, requireWorkspaceUser, toApiErrorResponse } from '../../../_shared';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolvedParams = await params;
  const proxied = await proxyRequestToBackend(
    request,
    `/v1/pages/playgrounds/${resolvedParams.id}/create-draft`,
  );
  if (proxied) {
    return proxied;
  }

  const { payload, user, errorResponse } = await requireWorkspaceUser(request);
  if (errorResponse || !user) return errorResponse as NextResponse;

  const body = await readJsonBody(request);

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const targetSlug = typeof body.targetSlug === 'string' ? body.targetSlug.trim() : '';

  if (!targetSlug) {
    return NextResponse.json(
      { success: false, message: 'targetSlug is required.' },
      { status: 400 },
    );
  }

  try {
    const repository = createPayloadWorkspaceMutationRepository({ payload, user });
    const draft = await createDraftFromPlayground(repository, {
      playgroundId: resolvedParams.id,
      title,
      targetSlug,
    });

    return NextResponse.json({
      success: true,
      draft,
    });
  } catch (error) {
    return toApiErrorResponse(error, 'Failed to create draft.');
  }
}
