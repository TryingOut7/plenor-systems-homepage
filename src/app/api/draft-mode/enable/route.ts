import { createClient } from 'next-sanity';
import { defineEnableDraftMode } from 'next-sanity/draft-mode';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = '2024-01-01';
const token = process.env.SANITY_API_READ_TOKEN;

const enableDraftModeGet =
  projectId && token
    ? defineEnableDraftMode({
        client: createClient({
          projectId,
          dataset,
          apiVersion,
          useCdn: false,
          token,
        }),
      }).GET
    : null;

export async function GET(request: Request) {
  if (!projectId) {
    return new Response('NEXT_PUBLIC_SANITY_PROJECT_ID is not set', { status: 500 });
  }
  if (!token) {
    return new Response('SANITY_API_READ_TOKEN is not set', { status: 500 });
  }
  if (!enableDraftModeGet) {
    return new Response('Draft mode route is not configured', { status: 500 });
  }
  return enableDraftModeGet(request);
}
