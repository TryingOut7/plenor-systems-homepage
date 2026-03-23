import { describe, expect, it } from 'vitest';
import { validateGuideSubmission } from '@/domain/forms/guideSubmission';
import { validateInquirySubmission } from '@/domain/forms/inquirySubmission';

describe('domain/forms', () => {
  it('validates and sanitizes guide submissions', () => {
    const result = validateGuideSubmission({
      name: ' <b>Alice</b> ',
      email: ' ALICE@Example.com ',
      templateId: 123,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.name).toBe('Alice');
    expect(result.data.email).toBe('alice@example.com');
    expect(result.data.templateId).toBe(123);
  });

  it('rejects guide submissions without a valid email', () => {
    const result = validateGuideSubmission({
      name: 'Alice',
      email: 'not-an-email',
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.message).toBe('A valid email address is required.');
  });

  it('validates and sanitizes inquiry submissions', () => {
    const result = validateInquirySubmission({
      name: '<script>Bob</script>',
      email: 'bob@Example.com',
      company: ' <i>Acme</i> ',
      challenge: ' <p>Need help with launch planning.</p> ',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.name).toBe('Bob');
    expect(result.data.company).toBe('Acme');
    expect(result.data.challenge).toBe('Need help with launch planning.');
  });

  it('rejects inquiry submissions with empty challenge', () => {
    const result = validateInquirySubmission({
      name: 'Bob',
      email: 'bob@example.com',
      company: 'Acme',
      challenge: '   ',
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.message).toBe(
      'Please describe your product and challenge (max 5000 characters).',
    );
  });
});
