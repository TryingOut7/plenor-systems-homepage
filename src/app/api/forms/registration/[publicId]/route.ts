import { getRegistrationStatus } from '@/application/org-site/registrationSubmissionService';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';
import { toRequestContext } from '@/infrastructure/http/nextRequestAdapter';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import type { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;
  const proxied = await proxyRequestToBackend(request, `/v1/forms/registration/${publicId}`);
  if (proxied) {
    return proxied;
  }

  const result = await getRegistrationStatus(toRequestContext(request), publicId);
  return toJsonResponse(result);
}
