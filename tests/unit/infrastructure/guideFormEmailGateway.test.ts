import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const payloadFormStubMocks = vi.hoisted(() => ({
  getGuideFormId: vi.fn<() => Promise<number>>(),
}));

const payloadClientMocks = vi.hoisted(() => ({
  getPayload: vi.fn(),
}));

vi.mock('@/lib/payload-form-stubs', () => ({
  getGuideFormId: payloadFormStubMocks.getGuideFormId,
}));

vi.mock('@/payload/client', () => ({
  getPayload: payloadClientMocks.getPayload,
}));

import { getGuideFormEmailConfig } from '@/infrastructure/cms/guideFormEmailGateway';

const ORIGINAL_ENV = { ...process.env };

describe('guide form email gateway', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    payloadFormStubMocks.getGuideFormId.mockReset();
    payloadClientMocks.getPayload.mockReset();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('skips payload-backed form lookups when CMS payload access is disabled', async () => {
    process.env.CMS_SKIP_PAYLOAD = 'true';

    const config = await getGuideFormEmailConfig(123);

    expect(config).toEqual({ hasCustomEmails: false });
    expect(payloadFormStubMocks.getGuideFormId).not.toHaveBeenCalled();
    expect(payloadClientMocks.getPayload).not.toHaveBeenCalled();
  });
});
