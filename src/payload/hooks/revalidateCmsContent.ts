/**
 * Calls Next.js on-demand ISR revalidation after CMS content changes.
 *
 * Must be called from within a Payload hook that runs during a Next.js
 * route handler (e.g. the Payload API route). Wrapped in try/catch so a
 * failure here never blocks the CMS save.
 */

import { invalidateCmsCollectionCaches } from '../cms/cache.ts';

type CollectionSlug =
  | 'site-pages'
  | 'service-items'
  | 'blog-posts'
  | 'testimonials'
  | 'team-members'
  | 'logos'
  | 'redirect-rules';

async function safeRevalidatePath(path: string, type?: 'page' | 'layout'): Promise<void> {
  try {
    // Dynamic import so this file is safe to import in non-Next environments
    // (Payload CLI, seed scripts). The actual revalidatePath is only available
    // when running inside Next.js.
    const { revalidatePath } = await import('next/cache') as {
      revalidatePath: (path: string, type?: 'page' | 'layout') => void;
    };
    revalidatePath(path, type);
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("Cannot find module 'next/cache'") ||
        (err as any).code === 'MODULE_NOT_FOUND')
    ) {
      // Not in a Next.js context (Payload CLI, scripts) — skip dynamically
      return;
    }
    // eslint-disable-next-line no-console
    console.error(`[CMS Revalidation]: Failed to revalidate path "${path}"`, err);
  }
}

export async function revalidateCollectionContent(
  collectionSlug: CollectionSlug,
  doc: Record<string, unknown>,
  previousDoc: Record<string, unknown> | undefined,
): Promise<void> {
  const currentStatus = (doc.workflowStatus || doc._status) as string | undefined;
  const previousStatus = (previousDoc?.workflowStatus || previousDoc?._status) as string | undefined;

  // For redirect-rules, always revalidate because they apply globally.
  if (collectionSlug === 'redirect-rules') {
    await revalidateAllFrontendPages();
    return;
  }

  // For other collections, revalidate when publishing, unpublishing, or deleting a published item.
  const isPublishing = currentStatus === 'published';
  const wasAlreadyPublished = previousStatus === 'published';
  const isDeleting = currentStatus === undefined;

  if (!isPublishing && !wasAlreadyPublished && !isDeleting) return;

  // Clear in-process module-level caches so the next render doesn't serve
  // stale published data after an unpublish or delete.
  invalidateCmsCollectionCaches({ collectionSlug, doc, previousDoc });

  switch (collectionSlug) {
    case 'site-pages': {
      const slug = doc.slug as string | undefined;
      if (slug) {
        // Revalidate the specific CMS page.
        await safeRevalidatePath(slug === 'home' ? '/' : `/${slug}`, 'page');
        // Also clear the catch-all dynamic route.
        await safeRevalidatePath('/[...slug]', 'page');
      }
      // Sitemap may have changed.
      await safeRevalidatePath('/sitemap.xml');
      break;
    }
    case 'service-items': {
      const slug = doc.slug as string | undefined;
      if (slug) {
        await safeRevalidatePath(`/services/${slug}`, 'page');
      }
      // Services listing and any dynamic list sections showing service items.
      await safeRevalidatePath('/services', 'page');
      await safeRevalidatePath('/[...slug]', 'page');
      await safeRevalidatePath('/sitemap.xml');
      break;
    }
    case 'blog-posts': {
      const slug = doc.slug as string | undefined;
      if (slug) {
        await safeRevalidatePath(`/blog/${slug}`, 'page');
      }
      // Blog index and any dynamic list sections showing blog posts.
      await safeRevalidatePath('/blog', 'page');
      await safeRevalidatePath('/[...slug]', 'page');
      await safeRevalidatePath('/sitemap.xml');
      break;
    }
    case 'testimonials':
    case 'team-members':
    case 'logos': {
      // These appear in dynamic list sections or team/logo sections across pages.
      if (!wasAlreadyPublished) {
        await revalidateAllFrontendPages();
      } else {
        // Already published — targeted revalidation of pages most likely to show them.
        await safeRevalidatePath('/', 'page');
        await safeRevalidatePath('/about', 'page');
        await safeRevalidatePath('/[...slug]', 'page');
      }
      break;
    }
    default:
      break;
  }
}

export async function revalidateGlobalContent(): Promise<void> {
  // Any global change (site-settings, ui-settings) affects the shared layout
  // rendered on every page, so revalidate everything.
  await revalidateAllFrontendPages();
}

async function revalidateAllFrontendPages(): Promise<void> {
  await safeRevalidatePath('/', 'layout');
  await safeRevalidatePath('/about', 'page');
  await safeRevalidatePath('/services', 'page');
  await safeRevalidatePath('/pricing', 'page');
  await safeRevalidatePath('/contact', 'page');
  await safeRevalidatePath('/privacy', 'page');
  await safeRevalidatePath('/[...slug]', 'page');
  await safeRevalidatePath('/services/[slug]', 'page');
  await safeRevalidatePath('/blog', 'page');
  await safeRevalidatePath('/blog/[slug]', 'page');
  await safeRevalidatePath('/sitemap.xml');
  await safeRevalidatePath('/robots.txt');
}
