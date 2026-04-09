import { describe, expect, it } from 'vitest';
import {
  resolveRedirectChain,
  validateRedirectWildcardPairing,
  type RedirectRuleLike,
} from '@/lib/redirects';

describe('redirect rule helpers', () => {
  it('requires wildcard destinations to preserve the matched suffix', () => {
    expect(validateRedirectWildcardPairing('/old-blog/*', '/blog')).toContain('must end with "/*"');
    expect(validateRedirectWildcardPairing('/old-blog/*', '/blog/*')).toBe(true);
  });

  it('detects circular redirect chains before a response is sent', () => {
    const rules: RedirectRuleLike[] = [
      { fromPath: '/old', toPath: '/new', isPermanent: true },
      { fromPath: '/new', toPath: '/old', isPermanent: true },
    ];

    expect(resolveRedirectChain(rules, '/old')).toMatchObject({
      kind: 'blocked',
      reason: 'loop',
      visitedPaths: ['/old', '/new', '/old'],
    });
  });

  it('collapses multi-hop chains into a single final redirect', () => {
    const rules: RedirectRuleLike[] = [
      { fromPath: '/old-blog/*', toPath: '/blog/*', isPermanent: true },
      { fromPath: '/blog/*', toPath: '/articles/*', isPermanent: false },
    ];

    expect(resolveRedirectChain(rules, '/old-blog/my-post')).toMatchObject({
      kind: 'redirect',
      targetPath: '/articles/my-post',
      isPermanent: false,
      visitedPaths: ['/old-blog/my-post', '/blog/my-post', '/articles/my-post'],
    });
  });
});
