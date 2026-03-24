import { listAdminSubmissions } from '@/application/admin/submissionsService';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';
import { toRequestContext } from '@/infrastructure/http/nextRequestAdapter';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import { requireBackendApiRole } from '@/infrastructure/http/backendApiRouteGuard';
import { checkRateLimit } from '@/infrastructure/security/rateLimiter';
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

  const context = toRequestContext(request);
  const rateLimitError = checkRateLimit(context);
  if (rateLimitError) {
    return toJsonResponse(rateLimitError);
  }

  const result = await listAdminSubmissions(context);
  return toJsonResponse(result);
}
