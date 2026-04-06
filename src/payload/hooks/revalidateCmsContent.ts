/**
 * Calls Next.js on-demand ISR revalidation after CMS content changes.
 *
 * Must be called from within a Payload hook that runs during a Next.js
 * route handler (e.g. the Payload API route). Wrapped in try/catch so a
 * failure here never blocks the CMS save.
 */

type CollectionSlug =
  | 'site-pages'
  | 'service-items'
  | 'blog-posts'
  | 'testimonials'
  | 'team-members'
  | 'logos'
  | 'redirect-rules';

function safeRevalidatePath(path: string, type?: 'page' | 'layout'): void {
  try {
    // Dynamic import so this file is safe to import in non-Next environments
    // (Payload CLI, seed scripts). The actual revalidatePath is only available
    // when running inside Next.js.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { revalidatePath } = require('next/cache') as {
      revalidatePath: (path: string, type?: 'page' | 'layout') => void;
    };
    revalidatePath(path, type);
  } catch {
    // Not in a Next.js context (CLI, tests) — skip silently.
  }
}

export function revalidateCollectionContent(
  collectionSlug: CollectionSlug,
  doc: Record<string, unknown>,
  previousDoc: Record<string, unknown> | undefined,
): void {
  const currentStatus = doc.workflowStatus as string | undefined;
  const previousStatus = previousDoc?.workflowStatus as string | undefined;

  // For redirect-rules, always revalidate because they apply globally.
  if (collectionSlug === 'redirect-rules') {
    revalidateAllFrontendPages();
    return;
  }

  // For other collections, revalidate when publishing, unpublishing, or deleting a published item.
  const isPublishing = currentStatus === 'published';
  const wasAlreadyPublished = previousStatus === 'published';
  const isDeleting = currentStatus === undefined;
  const isUnpublishing = wasAlreadyPublished && currentStatus !== 'published';

  if (!isPublishing && !wasAlreadyPublished && !isDeleting) return;

  switch (collectionSlug) {
    case 'site-pages': {
      const slug = doc.slug as string | undefined;
      if (slug) {
        // Revalidate the specific CMS page.
        safeRevalidatePath(slug === 'home' ? '/' : `/${slug}`, 'page');
        // Also clear the catch-all dynamic route.
        safeRevalidatePath('/[...slug]', 'page');
      }
      // Sitemap may have changed.
      safeRevalidatePath('/sitemap.xml');
      break;
    }
    case 'service-items': {
      const slug = doc.slug as string | undefined;
      if (slug) {
        safeRevalidatePath(`/services/${slug}`, 'page');
      }
      // Services listing and any dynamic list sections showing service items.
      safeRevalidatePath('/services', 'page');
      safeRevalidatePath('/[...slug]', 'page');
      safeRevalidatePath('/sitemap.xml');
      break;
    }
    case 'blog-posts': {
      const slug = doc.slug as string | undefined;
      if (slug) {
        safeRevalidatePath(`/blog/${slug}`, 'page');
      }
      // Blog index and any dynamic list sections showing blog posts.
      safeRevalidatePath('/blog', 'page');
      safeRevalidatePath('/[...slug]', 'page');
      safeRevalidatePath('/sitemap.xml');
      break;
    }
    case 'testimonials':
    case 'team-members':
    case 'logos': {
      // These appear in dynamic list sections or team/logo sections across pages.
      if (!wasAlreadyPublished) {
        revalidateAllFrontendPages();
      } else {
        // Already published — targeted revalidation of pages most likely to show them.
        safeRevalidatePath('/', 'page');
        safeRevalidatePath('/about', 'page');
        safeRevalidatePath('/[...slug]', 'page');
      }
      break;
    }
    default:
      break;
  }
}

export function revalidateGlobalContent(): void {
  // Any global change (site-settings, ui-settings) affects the shared layout
  // rendered on every page, so revalidate everything.
  revalidateAllFrontendPages();
}

function revalidateAllFrontendPages(): void {
  safeRevalidatePath('/', 'layout');
  safeRevalidatePath('/about', 'page');
  safeRevalidatePath('/services', 'page');
  safeRevalidatePath('/pricing', 'page');
  safeRevalidatePath('/contact', 'page');
  safeRevalidatePath('/privacy', 'page');
  safeRevalidatePath('/[...slug]', 'page');
  safeRevalidatePath('/services/[slug]', 'page');
  safeRevalidatePath('/blog', 'page');
  safeRevalidatePath('/blog/[slug]', 'page');
  safeRevalidatePath('/sitemap.xml');
  safeRevalidatePath('/robots.txt');
}
