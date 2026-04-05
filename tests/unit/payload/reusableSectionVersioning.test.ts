import { describe, expect, it } from 'vitest';
import {
  reusableSectionVersioningBeforeChange,
  reusableSectionVersioningInternals,
} from '@/payload/hooks/reusableSectionVersioning';

describe('reusable section versioning', () => {
  it('initializes version and summary on create', () => {
    const result = reusableSectionVersioningBeforeChange({
      operation: 'create',
      data: {
        title: 'Hero',
      },
    } as never) as Record<string, unknown>;

    expect(result.libraryVersion).toBe(1);
    expect(typeof result.libraryChangeSummary).toBe('string');
  });

  it('keeps version unchanged when tracked fields do not change', () => {
    const result = reusableSectionVersioningBeforeChange({
      operation: 'update',
      data: {
        title: 'Hero',
        slug: 'hero',
        sections: [{ blockType: 'heroSection' }],
        libraryCategory: 'general',
        isDeprecated: false,
      },
      originalDoc: {
        libraryVersion: 4,
        title: 'Hero',
        slug: 'hero',
        sections: [{ blockType: 'heroSection' }],
        libraryCategory: 'general',
        isDeprecated: false,
      },
    } as never) as Record<string, unknown>;

    expect(result.libraryVersion).toBe(4);
  });

  it('bumps version when tracked fields change', () => {
    const result = reusableSectionVersioningBeforeChange({
      operation: 'update',
      data: {
        title: 'Hero updated',
        slug: 'hero',
      },
      originalDoc: {
        libraryVersion: 2,
        title: 'Hero',
        slug: 'hero',
      },
    } as never) as Record<string, unknown>;

    expect(result.libraryVersion).toBe(3);
  });

  it('stable stringifies objects deterministically', () => {
    const a = reusableSectionVersioningInternals.stableStringify({ b: 1, a: 2 });
    const b = reusableSectionVersioningInternals.stableStringify({ a: 2, b: 1 });
    expect(a).toBe(b);
  });
});
