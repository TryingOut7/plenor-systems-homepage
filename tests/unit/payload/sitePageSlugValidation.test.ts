import { describe, expect, it, vi } from 'vitest';
import { ensureUniqueSitePageSlugBeforeChange } from '@/payload/collections/SitePages';

describe('site page slug validation', () => {
  it('throws a slug-specific validation error when slug conflicts', async () => {
    const find = vi.fn(async () => ({
      docs: [{ id: 'page_2', title: 'Existing About Page' }],
    }));

    await expect(
      ensureUniqueSitePageSlugBeforeChange({
        operation: 'create',
        data: {
          slug: 'about',
        },
        req: {
          payload: { find },
        },
        collection: {
          slug: 'site-pages',
        },
      } as never),
    ).rejects.toThrow('Slug "about" is already used by "Existing About Page"');

    expect(find).toHaveBeenCalledWith(expect.objectContaining({ trash: true }));
  });

  it('allows updates when the only matching slug belongs to the same document', async () => {
    const data = { slug: 'about' };
    const find = vi.fn(async () => ({
      docs: [{ id: 'page_1', title: 'About' }],
    }));

    const result = await ensureUniqueSitePageSlugBeforeChange({
      operation: 'update',
      data,
      originalDoc: {
        id: 'page_1',
        slug: 'about',
      },
      req: {
        payload: { find },
      },
      collection: {
        slug: 'site-pages',
      },
    } as never);

    expect(result).toBe(data);
  });

  it('explains when the conflicting slug belongs to a trashed page', async () => {
    const find = vi.fn(async () => ({
      docs: [{ id: 'page_2', title: 'Old Home', deletedAt: '2026-04-08T18:23:42.929Z' }],
    }));

    await expect(
      ensureUniqueSitePageSlugBeforeChange({
        operation: 'create',
        data: {
          slug: 'home',
        },
        req: {
          payload: { find },
        },
        collection: {
          slug: 'site-pages',
        },
      } as never),
    ).rejects.toThrow('Restore or permanently delete that page before reusing the slug.');
  });
});
