import { authenticateBackendApiKey, hasRequiredRole } from '@/infrastructure/security/backendApiKeyAuth';
import type { BackendRole } from '@plenor/contracts/auth';
import type { BackendErrorCode, BackendErrorResponse } from '@plenor/contracts/errors';
import { NextResponse, type NextRequest } from 'next/server';

interface GuardFailure {
  status: 401 | 403;
  code: Extract<BackendErrorCode, 'UNAUTHORIZED' | 'FORBIDDEN'>;
  message: string;
}

function buildAuthErrorResponse(
  request: NextRequest,
  failure: GuardFailure,
): NextResponse<BackendErrorResponse> {
  const requestId = request.headers.get('x-request-id') || undefined;
  const body: BackendErrorResponse = {
    success: false,
    status: failure.status,
    code: failure.code,
    message: failure.message,
    error: failure.message,
    requestId,
  };

  return NextResponse.json(body, { status: failure.status });
}

export function requireBackendApiRole(
  request: NextRequest,
  allowedRoles: BackendRole[],
): NextResponse<BackendErrorResponse> | null {
  const principal = authenticateBackendApiKey(request.headers.get('x-api-key'));
  if (!principal) {
    return buildAuthErrorResponse(request, {
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Missing or invalid API key.',
    });
  }

  if (!hasRequiredRole(principal, allowedRoles)) {
    return buildAuthErrorResponse(request, {
      status: 403,
      code: 'FORBIDDEN',
      message: 'API key does not have required role.',
    });
  }

  return null;
}
