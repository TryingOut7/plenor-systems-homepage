import { submitGuideForm } from '@/application/forms/guideSubmissionService';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';
import { toRequestContext, readJsonBody } from '@/infrastructure/http/nextRequestAdapter';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

async function shouldRetryGuideLocally(response: NextResponse): Promise<boolean> {
  if (response.status !== 400) return false;

  const body = await response
    .clone()
    .json()
    .catch(() => null) as Record<string, unknown> | null;
  const message = typeof body?.message === 'string' ? body.message : '';

  return /field is invalid:\s*formid/i.test(message);
}

export async function POST(req: NextRequest) {
  const proxied = await proxyRequestToBackend(req, '/v1/forms/guide');
  if (proxied) {
    const retryLocally = await shouldRetryGuideLocally(proxied);
    if (!retryLocally) return proxied;

    console.warn(
      'Backend guide submission rejected formId field; retrying through local handler.',
    );
  }

  const [context, body] = [toRequestContext(req), await readJsonBody(req)];
  const result = await submitGuideForm(context, body);
  return toJsonResponse(result);
}
