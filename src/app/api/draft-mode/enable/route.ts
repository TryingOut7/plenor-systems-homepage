import { draftMode } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { safeCompare } from '@/lib/timing-safe-equal';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const rlError = rateLimit(request);
  if (rlError) return rlError;

  const { secret, slug = '/' } = await request.json();

  if (typeof slug !== 'string' || !slug.startsWith('/') || slug.startsWith('//')) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }

  const expectedSecret = process.env.PAYLOAD_SECRET;
  if (!expectedSecret || !safeCompare(String(secret ?? ''), expectedSecret)) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  (await draftMode()).enable();
  return NextResponse.json({ ok: true, slug });
}
