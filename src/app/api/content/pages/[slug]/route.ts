import { getContentPageBySlug } from '@/application/content/pageContentService';
import { payloadContentRepository } from '@/infrastructure/cms/contentGateway';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';
import { toRequestContext } from '@/infrastructure/http/nextRequestAdapter';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import type { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const resolved = await params;
  const encodedSlug = encodeURIComponent(resolved.slug);
  const proxied = await proxyRequestToBackend(
    request,
    `/v1/content/pages/${encodedSlug}`,
  );
  if (proxied) {
    return proxied;
  }

  const result = await getContentPageBySlug(
    toRequestContext(request),
    resolved.slug,
    payloadContentRepository,
  );
  return toJsonResponse(result);
}
