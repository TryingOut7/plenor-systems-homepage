import { fail } from '@/application/shared/serviceResult';
import {
  getRegistrationSubmission,
  updateRegistrationStatus,
} from '@/application/org-site/registrationAdminService';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';
import { readJsonBody, toRequestContext } from '@/infrastructure/http/nextRequestAdapter';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import { requireBackendApiRole } from '@/infrastructure/http/backendApiRouteGuard';
import {
  buildIdempotencyFingerprint,
  getIdempotencyReplay,
  storeIdempotencyResult,
} from '@/infrastructure/persistence/idempotencyService';
import { authenticateBackendApiKey } from '@/infrastructure/security/backendApiKeyAuth';
import { checkRateLimit } from '@/infrastructure/security/rateLimiter';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;
  const proxied = await proxyRequestToBackend(
    request,
    `/v1/admin/registration-submissions/${publicId}`,
  );
  if (proxied) {
    return proxied;
  }

  const authError = requireBackendApiRole(request, ['admin']);
  if (authError) {
    return authError;
  }

  const context = toRequestContext(request);
  const rateLimitError = await checkRateLimit(context);
  if (rateLimitError) {
    return toJsonResponse(rateLimitError);
  }

  const result = await getRegistrationSubmission(context, publicId);
  return toJsonResponse(result);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;
  const proxied = await proxyRequestToBackend(
    request,
    `/v1/admin/registration-submissions/${publicId}`,
  );
  if (proxied) {
    return proxied;
  }

  const authError = requireBackendApiRole(request, ['admin']);
  if (authError) {
    return authError;
  }

  const context = toRequestContext(request);
  const rateLimitError = await checkRateLimit(context);
  if (rateLimitError) {
    return toJsonResponse(rateLimitError);
  }

  const idempotencyKey = request.headers.get('idempotency-key')?.trim();
  if (!idempotencyKey) {
    return toJsonResponse(
      fail(400, {
        code: 'MISSING_IDEMPOTENCY_KEY',
        message: 'Idempotency-Key header is required.',
        requestId: context.requestId,
      }),
    );
  }

  const body = await readJsonBody(request);
  const routePath = `/v1/admin/registration-submissions/${publicId}`;
  const fingerprint = buildIdempotencyFingerprint({
    route: routePath,
    body,
  });

  const replay = await getIdempotencyReplay({
    route: routePath,
    key: idempotencyKey,
    fingerprint,
  });

  if (replay?.kind === 'mismatch') {
    return toJsonResponse(
      fail(409, {
        code: 'IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD',
        message: 'Idempotency key has already been used with a different payload.',
        requestId: context.requestId,
      }),
    );
  }

  if (replay?.kind === 'replay') {
    const replayHeaders = new Headers(replay.headers || {});
    replayHeaders.set('x-idempotent-replay', 'true');
    return NextResponse.json(replay.body, {
      status: replay.status,
      headers: replayHeaders,
    });
  }

  const principal = authenticateBackendApiKey(request.headers.get('x-api-key'));
  const result = await updateRegistrationStatus(context, publicId, body, {
    role: 'admin',
    keyId: principal?.keyId || 'admin-default',
  });

  await storeIdempotencyResult({
    route: routePath,
    key: idempotencyKey,
    fingerprint,
    status: result.status,
    body: result.body,
    headers: result.headers,
  });

  return toJsonResponse(result);
}
