import { getIntegrationStatus } from '@/application/integrations/integrationStatusService';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';
import { requireBackendApiRole } from '@/infrastructure/http/backendApiRouteGuard';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const proxied = await proxyRequestToBackend(request, '/v1/integrations/status');
  if (proxied) {
    return proxied;
  }

  const authError = requireBackendApiRole(request, ['internal', 'admin']);
  if (authError) {
    return authError;
  }

  return toJsonResponse(getIntegrationStatus());
}
