import { seedSitePagesForRequest } from '@/application/internal/seedSitePagesService';
import { payloadSeedRepository } from '@/infrastructure/cms/seedGateway';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';
import { toRequestContext } from '@/infrastructure/http/nextRequestAdapter';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const proxied = await proxyRequestToBackend(request, '/v1/internal/seed-site-pages');
  if (proxied) {
    return proxied;
  }

  const result = await seedSitePagesForRequest(
    toRequestContext(request),
    payloadSeedRepository,
  );
  return toJsonResponse(result);
}
