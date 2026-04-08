import { submitPaymentConfirmation } from '@/application/org-site/registrationSubmissionService';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';
import { readJsonBody, toRequestContext } from '@/infrastructure/http/nextRequestAdapter';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import type { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;
  const proxied = await proxyRequestToBackend(
    request,
    `/v1/forms/registration/${publicId}/payment-confirmation`,
  );
  if (proxied) {
    return proxied;
  }

  const body = await readJsonBody(request);
  const result = await submitPaymentConfirmation(toRequestContext(request), publicId, body);
  return toJsonResponse(result);
}
