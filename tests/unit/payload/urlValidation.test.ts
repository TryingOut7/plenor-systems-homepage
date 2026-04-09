import { describe, expect, it } from 'vitest';
import {
  validateHttpUrl,
  validatePathOrHttpUrl,
  validateRedirectFromPath,
  validateRedirectToPath,
} from '@/payload/validation/url';

describe('payload URL validation', () => {
  it('accepts internal paths and http(s) URLs', () => {
    expect(validatePathOrHttpUrl('/contact#guide')).toBe(true);
    expect(validatePathOrHttpUrl('https://example.com/docs')).toBe(true);
  });

  it('rejects unsafe schemes', () => {
    expect(validatePathOrHttpUrl('javascript:alert(1)')).toContain('cannot use');
    expect(validateHttpUrl('data:text/html;base64,abcd')).toContain('cannot use');
  });

  it('requires valid http(s) URL for strict URL fields', () => {
    expect(validateHttpUrl('https://example.com')).toBe(true);
    expect(validateHttpUrl('/relative')).toContain('http(s)');
  });
});

describe('redirect path validation', () => {
  it('accepts standard and wildcard source paths', () => {
    expect(validateRedirectFromPath('/old-page')).toBe(true);
    expect(validateRedirectFromPath('/old-blog/*')).toBe(true);
  });

  it('rejects invalid redirect source paths', () => {
    expect(validateRedirectFromPath('https://example.com')).toContain('start with "/"');
    expect(validateRedirectFromPath('/old/*/nested')).toContain('trailing "/*"');
    expect(validateRedirectFromPath('/old?x=1')).toContain('query strings');
  });

  it('enforces wildcard pairing on destination path', () => {
    expect(
      validateRedirectToPath('/new-blog/*', {
        siblingData: { fromPath: '/old-blog/*' },
      }),
    ).toBe(true);

    expect(
      validateRedirectToPath('/new-blog/*', {
        siblingData: { fromPath: '/old-blog' },
      }),
    ).toContain('wildcard');

    expect(
      validateRedirectToPath('/blog', {
        siblingData: { fromPath: '/old-blog/*' },
      }),
    ).toContain('must end with "/*"');
  });
});
