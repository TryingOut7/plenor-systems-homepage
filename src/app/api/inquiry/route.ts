import { submitInquiryForm } from '@/application/forms/inquirySubmissionService';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';
import { toRequestContext, readJsonBody } from '@/infrastructure/http/nextRequestAdapter';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const proxied = await proxyRequestToBackend(req, '/v1/forms/inquiry');
  if (proxied) {
    return proxied;
  }

  const [context, body] = [toRequestContext(req), await readJsonBody(req)];
  const result = await submitInquiryForm(context, body);
  return toJsonResponse(result);
}
