/**
 * POST /api/internal/revalidate
 *
 * On-demand ISR cache purge. Accepts a JSON body:
 *   { paths?: string[], tags?: string[], all?: boolean }
 *
 * Protected by CRON_SECRET (same secret used for Vercel Cron jobs).
 * In production, requests must include: Authorization: Bearer <CRON_SECRET>
 *
 * Examples:
 *   { "paths": ["/", "/about"] }          — revalidate specific pages
 *   { "tags": ["site-pages"] }             — revalidate by cache tag
 *   { "all": true }                        — revalidate entire site
 */
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const ALL_FRONTEND_PATHS = [
  '/',
  '/about',
  '/services',
  '/pricing',
  '/contact',
  '/privacy',
  '/blog',
  '/sitemap.xml',
  '/robots.txt',
];

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization');
    const expected = `Bearer ${process.env.CRON_SECRET}`;
    if (!process.env.CRON_SECRET || authHeader !== expected) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  let body: { paths?: string[]; tags?: string[]; all?: boolean } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const revalidated: string[] = [];

  if (body.all) {
    for (const path of ALL_FRONTEND_PATHS) {
      revalidatePath(path);
      revalidated.push(`path:${path}`);
    }
    // Revalidate dynamic route templates.
    revalidatePath('/[...slug]', 'page');
    revalidatePath('/services/[slug]', 'page');
    revalidatePath('/blog/[slug]', 'page');
    revalidated.push('path:/[...slug]', 'path:/services/[slug]', 'path:/blog/[slug]');
  } else {
    for (const path of body.paths ?? []) {
      if (typeof path === 'string' && path.startsWith('/')) {
        revalidatePath(path);
        revalidated.push(`path:${path}`);
      }
    }
    for (const tag of body.tags ?? []) {
      if (typeof tag === 'string' && tag.trim()) {
        // @ts-expect-error Next.js 16 types incorrectly demand a second profile argument
        revalidateTag(tag.trim());
        revalidated.push(`tag:${tag.trim()}`);
      }
    }
  }

  return NextResponse.json({ success: true, revalidated });
}
