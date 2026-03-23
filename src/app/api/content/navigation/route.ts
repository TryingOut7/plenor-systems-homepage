import { getContentNavigation } from '@/application/content/pageContentService';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';
import { toRequestContext } from '@/infrastructure/http/nextRequestAdapter';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const proxied = await proxyRequestToBackend(request, '/v1/content/navigation');
  if (proxied) {
    return proxied;
  }

  const result = await getContentNavigation(toRequestContext(request));
  return toJsonResponse(result);
}
