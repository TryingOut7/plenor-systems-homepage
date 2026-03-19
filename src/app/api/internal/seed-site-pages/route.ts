import { NextRequest, NextResponse } from 'next/server';
import { seedSitePages } from '@/payload/seed/seedSitePages';

function readBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const expectedSecret = process.env.PAYLOAD_SEED_SECRET || process.env.PAYLOAD_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 },
    );
  }

  const providedToken = readBearerToken(request);
  if (!providedToken || providedToken !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await seedSitePages();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Seed failed:', error);
    return NextResponse.json(
      { error: 'Seed failed' },
      { status: 500 },
    );
  }
}
