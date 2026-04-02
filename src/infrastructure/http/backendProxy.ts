import { NextRequest, NextResponse } from 'next/server';
import type { BackendErrorResponse } from '@plenor/contracts/errors';

function normalizeBackendBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

function createProxyHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');
  return headers;
}

function backendUnavailableResponse(
  request: NextRequest,
  details?: Record<string, unknown>,
): NextResponse<BackendErrorResponse> {
  const requestId = request.headers.get('x-request-id') || undefined;
  const message = 'Backend service is unavailable. Please retry shortly.';

  return NextResponse.json(
    {
      success: false,
      status: 503,
      code: 'BACKEND_UNAVAILABLE',
      message,
      error: message,
      requestId,
      ...(details ? { details } : {}),
    },
    { status: 503 },
  );
}

export async function proxyRequestToBackend(
  request: NextRequest,
  backendPath: string,
): Promise<NextResponse | null> {
  const backendBase = process.env.BACKEND_INTERNAL_URL?.trim();
  if (!backendBase) {
    return null;
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(
      backendPath.replace(/^\//, ''),
      normalizeBackendBaseUrl(backendBase),
    );
    targetUrl.search = request.nextUrl.search;
  } catch (error) {
    console.error('Invalid BACKEND_INTERNAL_URL configuration:', error);
    return backendUnavailableResponse(request, {
      reason: 'invalid_backend_internal_url',
    });
  }

  try {
    const body =
      request.method === 'GET' || request.method === 'HEAD'
        ? undefined
        : await request.text();

    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: createProxyHeaders(request),
      body,
      signal: AbortSignal.timeout(15_000),
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('transfer-encoding');
    responseHeaders.delete('content-encoding');

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Backend proxy failed; returning fail-closed response:', error);
    return backendUnavailableResponse(request, {
      reason: 'proxy_request_failed',
    });
  }
}
