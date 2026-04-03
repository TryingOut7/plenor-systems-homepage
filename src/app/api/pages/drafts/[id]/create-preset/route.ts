import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createPresetFromDraft } from '@/payload/workspaces/presetCreation';
import { readJsonBody, requirePresetCreatorUser, toApiErrorResponse } from '../../../_shared';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { payload, user, errorResponse } = await requirePresetCreatorUser(request);
  if (errorResponse || !user) return errorResponse as NextResponse;

  const resolvedParams = await params;
  const body = await readJsonBody(request);

  try {
    const preset = await createPresetFromDraft({
      payload,
      draftId: resolvedParams.id,
      presetMeta: body,
      user,
    });

    return NextResponse.json({
      success: true,
      preset,
    });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
