import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { disableDraftModeForRequest } from '@/application/draft-mode/disableDraftModeService';

export async function GET() {
  const { redirectTo } = disableDraftModeForRequest();
  (await draftMode()).disable();
  redirect(redirectTo);
}
