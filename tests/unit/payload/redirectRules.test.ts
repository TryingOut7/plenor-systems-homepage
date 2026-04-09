import { describe, expect, it, vi } from 'vitest';
import { RedirectRules } from '@/payload/collections/RedirectRules';
import { redirectRulesBeforeChange } from '@/payload/hooks/redirectRules';

describe('redirect rule beforeChange hook', () => {
  it('rejects circular redirect chains against existing enabled rules', async () => {
    const find = vi.fn().mockResolvedValue({
      docs: [{ id: 1, fromPath: '/old', toPath: '/new', enabled: true, isPermanent: true }],
    });

    await expect(
      redirectRulesBeforeChange({
        collection: { slug: 'redirect-rules' },
        data: {
          fromPath: '/new',
          toPath: '/old',
          enabled: true,
        },
        req: {
          payload: { find },
        },
      } as never),
    ).rejects.toThrow('circular redirect chain');
  });

  it('rejects wildcard source rules that would drop the matched suffix', async () => {
    const find = vi.fn().mockResolvedValue({ docs: [] });

    await expect(
      redirectRulesBeforeChange({
        collection: { slug: 'redirect-rules' },
        data: {
          fromPath: '/old-blog/*',
          toPath: '/blog',
          enabled: true,
        },
        req: {
          payload: { find },
        },
      } as never),
    ).rejects.toThrow('must end with "/*"');
  });

  it('limits anonymous reads to enabled rules', async () => {
    const result = await RedirectRules.access?.read?.({ req: {} } as never);

    expect(result).toEqual({ enabled: { equals: true } });
  });
});
