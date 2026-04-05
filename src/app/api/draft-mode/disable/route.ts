import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { disableDraftModeForRequest } from '@/application/draft-mode/disableDraftModeService';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const referer = request.headers.get('referer');
  const { redirectTo } = disableDraftModeForRequest(referer);
  (await draftMode()).disable();
  redirect(redirectTo);
}
