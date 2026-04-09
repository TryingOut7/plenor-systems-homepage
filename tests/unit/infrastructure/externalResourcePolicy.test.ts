import { describe, expect, it } from 'vitest';
import {
  buildContentSecurityPolicy,
  extractSafeHeadScriptSrcs,
  getSafeStylesheetUrl,
  isAllowedExternalResourceUrl,
  resolveLocalDevelopmentOrigins,
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

  it('allows jsdelivr by default for Monaco and admin editor tooling', () => {
    expect(
      isAllowedExternalResourceUrl(
        'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js',
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
    const scriptDirective = csp.split('; ').find((directive) => directive.startsWith('script-src '));

    expect(csp).toContain("script-src 'self'");
    expect(scriptDirective).toContain("'unsafe-inline'");
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain('https://scripts.example.com');
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain('https://cdn.example.com');
    expect(csp).toContain('frame-src');
  });

  it('does not include unsafe inline or eval scripts in production CSP', () => {
    const csp = buildContentSecurityPolicy({
      ...process.env,
      NODE_ENV: 'production',
    });
    const scriptDirective = csp.split('; ').find((directive) => directive.startsWith('script-src '));

    expect(scriptDirective).toBeDefined();
    expect(scriptDirective).not.toContain("'unsafe-inline'");
    expect(scriptDirective).not.toContain("'unsafe-eval'");
  });

  it('includes local dev origins in CSP and origin resolver outside production', () => {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      NODE_ENV: 'development',
      PORT: '4101',
      NEXT_PUBLIC_SERVER_URL: 'http://localhost:3000',
    };

    const origins = resolveLocalDevelopmentOrigins(env);
    expect(origins).toContain('http://localhost:4101');
    expect(origins).toContain('http://127.0.0.1:4101');
    expect(origins).toContain('http://localhost:3000');

    const csp = buildContentSecurityPolicy(env);
    expect(csp).toContain("frame-ancestors 'self' http://localhost:3000");
    expect(csp).toContain('http://127.0.0.1:4101');
  });
});
