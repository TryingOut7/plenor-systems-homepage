import { describe, expect, it } from 'vitest';
import {
  buildContentSecurityPolicy,
  extractSafeHeadScriptSrcs,
  getSafeStylesheetUrl,
  isAllowedExternalResourceUrl,
} from '@/lib/external-resource-policy';

describe('external resource policy', () => {
  it('allows default cloudflare analytics script host', () => {
    expect(
      isAllowedExternalResourceUrl(
        'https://static.cloudflareinsights.com/beacon.min.js',
        'script',
      ),
    ).toBe(true);
  });

  it('rejects non-allowlisted external script host', () => {
    expect(
      isAllowedExternalResourceUrl('https://evil.example.com/tracker.js', 'script'),
    ).toBe(false);
  });

  it('allows configured external stylesheet hosts', () => {
    const env = {
      ...process.env,
      CMS_ALLOWED_EXTERNAL_STYLE_HOSTS: 'cdn.example.com',
    };

    expect(
      getSafeStylesheetUrl('https://cdn.example.com/theme.css', env),
    ).toBe('https://cdn.example.com/theme.css');
  });

  it('extracts only allowed script srcs from CMS head scripts', () => {
    const scripts = `
      <script src="https://static.cloudflareinsights.com/beacon.min.js"></script>
      <script src="https://evil.example.com/malicious.js"></script>
      <script>alert('xss')</script>
    `;

    expect(extractSafeHeadScriptSrcs(scripts)).toEqual([
      'https://static.cloudflareinsights.com/beacon.min.js',
    ]);
  });

  it('builds CSP with shared allowlist hosts', () => {
    const csp = buildContentSecurityPolicy({
      ...process.env,
      CMS_ALLOWED_EXTERNAL_STYLE_HOSTS: 'fonts.googleapis.com,cdn.example.com',
      CMS_ALLOWED_EXTERNAL_SCRIPT_HOSTS: 'static.cloudflareinsights.com,scripts.example.com',
    });

    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain('https://scripts.example.com');
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain('https://cdn.example.com');
  });
});
