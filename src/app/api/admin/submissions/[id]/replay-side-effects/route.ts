import { replaySubmissionSideEffects } from '@/application/admin/submissionsService';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';
import { toRequestContext } from '@/infrastructure/http/nextRequestAdapter';
import { requireBackendApiRole } from '@/infrastructure/http/backendApiRouteGuard';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import { checkRateLimit } from '@/infrastructure/security/rateLimiter';
import type { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolved = await params;
  const proxied = await proxyRequestToBackend(
    request,
    `/v1/admin/submissions/${resolved.id}/replay-side-effects`,
  );
  if (proxied) {
    return proxied;
  }

  const authError = requireBackendApiRole(request, ['admin']);
  if (authError) {
    return authError;
  }

  const rateLimitError = checkRateLimit(toRequestContext(request));
  if (rateLimitError) {
    return toJsonResponse(rateLimitError);
  }

  const result = await replaySubmissionSideEffects(resolved.id);
  return toJsonResponse(result);
}
