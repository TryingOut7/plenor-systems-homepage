/**
 * GET /api/forms/[id]
 *
 * Intercepts Payload's catch-all REST handler for individual form lookups and
 * wraps the query with an explicit 8-second timeout plus a shouldSkipPayload()
 * guard. Without this, FormRenderer's client-side fetch blocks on pg-pool's
 * 30-second connectionTimeoutMillis when the database connection pool is
 * exhausted on Vercel (pool max=1), causing visible hangs on the public site.
 *
 * Next.js resolves more-specific dynamic segments ([id]) before catch-all
 * routes ([[...slug]]), so this file takes precedence over Payload's REST
 * handler for GET /api/forms/:id. POST / PATCH / DELETE are not implemented
 * here and continue to be handled by Payload's catch-all.
 */
import { NextResponse } from 'next/server';
import { getPayload } from '@/payload/client';
import { markPayloadFailure, shouldSkipPayload } from '@/payload/cms/cache';

const FORM_QUERY_TIMEOUT_MS = 8000;

async function withFormTimeout<T>(promise: Promise<T>): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutHandle = setTimeout(
          () => reject(new Error(`Form query timeout after ${FORM_QUERY_TIMEOUT_MS}ms`)),
          FORM_QUERY_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (shouldSkipPayload()) {
    return new NextResponse(null, { status: 503 });
  }

  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    return new NextResponse(null, { status: 400 });
  }

  const url = new URL(req.url);
  const depth = Math.max(0, parseInt(url.searchParams.get('depth') ?? '1', 10));

  try {
    const payload = await getPayload();
    const form = await withFormTimeout(
      payload.findByID({
        collection: 'forms',
        id,
        depth,
        overrideAccess: true,
      }),
    );
    return NextResponse.json(form);
  } catch {
    markPayloadFailure();
    return new NextResponse(null, { status: 503 });
  }
}
