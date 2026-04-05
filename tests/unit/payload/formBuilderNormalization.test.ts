import { describe, expect, it } from 'vitest';
import { normalizeFormBuilderData } from '@/payload/forms/formBuilderNormalization';

describe('formBuilderNormalization', () => {
  it('hydrates required defaults for minimal manual form creation', () => {
    const normalized = normalizeFormBuilderData({
      operation: 'create',
      data: {
        title: 'Quick Lead Form',
      },
    }) as Record<string, unknown>;

    expect(normalized.submitButtonLabel).toBe('Submit');
    expect(normalized.confirmationType).toBe('message');
    expect(normalized.confirmationMessage).toEqual(
      expect.objectContaining({
        root: expect.any(Object),
      }),
    );
  });

  it('normalizes plain string confirmation messages to lexical format', () => {
    const normalized = normalizeFormBuilderData({
      operation: 'create',
      data: {
        title: 'Another Form',
        confirmationMessage: 'Thanks for reaching out',
      },
    }) as Record<string, unknown>;

    expect(normalized.confirmationMessage).toEqual(
      expect.objectContaining({
        root: expect.objectContaining({
          children: expect.any(Array),
        }),
      }),
    );
  });

  it('keeps immutable template keys unchanged on update when omitted', () => {
    const normalized = normalizeFormBuilderData({
      operation: 'update',
      data: {
        title: 'Guide Form',
      },
      originalDoc: {
        templateKey: 'guide',
      },
    }) as Record<string, unknown>;

    expect(normalized.templateKey).toBe('guide');
  });

  it('rejects template key changes once set', () => {
    expect(() =>
      normalizeFormBuilderData({
        operation: 'update',
        data: {
          title: 'Guide Form',
          templateKey: 'newsletter',
        },
        originalDoc: {
          templateKey: 'guide',
        },
      }),
    ).toThrow('templateKey is immutable once set.');
  });
});
