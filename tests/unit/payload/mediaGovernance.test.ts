import { describe, expect, it } from 'vitest';
import {
  mediaGovernanceBeforeChange,
  mediaGovernanceInternals,
} from '@/payload/hooks/mediaGovernance';

describe('media governance hook', () => {
  it('blocks media uploads in non-local production when blob token is missing', () => {
    const originalEnv = process.env;
    try {
      process.env = {
        ...originalEnv,
        NODE_ENV: 'production',
        NEXT_PUBLIC_SERVER_URL: 'https://staging.example.com',
        BLOB_READ_WRITE_TOKEN: '',
        ALLOW_NON_PERSISTENT_UPLOADS: 'false',
      };

      expect(() =>
        mediaGovernanceBeforeChange({
          data: { alt: 'Valid alt text for image' },
          req: { user: { role: 'editor' } },
        } as never),
      ).toThrow('missing BLOB_READ_WRITE_TOKEN');
    } finally {
      process.env = originalEnv;
    }
  });

  it('requires alt text minimum length', () => {
    expect(() =>
      mediaGovernanceBeforeChange({
        data: { alt: 'short' },
        req: { user: { role: 'editor' } },
      } as never),
    ).toThrow('alt text');
  });

  it('derives alt text from filename when alt is omitted', () => {
    const result = mediaGovernanceBeforeChange({
      data: { filename: 'spring-concert-flyer.png' },
      req: { user: { role: 'editor' } },
    } as never) as Record<string, unknown>;

    expect(result.alt).toBe('spring concert flyer');
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

  it('normalizes license comparisons to UTC midnight boundaries', () => {
    const morning = new Date('2026-04-09T01:15:00.000Z');
    const evening = new Date('2026-04-09T23:45:00.000Z');

    expect(mediaGovernanceInternals.toUtcMidnightTimestamp(morning)).toBe(
      mediaGovernanceInternals.toUtcMidnightTimestamp(evening),
    );
  });
});
