'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import type { InquirySubmissionRequest } from '@plenor/contracts/forms';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface FieldErrors {
  name?: string;
  email?: string;
  company?: string;
  challenge?: string;
}

interface InquiryFormProps {
  submitLabel?: string;
  submittingLabel?: string;
  successHeading?: string;
  successBody?: string;
  consentText?: string;
  namePlaceholder?: string;
  emailPlaceholder?: string;
  companyPlaceholder?: string;
  challengePlaceholder?: string;
}

export default function InquiryForm({
  submitLabel = 'Send inquiry',
  submittingLabel = 'Sending\u2026',
  successHeading = 'Inquiry received',
  successBody = 'We review every inquiry and respond within 2 business days with initial thoughts or a proposal request.',
  consentText = 'By submitting, you agree to our',
  namePlaceholder = 'Your name',
  emailPlaceholder = 'you@company.com',
  companyPlaceholder = 'Your company',
  challengePlaceholder = 'Tell us about your product stage, team size, and what you\u2019re trying to solve.',
}: InquiryFormProps) {
  const [state, setState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);
  const challengeRef = useRef<HTMLTextAreaElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  function validate(
    name: string,
    email: string,
    company: string,
    challenge: string
  ): FieldErrors {
    const errs: FieldErrors = {};
    if (!name.trim()) errs.name = 'Please enter your name.';
    if (!email.trim()) {
      errs.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!company.trim()) errs.company = 'Please enter your company name.';
    if (!challenge.trim()) errs.challenge = 'Please describe your product and challenge.';
    return errs;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const name = nameRef.current?.value ?? '';
    const email = emailRef.current?.value ?? '';
    const company = companyRef.current?.value ?? '';
    const challenge = challengeRef.current?.value ?? '';
    const honeypot = honeypotRef.current?.value ?? '';

    if (honeypot) return;

    const errs = validate(name, email, company, challenge);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setState('submitting');

    try {
      const payload: InquirySubmissionRequest = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company.trim(),
        challenge: challenge.trim(),
      };

      const res = await fetch('/api/inquiry', {
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
        <p style={{ color: '#16A34A', fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>
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
      aria-label="Direct inquiry form"
      style={{ maxWidth: '480px', margin: '0 auto' }}
    >
      {/* Honeypot */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="inquiry-website">Website</label>
        <input
          id="inquiry-website"
          type="text"
          name="website"
          ref={honeypotRef}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Name */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="inquiry-name" className="form-label">
          Name <span aria-hidden="true" style={{ color: '#DC2626' }}>*</span>
        </label>
        <input
          id="inquiry-name"
          ref={nameRef}
          type="text"
          name="name"
          autoComplete="name"
          placeholder={namePlaceholder}
          required
          aria-required="true"
          aria-describedby={errors.name ? 'inquiry-name-error' : undefined}
          aria-invalid={!!errors.name}
          className={`form-input${errors.name ? ' error' : ''}`}
          onChange={() => setErrors((e) => ({ ...e, name: undefined }))}
        />
        {errors.name && (
          <p id="inquiry-name-error" className="form-error" role="alert">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="inquiry-email" className="form-label">
          Email address <span aria-hidden="true" style={{ color: '#DC2626' }}>*</span>
        </label>
        <input
          id="inquiry-email"
          ref={emailRef}
          type="email"
          name="email"
          autoComplete="email"
          placeholder={emailPlaceholder}
          required
          aria-required="true"
          aria-describedby={errors.email ? 'inquiry-email-error' : undefined}
          aria-invalid={!!errors.email}
          className={`form-input${errors.email ? ' error' : ''}`}
          onChange={() => setErrors((e) => ({ ...e, email: undefined }))}
        />
        {errors.email && (
          <p id="inquiry-email-error" className="form-error" role="alert">{errors.email}</p>
        )}
      </div>

      {/* Company */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="inquiry-company" className="form-label">
          Company name <span aria-hidden="true" style={{ color: '#DC2626' }}>*</span>
        </label>
        <input
          id="inquiry-company"
          ref={companyRef}
          type="text"
          name="company"
          autoComplete="organization"
          placeholder={companyPlaceholder}
          required
          aria-required="true"
          aria-describedby={errors.company ? 'inquiry-company-error' : undefined}
          aria-invalid={!!errors.company}
          className={`form-input${errors.company ? ' error' : ''}`}
          onChange={() => setErrors((e) => ({ ...e, company: undefined }))}
        />
        {errors.company && (
          <p id="inquiry-company-error" className="form-error" role="alert">{errors.company}</p>
        )}
      </div>

      {/* Challenge description */}
      <div style={{ marginBottom: '24px' }}>
        <label htmlFor="inquiry-challenge" className="form-label">
          Describe your product and challenge <span aria-hidden="true" style={{ color: '#DC2626' }}>*</span>
        </label>
        <textarea
          id="inquiry-challenge"
          ref={challengeRef}
          name="challenge"
          rows={5}
          placeholder={challengePlaceholder}
          required
          aria-required="true"
          aria-describedby={errors.challenge ? 'inquiry-challenge-error' : undefined}
          aria-invalid={!!errors.challenge}
          className={`form-input${errors.challenge ? ' error' : ''}`}
          style={{ resize: 'vertical' }}
          onChange={() => setErrors((e) => ({ ...e, challenge: undefined }))}
        />
        {errors.challenge && (
          <p id="inquiry-challenge-error" className="form-error" role="alert">{errors.challenge}</p>
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
        {consentText}{' '}
        <Link href="/privacy" style={{ color: 'var(--ui-color-text-muted)', textDecoration: 'underline' }}>
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
