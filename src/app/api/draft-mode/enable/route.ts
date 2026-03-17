import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // Require a secret to prevent unauthorised preview activation.
  // Set SANITY_PREVIEW_SECRET in your environment to match the secret
  // configured in your Sanity project's preview URL.
  const secret = searchParams.get('secret');
  const previewSecret = process.env.SANITY_PREVIEW_SECRET;

  if (!previewSecret) {
    return new Response('SANITY_PREVIEW_SECRET is not set', { status: 500 });
  }

  if (secret !== previewSecret) {
    return new Response('Invalid preview secret', { status: 401 });
  }

  // Also require a read token to actually fetch draft content
  if (!process.env.SANITY_API_READ_TOKEN) {
    return new Response('SANITY_API_READ_TOKEN is not set', { status: 500 });
  }

  (await draftMode()).enable();

  const redirectTo = searchParams.get('redirect') || '/';
  redirect(redirectTo);
}
