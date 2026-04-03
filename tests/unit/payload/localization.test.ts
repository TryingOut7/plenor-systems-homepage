import { describe, expect, it } from 'vitest';
import { ensureLocalizationBeforeChange } from '@/payload/fields/localization';

describe('localization fields', () => {
  it('defaults locale to en and generates translation group id', () => {
    const result = ensureLocalizationBeforeChange({
      data: {
        title: 'Post',
      },
    } as never) as Record<string, unknown>;

    expect(result.locale).toBe('en');
    expect(typeof result.translationGroupId).toBe('string');
    expect(String(result.translationGroupId).length).toBeGreaterThan(10);
  });

  it('preserves existing translation group id', () => {
    const result = ensureLocalizationBeforeChange({
      data: {
        locale: 'de',
      },
      originalDoc: {
        translationGroupId: 'group-1',
      },
    } as never) as Record<string, unknown>;

    expect(result.translationGroupId).toBe('group-1');
    expect(result.locale).toBe('de');
  });
});
