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
});
