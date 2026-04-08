import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { resolveCommunityBasePath } from '@/lib/community-site-config';

const ENV_KEY = 'NEXT_PUBLIC_COMMUNITY_SITE_BASE_PATH';

describe('resolveCommunityBasePath', () => {
  const originalValue = process.env[ENV_KEY];

  beforeEach(() => {
    delete process.env[ENV_KEY];
  });

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env[ENV_KEY];
    } else {
      process.env[ENV_KEY] = originalValue;
    }
  });

  describe('returns null when disabled', () => {
    it('returns null when env is unset', () => {
      expect(resolveCommunityBasePath()).toBeNull();
    });

    it('returns null when env is empty string', () => {
      process.env[ENV_KEY] = '';
      expect(resolveCommunityBasePath()).toBeNull();
    });

    it('returns null when env is only whitespace', () => {
      process.env[ENV_KEY] = '   ';
      expect(resolveCommunityBasePath()).toBeNull();
    });

    it('returns null when env is just "/"', () => {
      process.env[ENV_KEY] = '/';
      expect(resolveCommunityBasePath()).toBeNull();
    });

    it('returns null when env is multiple slashes', () => {
      process.env[ENV_KEY] = '///';
      expect(resolveCommunityBasePath()).toBeNull();
    });
  });

  describe('reserved prefix blocking', () => {
    it('returns null for /admin', () => {
      process.env[ENV_KEY] = '/admin';
      expect(resolveCommunityBasePath()).toBeNull();
    });

    it('returns null for /admin/sub', () => {
      process.env[ENV_KEY] = '/admin/sub';
      expect(resolveCommunityBasePath()).toBeNull();
    });

    it('returns null for /api', () => {
      process.env[ENV_KEY] = '/api';
      expect(resolveCommunityBasePath()).toBeNull();
    });

    it('returns null for /api/v1', () => {
      process.env[ENV_KEY] = '/api/v1';
      expect(resolveCommunityBasePath()).toBeNull();
    });

    it('returns null for /_next', () => {
      process.env[ENV_KEY] = '/_next';
      expect(resolveCommunityBasePath()).toBeNull();
    });

    it('returns null for /_next/static', () => {
      process.env[ENV_KEY] = '/_next/static';
      expect(resolveCommunityBasePath()).toBeNull();
    });

    it('returns null for /favicon', () => {
      process.env[ENV_KEY] = '/favicon';
      expect(resolveCommunityBasePath()).toBeNull();
    });

    it('returns null for /sitemap', () => {
      process.env[ENV_KEY] = '/sitemap';
      expect(resolveCommunityBasePath()).toBeNull();
    });

    it('returns null for /robots', () => {
      process.env[ENV_KEY] = '/robots';
      expect(resolveCommunityBasePath()).toBeNull();
    });

    it('does not block paths that merely start with a reserved word as a substring', () => {
      // /admins is NOT blocked — only exact match or /<prefix>/... patterns
      process.env[ENV_KEY] = '/admins';
      expect(resolveCommunityBasePath()).toBe('/admins');
    });

    it('does not block paths that merely start with api as a substring', () => {
      process.env[ENV_KEY] = '/apiary';
      expect(resolveCommunityBasePath()).toBe('/apiary');
    });
  });

  describe('normalization', () => {
    it('returns /community for /community', () => {
      process.env[ENV_KEY] = '/community';
      expect(resolveCommunityBasePath()).toBe('/community');
    });

    it('prepends / when missing', () => {
      process.env[ENV_KEY] = 'community';
      expect(resolveCommunityBasePath()).toBe('/community');
    });

    it('strips trailing slash', () => {
      process.env[ENV_KEY] = '/community/';
      expect(resolveCommunityBasePath()).toBe('/community');
    });

    it('strips multiple trailing slashes', () => {
      process.env[ENV_KEY] = '/community///';
      expect(resolveCommunityBasePath()).toBe('/community');
    });

    it('lowercases the path', () => {
      process.env[ENV_KEY] = '/COMMUNITY';
      expect(resolveCommunityBasePath()).toBe('/community');
    });

    it('trims leading/trailing whitespace before normalizing', () => {
      process.env[ENV_KEY] = '  /org  ';
      expect(resolveCommunityBasePath()).toBe('/org');
    });

    it('returns /org for a valid custom base path', () => {
      process.env[ENV_KEY] = '/org';
      expect(resolveCommunityBasePath()).toBe('/org');
    });

    it('handles nested base paths', () => {
      process.env[ENV_KEY] = '/raagalaya/community';
      expect(resolveCommunityBasePath()).toBe('/raagalaya/community');
    });
  });
});
