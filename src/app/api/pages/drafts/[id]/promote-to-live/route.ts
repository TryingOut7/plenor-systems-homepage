import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { promoteDraftToLive } from '@/payload/workspaces/draftPromotion';
import { requirePresetCreatorUser, toApiErrorResponse } from '../../../_shared';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { payload, user, errorResponse } = await requirePresetCreatorUser(request);
  if (errorResponse || !user) return errorResponse as NextResponse;

  const resolvedParams = await params;

  try {
    const result = await promoteDraftToLive({
      payload,
      draftId: resolvedParams.id,
      user,
    });

    return NextResponse.json({
      success: true,
      livePage: result,
    });
  } catch (error) {
    return toApiErrorResponse(error, 'Failed to promote draft to live.');
  }
}
