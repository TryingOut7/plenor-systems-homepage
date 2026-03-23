import { draftMode } from 'next/headers';
import { enableDraftModeForRequest } from '@/application/draft-mode/enableDraftModeService';
import { toRequestContext, readJsonBody } from '@/infrastructure/http/nextRequestAdapter';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const [context, body] = [toRequestContext(request), await readJsonBody(request)];
  const result = enableDraftModeForRequest(context, body);

  if (result.status === 200) {
    (await draftMode()).enable();
  }

  return toJsonResponse(result);
}
