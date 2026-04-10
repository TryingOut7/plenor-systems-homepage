import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { disableDraftModeForRequest } from '@/application/draft-mode/disableDraftModeService';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const referer = request.headers.get('referer');
  const returnTo = request.nextUrl.searchParams.get('returnTo');
  const { redirectTo } = disableDraftModeForRequest(returnTo, referer);
  (await draftMode()).disable();
  redirect(redirectTo);
}
