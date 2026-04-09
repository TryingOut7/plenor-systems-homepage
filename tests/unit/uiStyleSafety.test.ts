import { describe, expect, it } from 'vitest';
import { buildPageChromeOverrideCss } from '@/components/PageChromeOverrides';
import { buildUIVariableStyles } from '@/components/UIStyleInjector';
import { normalizeSafeCssValue } from '@/lib/safeCss';

describe('style safety', () => {
  it('keeps safe CSS values and rejects declaration-breaking input', () => {
    expect(normalizeSafeCssValue('clamp(16px, 2vw, 24px)')).toBe('clamp(16px, 2vw, 24px)');
    expect(normalizeSafeCssValue('red; body { display:none }')).toBeUndefined();
  });

  it('drops unsafe UI variable values instead of serializing them into the stylesheet', () => {
    const variables = buildUIVariableStyles({
      colors: {
        primary: '#1B2D4F',
        text: 'red; } body { display:none',
      },
    } as never);

    expect(variables['--ui-color-primary']).toBe('#1B2D4F');
    expect(variables['--ui-color-text']).toBeUndefined();
  });

  it('ignores unsafe page background overrides while preserving safe layout rules', () => {
    const css = buildPageChromeOverrideCss({
      hideNavbar: true,
      hideFooter: false,
      pageBackgroundColor: 'red; } body { display:none',
      customHeadScripts: '',
    });

    expect(css).toContain('header[role="banner"]');
    expect(css).not.toContain('display:none');
    expect(css).not.toContain('background-color');
  });
});
