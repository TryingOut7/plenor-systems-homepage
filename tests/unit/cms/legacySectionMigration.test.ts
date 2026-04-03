import { describe, expect, it } from 'vitest';
import {
  STRUCTURAL_KEY_PATTERN,
  hasLegacySections,
  migrateLegacySectionsBeforeChange,
  migrateLegacySections,
} from '@/payload/hooks/legacySectionMigration';

describe('legacy section migration', () => {
  it('converts legacy sections with deterministic structural keys', () => {
    const input = [
      {
        id: 'sec-1',
        blockType: 'legacyQuoteSection',
        quote: 'Legacy quote text',
      },
    ];

    const first = migrateLegacySections(input);
    const second = migrateLegacySections(input);
    const firstSection = first.sections[0] as Record<string, unknown>;
    const secondSection = second.sections[0] as Record<string, unknown>;

    expect(first.convertedCount).toBe(1);
    expect(first.parityFailures).toHaveLength(0);
    expect(firstSection.blockType).toBe('quoteSection');
    expect(firstSection.structuralKey).toBe(secondSection.structuralKey);
    expect(STRUCTURAL_KEY_PATTERN.test(String(firstSection.structuralKey))).toBe(true);
  });

  it('adds deterministic numeric suffixes for structuralKey collisions', () => {
    const input = [
      {
        id: 'duplicate-id',
        blockType: 'legacyQuoteSection',
        quote: 'First quote',
      },
      {
        id: 'duplicate-id',
        blockType: 'legacyQuoteSection',
        quote: 'Second quote',
      },
    ];

    const migration = migrateLegacySections(input);
    const firstKey = String((migration.sections[0] as Record<string, unknown>).structuralKey);
    const secondKey = String((migration.sections[1] as Record<string, unknown>).structuralKey);

    expect(firstKey).not.toBe(secondKey);
    expect(secondKey.endsWith('-2')).toBe(true);
  });

  it('maps legacy audience grid to simple table rows', () => {
    const input = [
      {
        blockType: 'legacyAudienceGridSection',
        heading: 'Who this helps',
        audiences: [
          { label: 'Startups', copy: 'Move faster' },
          { label: 'Enterprises', copy: 'Improve consistency' },
        ],
      },
    ];

    const migration = migrateLegacySections(input);
    const section = migration.sections[0] as Record<string, unknown>;
    const rows = section.rows as Array<Record<string, unknown>>;

    expect(section.blockType).toBe('simpleTableSection');
    expect(Array.isArray(rows)).toBe(true);
    expect(rows).toHaveLength(2);
  });

  it('detects presence of legacy block types', () => {
    expect(hasLegacySections([{ blockType: 'legacyHeroSection' }])).toBe(true);
    expect(hasLegacySections([{ blockType: 'heroSection' }])).toBe(false);
  });

  it('blocks creation of new legacy sections during deprecation window', () => {
    expect(() =>
      migrateLegacySectionsBeforeChange({
        operation: 'create',
        data: {
          sections: [
            {
              blockType: 'legacyHeroSection',
              heading: 'Legacy',
            },
          ],
        },
      } as never),
    ).toThrow('Legacy block creation is disabled');
  });

  it('blocks introducing additional legacy sections on update', () => {
    expect(() =>
      migrateLegacySectionsBeforeChange({
        operation: 'update',
        data: {
          sections: [
            { id: 'legacy-1', blockType: 'legacyHeroSection', heading: 'Legacy existing' },
            { id: 'legacy-2', blockType: 'legacyQuoteSection', quote: 'New legacy' },
          ],
        },
        originalDoc: {
          sections: [
            { id: 'legacy-1', blockType: 'legacyHeroSection', heading: 'Legacy existing' },
          ],
        },
      } as never),
    ).toThrow('Legacy block creation is disabled');
  });

  it('allows existing legacy sections on update and converts them before write', () => {
    const result = migrateLegacySectionsBeforeChange({
      operation: 'update',
      data: {
        sections: [
          { id: 'legacy-1', blockType: 'legacyQuoteSection', quote: 'Existing legacy' },
        ],
      },
      originalDoc: {
        sections: [
          { id: 'legacy-1', blockType: 'legacyQuoteSection', quote: 'Existing legacy' },
        ],
      },
    } as never) as Record<string, unknown>;

    const sections = result.sections as Array<Record<string, unknown>>;
    expect(sections[0].blockType).toBe('quoteSection');
  });
});
