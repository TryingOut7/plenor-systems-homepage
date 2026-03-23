import { submitGuideForm } from '@/application/forms/guideSubmissionService';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';
import { toRequestContext, readJsonBody } from '@/infrastructure/http/nextRequestAdapter';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const proxied = await proxyRequestToBackend(req, '/v1/forms/guide');
  if (proxied) {
    return proxied;
  }

  const [context, body] = [toRequestContext(req), await readJsonBody(req)];
  const result = await submitGuideForm(context, body);
  return toJsonResponse(result);
}
