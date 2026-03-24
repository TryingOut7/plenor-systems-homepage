'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import type { GuideSubmissionRequest } from '@plenor/contracts/forms';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface FieldErrors {
  name?: string;
  email?: string;
}

interface GuideFormProps {
  submitLabel?: string;
  submittingLabel?: string;
  successHeading?: string;
  successBody?: string;
  footerText?: string;
  privacyLabel?: string;
  privacyHref?: string;
  namePlaceholder?: string;
  emailPlaceholder?: string;
  templateId?: string | number;
}

export default function GuideForm({
  submitLabel = 'Send me the guide',
  submittingLabel = 'Sending\u2026',
  successHeading = 'Guide on its way!',
  successBody = 'Check your inbox \u2014 the PDF will arrive shortly from our team.',
  footerText = 'The PDF will be sent to your email automatically. No spam, no mailing lists.',
  privacyLabel = 'Privacy Policy',
  privacyHref = '/privacy',
  namePlaceholder = 'Your name',
  emailPlaceholder = 'you@company.com',
  templateId,
}: GuideFormProps) {
  const [state, setState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  function validate(name: string, email: string): FieldErrors {
    const errs: FieldErrors = {};
    if (!name.trim()) errs.name = 'Please enter your name.';
    if (!email.trim()) {
      errs.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }
    return errs;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const name = nameRef.current?.value ?? '';
    const email = emailRef.current?.value ?? '';
    const honeypot = honeypotRef.current?.value ?? '';

    // Silently reject bots
    if (honeypot) return;

    const errs = validate(name, email);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setState('submitting');

    try {
      const payload: GuideSubmissionRequest = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        ...(templateId != null ? { templateId } : {}),
      };

      const res = await fetch('/api/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? 'Submission failed.');
      }

      setState('success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setErrorMessage(msg);
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          padding: '32px',
          border: '1px solid var(--ui-color-border)',
          borderRadius: '8px',
          backgroundColor: 'var(--ui-color-surface)',
          textAlign: 'center',
          maxWidth: '480px',
          margin: '0 auto',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#DCFCE7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <svg width="24" height="24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p
          style={{
            color: '#16A34A',
            fontWeight: 700,
            fontSize: '18px',
            marginBottom: '8px',
          }}
        >
          {successHeading}
        </p>
        <p style={{ color: 'var(--ui-color-text-muted)', fontSize: '15px' }}>
          {successBody}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Free guide download form"
      style={{ maxWidth: '480px', margin: '0 auto' }}
    >
      {/* Honeypot */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="guide-website">Website</label>
        <input
          id="guide-website"
          type="text"
          name="website"
          ref={honeypotRef}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Name */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="guide-name" className="form-label">
          Name <span aria-hidden="true" style={{ color: '#DC2626' }}>*</span>
        </label>
        <input
          id="guide-name"
          ref={nameRef}
          type="text"
          name="name"
          autoComplete="name"
          placeholder={namePlaceholder}
          required
          aria-required="true"
          aria-describedby={errors.name ? 'guide-name-error' : undefined}
          aria-invalid={!!errors.name}
          className={`form-input${errors.name ? ' error' : ''}`}
          onChange={() => setErrors((e) => ({ ...e, name: undefined }))}
        />
        {errors.name && (
          <p id="guide-name-error" className="form-error" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div style={{ marginBottom: '24px' }}>
        <label htmlFor="guide-email" className="form-label">
          Email address <span aria-hidden="true" style={{ color: '#DC2626' }}>*</span>
        </label>
        <input
          id="guide-email"
          ref={emailRef}
          type="email"
          name="email"
          autoComplete="email"
          placeholder={emailPlaceholder}
          required
          aria-required="true"
          aria-describedby={errors.email ? 'guide-email-error' : undefined}
          aria-invalid={!!errors.email}
          className={`form-input${errors.email ? ' error' : ''}`}
          onChange={() => setErrors((e) => ({ ...e, email: undefined }))}
        />
        {errors.email && (
          <p id="guide-email-error" className="form-error" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      {/* Error state */}
      {state === 'error' && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            color: '#DC2626',
            fontSize: '14px',
            marginBottom: '16px',
            padding: '10px 14px',
            border: '1px solid #FCA5A5',
            borderRadius: '6px',
            backgroundColor: '#FEF2F2',
          }}
        >
          {errorMessage}{' '}
          <button
            type="button"
            onClick={() => setState('idle')}
            style={{
              background: 'none',
              border: 'none',
              color: '#DC2626',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              fontSize: '14px',
            }}
          >
            Try again
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="btn-primary"
        style={{ width: '100%', opacity: state === 'submitting' ? 0.7 : 1 }}
        aria-disabled={state === 'submitting'}
      >
        {state === 'submitting' ? submittingLabel : submitLabel}
      </button>

      <p style={{ fontSize: '12px', color: 'var(--ui-color-text-muted)', marginTop: '12px', textAlign: 'center' }}>
        {footerText}{' '}
        <Link href={privacyHref} style={{ color: 'var(--ui-color-text-muted)', textDecoration: 'underline' }}>
          {privacyLabel}
        </Link>
      </p>
    </form>
  );
}
