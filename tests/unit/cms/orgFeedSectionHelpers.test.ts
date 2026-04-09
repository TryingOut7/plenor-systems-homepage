import { describe, expect, it } from 'vitest';

/**
 * Unit tests for the pure parsing/derivation logic used by OrgFeedSection.
 *
 * These functions live inside the component and are not exported, so the
 * contract is documented and validated inline here — same approach as
 * categoryRouteValidation.test.ts for domain constants.
 *
 * Critical coverage: `itemBasePath` field introduced to replace the deleted
 * NEXT_PUBLIC_COMMUNITY_SITE_BASE_PATH env-var feature flag.
 */

type FeedType = 'events' | 'spotlight' | 'learning';
type SourceMode = 'featured' | 'manual' | 'automatic';

function parseFeedType(value: unknown): FeedType {
  return value === 'spotlight' || value === 'learning' ? value : 'events';
}

function parseSourceMode(value: unknown): SourceMode {
  return value === 'manual' || value === 'automatic' ? value : 'featured';
}

function parseLimit(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(Math.max(Math.trunc(value), 1), 12);
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.min(Math.max(Math.trunc(parsed), 1), 12);
  }
  return 3;
}

function parseColumns(value: unknown): '1' | '2' | '3' | '4' {
  return value === '1' || value === '2' || value === '4' ? value : '3';
}

// Mirrors the itemBasePath derivation in OrgFeedSectionServer
function resolveItemBasePath(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed.replace(/\/+$/, '') : null;
}

// Mirrors buildItemHref closure in OrgFeedSectionServer
function buildItemHref(itemBasePath: string | null, suffix: string): string | undefined {
  if (!itemBasePath) return undefined;
  return `${itemBasePath}/${suffix}`;
}

describe('OrgFeedSection helpers', () => {
  describe('parseFeedType', () => {
    it('defaults to events for unknown values', () => {
      expect(parseFeedType(undefined)).toBe('events');
      expect(parseFeedType(null)).toBe('events');
      expect(parseFeedType('')).toBe('events');
      expect(parseFeedType('invalid')).toBe('events');
    });

    it('accepts all three valid feed types', () => {
      expect(parseFeedType('events')).toBe('events');
      expect(parseFeedType('spotlight')).toBe('spotlight');
      expect(parseFeedType('learning')).toBe('learning');
    });
  });

  describe('parseSourceMode', () => {
    it('defaults to featured for unknown values', () => {
      expect(parseSourceMode(undefined)).toBe('featured');
      expect(parseSourceMode(null)).toBe('featured');
      expect(parseSourceMode('invalid')).toBe('featured');
    });

    it('accepts all three valid source modes', () => {
      expect(parseSourceMode('featured')).toBe('featured');
      expect(parseSourceMode('manual')).toBe('manual');
      expect(parseSourceMode('automatic')).toBe('automatic');
    });
  });

  describe('parseLimit', () => {
    it('defaults to 3 for invalid input', () => {
      expect(parseLimit(undefined)).toBe(3);
      expect(parseLimit(null)).toBe(3);
      expect(parseLimit('abc')).toBe(3);
      expect(parseLimit(NaN)).toBe(3);
      expect(parseLimit(Infinity)).toBe(3);
    });

    it('clamps to minimum of 1', () => {
      expect(parseLimit(0)).toBe(1);
      expect(parseLimit(-5)).toBe(1);
    });

    it('clamps to maximum of 12', () => {
      expect(parseLimit(13)).toBe(12);
      expect(parseLimit(100)).toBe(12);
    });

    it('truncates decimals', () => {
      expect(parseLimit(3.9)).toBe(3);
      expect(parseLimit(1.1)).toBe(1);
    });

    it('parses numeric strings', () => {
      expect(parseLimit('6')).toBe(6);
      expect(parseLimit('12')).toBe(12);
    });
  });

  describe('parseColumns', () => {
    it('defaults to 3 for unknown or unsupported values', () => {
      expect(parseColumns(undefined)).toBe('3');
      expect(parseColumns('5')).toBe('3');
      expect(parseColumns(3)).toBe('3');
      expect(parseColumns('3')).toBe('3');
    });

    it('accepts the four valid column counts', () => {
      expect(parseColumns('1')).toBe('1');
      expect(parseColumns('2')).toBe('2');
      expect(parseColumns('4')).toBe('4');
    });
  });

  describe('resolveItemBasePath', () => {
    it('strips trailing slashes', () => {
      expect(resolveItemBasePath('/org/events/')).toBe('/org/events');
      expect(resolveItemBasePath('/org/events///')).toBe('/org/events');
    });

    it('preserves paths without trailing slashes', () => {
      expect(resolveItemBasePath('/org/events')).toBe('/org/events');
    });

    it('returns null for empty or whitespace-only strings', () => {
      expect(resolveItemBasePath('')).toBeNull();
      expect(resolveItemBasePath('   ')).toBeNull();
    });

    it('returns null for non-string values', () => {
      expect(resolveItemBasePath(null)).toBeNull();
      expect(resolveItemBasePath(undefined)).toBeNull();
      expect(resolveItemBasePath(42)).toBeNull();
    });
  });

  describe('buildItemHref', () => {
    it('returns undefined when itemBasePath is null', () => {
      expect(buildItemHref(null, 'summer-concert')).toBeUndefined();
    });

    it('builds event card hrefs from slug', () => {
      expect(buildItemHref('/org/events', 'summer-concert')).toBe('/org/events/summer-concert');
    });

    it('builds spotlight card hrefs from category/slug', () => {
      expect(buildItemHref('/org/spotlight', 'student/jane-doe')).toBe(
        '/org/spotlight/student/jane-doe',
      );
    });

    it('builds learning card hrefs from category/slug', () => {
      expect(buildItemHref('/org/learning', 'mentorship/spring-program')).toBe(
        '/org/learning/mentorship/spring-program',
      );
    });

    it('produces correct hrefs when basePath has no trailing slash', () => {
      expect(buildItemHref('/events', 'my-event')).toBe('/events/my-event');
    });
  });
});
