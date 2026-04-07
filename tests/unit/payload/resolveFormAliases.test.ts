import { beforeEach, describe, expect, it, vi } from 'vitest';

const stubs = vi.hoisted(() => ({
  getGuideFormId: vi.fn<() => Promise<number>>(),
  getInquiryFormId: vi.fn<() => Promise<number>>(),
}));

vi.mock('../../../src/lib/payload-form-stubs.ts', () => ({
  getGuideFormId: stubs.getGuideFormId,
  getInquiryFormId: stubs.getInquiryFormId,
}));

import { resolveFormEmbedAliasesInSections } from '../../../src/payload/cms/resolveFormAliases.ts';

const ORIGINAL_ENV = { ...process.env };

function resetEnv() {
  process.env = { ...ORIGINAL_ENV };
}

describe('resolveFormEmbedAliasesInSections', () => {
  beforeEach(() => {
    resetEnv();
    stubs.getGuideFormId.mockReset();
    stubs.getInquiryFormId.mockReset();
  });

  it('does not call Payload form-stub lookup when CMS skip mode is enabled', async () => {
    process.env.CMS_SKIP_PAYLOAD = 'true';
    stubs.getGuideFormId.mockResolvedValue(101);

    const sections = [{ blockType: 'formSection', form: 'guide' }] as const;
    const result = await resolveFormEmbedAliasesInSections([...sections]);

    expect(stubs.getGuideFormId).not.toHaveBeenCalled();
    expect(result).toEqual([{ blockType: 'formSection', form: null, formAlias: 'guide' }]);
  });

  it('resolves guide and inquiry aliases to numeric ids when Payload is enabled', async () => {
    process.env.CMS_SKIP_PAYLOAD = 'false';
    process.env.POSTGRES_URL = 'postgresql://example.com:5432/db';
    stubs.getGuideFormId.mockResolvedValue(101);
    stubs.getInquiryFormId.mockResolvedValue(202);

    const sections = [
      { blockType: 'formSection', form: 'guide' },
      { blockType: 'formSection', form: 'inquiry' },
    ] as const;
    const result = await resolveFormEmbedAliasesInSections([...sections]);

    expect(stubs.getGuideFormId).toHaveBeenCalledTimes(1);
    expect(stubs.getInquiryFormId).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      { blockType: 'formSection', form: 101 },
      { blockType: 'formSection', form: 202 },
    ]);
  });
});
