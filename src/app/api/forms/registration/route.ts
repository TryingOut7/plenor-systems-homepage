import { submitRegistration } from '@/application/org-site/registrationSubmissionService';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';
import { readJsonBody, toRequestContext } from '@/infrastructure/http/nextRequestAdapter';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const proxied = await proxyRequestToBackend(request, '/v1/forms/registration');
  if (proxied) {
    return proxied;
  }

  const body = await readJsonBody(request);
  const result = await submitRegistration(toRequestContext(request), body);
  return toJsonResponse(result);
}
