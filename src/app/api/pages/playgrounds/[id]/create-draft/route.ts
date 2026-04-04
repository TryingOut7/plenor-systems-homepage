import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createDraftFromPlayground } from '@/payload/workspaces/presetCreation';
import { readJsonBody, requireWorkspaceUser, toApiErrorResponse } from '../../../_shared';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { payload, user, errorResponse } = await requireWorkspaceUser(request);
  if (errorResponse || !user) return errorResponse as NextResponse;

  const resolvedParams = await params;
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
    const draft = await createDraftFromPlayground({
      payload,
      playgroundId: resolvedParams.id,
      title,
      targetSlug,
      user,
    });

    return NextResponse.json({
      success: true,
      draft,
    });
  } catch (error) {
    return toApiErrorResponse(error, 'Failed to create draft.');
  }
}
