import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug') || '/';

  if (!slug.startsWith('/') || slug.startsWith('//')) {
    return new Response('Invalid slug', { status: 400 });
  }

  // Simple secret-based draft mode activation
  const expectedSecret = process.env.PAYLOAD_SECRET;
  if (!expectedSecret || secret !== expectedSecret) {
    return new Response('Invalid secret', { status: 401 });
  }

  (await draftMode()).enable();
  redirect(slug);
}
