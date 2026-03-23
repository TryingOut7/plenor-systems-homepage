import { replaySubmissionSideEffects } from '@/application/admin/submissionsService';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';
import { requireBackendApiRole } from '@/infrastructure/http/backendApiRouteGuard';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import type { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolved = await params;
  const encodedId = encodeURIComponent(resolved.id);
  const proxied = await proxyRequestToBackend(
    request,
    `/v1/admin/submissions/${encodedId}/replay-side-effects`,
  );
  if (proxied) {
    return proxied;
  }

  const authError = requireBackendApiRole(request, ['admin']);
  if (authError) {
    return authError;
  }

  const result = await replaySubmissionSideEffects(resolved.id);
  return toJsonResponse(result);
}
