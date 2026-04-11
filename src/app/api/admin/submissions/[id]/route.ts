import {
  getAdminSubmissionById,
  updateAdminSubmissionWorkflowStatus,
} from '@/application/admin/submissionsService';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';
import { readJsonBody, toRequestContext } from '@/infrastructure/http/nextRequestAdapter';
import { requireBackendApiRole } from '@/infrastructure/http/backendApiRouteGuard';
import { toJsonResponse } from '@/infrastructure/http/nextResponseAdapter';
import { checkRateLimit } from '@/infrastructure/security/rateLimiter';
import { NextResponse, type NextRequest } from 'next/server';
import type { InquiryWorkflowStatus } from '@plenor/contracts/admin-submissions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolved = await params;
  const proxied = await proxyRequestToBackend(
    request,
    `/v1/admin/submissions/${resolved.id}`,
  );
  if (proxied) {
    return proxied;
  }

  const authError = requireBackendApiRole(request, ['admin']);
  if (authError) {
    return authError;
  }

  const rateLimitError = await checkRateLimit(toRequestContext(request));
  if (rateLimitError) {
    return toJsonResponse(rateLimitError);
  }

  const result = await getAdminSubmissionById(resolved.id);
  return toJsonResponse(result);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolved = await params;
  const proxied = await proxyRequestToBackend(
    request,
    `/v1/admin/submissions/${resolved.id}`,
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

  const body = await readJsonBody(request);
  const workflowStatus =
    body && typeof body === 'object'
      ? ((body as Record<string, unknown>).workflowStatus as InquiryWorkflowStatus | undefined)
      : undefined;

  if (
    workflowStatus !== 'submitted' &&
    workflowStatus !== 'under_review' &&
    workflowStatus !== 'responded' &&
    workflowStatus !== 'closed'
  ) {
    return NextResponse.json(
      {
        message:
          'workflowStatus must be submitted, under_review, responded, or closed.',
      },
      { status: 400 },
    );
  }

  const result = await updateAdminSubmissionWorkflowStatus({
    submissionId: resolved.id,
    workflowStatus,
  });
  return toJsonResponse(result);
}
