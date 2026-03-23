import { NextRequest, NextResponse } from 'next/server';

function normalizeBackendBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

function createProxyHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');
  return headers;
}

export async function proxyRequestToBackend(
  request: NextRequest,
  backendPath: string,
): Promise<NextResponse | null> {
  const backendBase = process.env.BACKEND_INTERNAL_URL?.trim();
  if (!backendBase) {
    return null;
  }

  const targetUrl = new URL(backendPath.replace(/^\//, ''), normalizeBackendBaseUrl(backendBase));
  targetUrl.search = request.nextUrl.search;

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
    console.error('Backend proxy failed, falling back to local service:', error);
    return null;
  }
}
