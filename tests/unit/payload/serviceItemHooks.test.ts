import { describe, expect, it } from 'vitest';
import { ServiceItems } from '@/payload/collections/ServiceItems';
import { normalizeSlugBeforeChange } from '@/payload/hooks/normalizeSlug';

describe('ServiceItems hooks', () => {
  it('normalizes slug values before writes', () => {
    const beforeChangeHooks = ServiceItems.hooks?.beforeChange ?? [];
    expect(beforeChangeHooks).toContain(normalizeSlugBeforeChange);
  });
});
