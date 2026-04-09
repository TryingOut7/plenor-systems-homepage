import { beforeEach, describe, expect, it, vi } from 'vitest';

const revalidatePath = vi.fn();

vi.mock('next/cache', () => ({
  revalidatePath: (...args: Parameters<typeof revalidatePath>) => revalidatePath(...args),
}));

import { SiteSettings } from '@/payload/globals/SiteSettings';
import { revalidateGlobalAfterChange } from '@/payload/hooks/revalidateCmsContent';

beforeEach(() => {
  revalidatePath.mockReset();
});

describe('global content revalidation hooks', () => {
  it('wires explicit revalidation onto SiteSettings changes', () => {
    expect(SiteSettings.hooks?.afterChange).toContain(revalidateGlobalAfterChange);
  });

  it('revalidates frontend paths when a global changes outside autosave', async () => {
    await revalidateGlobalAfterChange({
      doc: { siteName: 'Plenor' },
      context: {},
    } as never);

    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(revalidatePath).toHaveBeenCalledWith('/[...slug]', 'page');
    expect(revalidatePath).toHaveBeenCalledWith('/robots.txt', undefined);
  });

  it('skips revalidation during autosave', async () => {
    await revalidateGlobalAfterChange({
      doc: { siteName: 'Plenor' },
      context: { autosave: true },
    } as never);

    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
