import { describe, expect, it } from 'vitest';
import { auditLogInternals } from '@/payload/hooks/auditLog';

describe('audit log summary normalization', () => {
  it('summarizes booleans as plain values', () => {
    expect(auditLogInternals.summarizeValue('site-pages.seo.noindex', false)).toBe('false');
    expect(auditLogInternals.summarizeValue('site-pages.seo.noindex', true)).toBe('true');
  });

  it('normalizes URL/path style values', () => {
    expect(auditLogInternals.summarizeValue('redirect-rules.fromPath', '/old//path')).toBe('/old/path');
    expect(
      auditLogInternals.summarizeValue(
        'site-pages.seo.canonicalUrl',
        'https://example.com//pricing?ref=1',
      ),
    ).toBe('https://example.com/pricing?ref=1');
  });

  it('summarizes external font URLs as host and pathname', () => {
    expect(
      auditLogInternals.summarizeValue(
        'ui-settings.typography.headingFontUrl',
        'https://fonts.googleapis.com/css2?family=Geist:wght@400;700',
      ),
    ).toBe('fonts.googleapis.com/css2');
  });

  it('redacts sensitive-like fields', () => {
    const summary = auditLogInternals.summarizeValue(
      'site-settings.privateApiToken',
      'super-secret-token',
    );
    expect(summary.startsWith('[REDACTED hash=')).toBe(true);
  });

  it('summarizes custom head scripts by source host', () => {
    const summary = auditLogInternals.summarizeValue(
      'site-pages.customHeadScripts',
      '<script src="https://static.cloudflareinsights.com/beacon.min.js"></script>',
    );
    expect(summary).toContain('scripts=1');
    expect(summary).toContain('static.cloudflareinsights.com');
  });

  it('summarizes script/style asset URLs as host + pathname', () => {
    expect(
      auditLogInternals.summarizeValue(
        'site-settings.externalScriptUrl',
        'https://cdn.example.com/assets/loader.js?cache=1',
      ),
    ).toBe('cdn.example.com/assets/loader.js');
  });

  it('formats transition summaries with false -> true convention', () => {
    expect(auditLogInternals.summarizeTransition('false', 'true')).toBe('false -> true');
  });
});
