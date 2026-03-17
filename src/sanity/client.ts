import { createClient } from 'next-sanity';

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const apiVersion = '2024-01-01';

export const client = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
    })
  : null;

// Token-based client for draft mode — bypasses CDN and returns unpublished drafts.
// Requires SANITY_API_READ_TOKEN (a Sanity API token with at least "viewer" role).
const readToken = process.env.SANITY_API_READ_TOKEN;

export const previewClient =
  projectId && readToken
    ? createClient({
        projectId,
        dataset,
        apiVersion,
        useCdn: false,
        token: readToken,
        perspective: 'previewDrafts',
        stega: {
          enabled: true,
          studioUrl: '/studio',
        },
      })
    : null;

export async function sanityFetch<T>(
  query: string,
  {
    preview = false,
    params = {},
  }: { preview?: boolean; params?: Record<string, unknown> } = {}
): Promise<T | null> {
  const activeClient = preview && previewClient ? previewClient : client;
  if (!activeClient) return null;
  const fetchOptions = preview ? { cache: 'no-store' as const } : {};
  return activeClient.fetch<T>(query, params, fetchOptions).catch(() => null);
}
