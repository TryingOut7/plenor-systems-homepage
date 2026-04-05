import { describe, expect, it } from 'vitest';
import { mediaGovernanceBeforeChange } from '@/payload/hooks/mediaGovernance';

describe('media governance hook', () => {
  it('requires alt text minimum length', () => {
    expect(() =>
      mediaGovernanceBeforeChange({
        data: { alt: 'short' },
        req: { user: { role: 'editor' } },
      } as never),
    ).toThrow('alt text');
  });

  it('requires license source for third-party assets', () => {
    expect(() =>
      mediaGovernanceBeforeChange({
        data: {
          alt: 'Valid alt text',
          usageScope: 'licensed-third-party',
        },
        req: { user: { role: 'editor' } },
      } as never),
    ).toThrow('licenseSource');
  });

  it('requires attribution text when attribution is enabled', () => {
    expect(() =>
      mediaGovernanceBeforeChange({
        data: {
          alt: 'Valid alt text',
          requiresAttribution: true,
        },
        req: { user: { role: 'editor' } },
      } as never),
    ).toThrow('attributionText');
  });

  it('only allows editor/admin to set approved status', () => {
    expect(() =>
      mediaGovernanceBeforeChange({
        data: {
          alt: 'Valid alt text',
          mediaQaStatus: 'approved',
        },
        req: { user: { id: 'u1', role: 'author' } },
      } as never),
    ).toThrow('only editors/admins');
  });

  it('stamps approver metadata for approved assets', () => {
    const result = mediaGovernanceBeforeChange({
      data: {
        alt: 'Valid alt text for image',
        mediaQaStatus: 'approved',
      },
      req: { user: { id: 'u1', role: 'editor' } },
    } as never) as Record<string, unknown>;

    expect(result.usageApprovedBy).toBe('u1');
    expect(typeof result.usageApprovedAt).toBe('string');
  });
});
