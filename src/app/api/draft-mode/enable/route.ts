import { draftMode } from 'next/headers';
import { enableDraftModeForRequest } from '@/application/draft-mode/enableDraftModeService';
import { toRequestContext, readJsonBody } from '@/infrastructure/http/nextRequestAdapter';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const [context, body] = [toRequestContext(request), await readJsonBody(request)];
  const result = await enableDraftModeForRequest(context, body);

  if (result.status === 200) {
    (await draftMode()).enable();
  }

  return toJsonResponse(result);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const body = {
    secret: searchParams.get('secret') ?? undefined,
    slug: searchParams.get('slug') ?? undefined,
  };

  const result = await enableDraftModeForRequest(toRequestContext(request), body);
  if (result.status !== 200) {
    return toJsonResponse(result);
  }

  if (
    !result.body ||
    typeof result.body !== 'object' ||
    !('slug' in result.body) ||
    typeof result.body.slug !== 'string'
  ) {
    return toJsonResponse(result);
  }

  (await draftMode()).enable();
  return NextResponse.redirect(new URL(result.body.slug, request.nextUrl.origin));
}
