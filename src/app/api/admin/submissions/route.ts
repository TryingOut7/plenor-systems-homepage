import { listAdminSubmissions } from '@/application/admin/submissionsService';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';
import { toRequestContext } from '@/infrastructure/http/nextRequestAdapter';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import { requireBackendApiRole } from '@/infrastructure/http/backendApiRouteGuard';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const proxied = await proxyRequestToBackend(request, '/v1/admin/submissions');
  if (proxied) {
    return proxied;
  }

  const authError = requireBackendApiRole(request, ['admin']);
  if (authError) {
    return authError;
  }

  const result = await listAdminSubmissions(toRequestContext(request));
  return toJsonResponse(result);
}
