'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
  GuideFormLabels,
  InquiryFormLabels,
} from '@/components/cms/sections/types';

type SectionTheme = 'navy' | 'charcoal' | 'black' | 'white' | 'light';

interface FormField {
  id: string;
  name: string;
  label: string;
  fieldType: 'text' | 'textarea' | 'email' | 'number' | 'select' | 'checkbox' | 'message';
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: string;
}

interface FormData {
  id: string;
  title: string;
  templateKey?: 'guide' | 'inquiry' | 'newsletter';
  fields: FormField[];
  submitButtonLabel?: string;
  confirmationType?: 'message' | 'redirect';
  confirmationMessage?: unknown;
  redirect?: { url?: string };
}

interface FormRendererProps {
  formId: string;
  successMessage?: string;
  theme?: SectionTheme;
  guideFormLabels?: GuideFormLabels;
  inquiryFormLabels?: InquiryFormLabels;
}

type TemplateLabels = {
  submitLabel?: string;
  submittingLabel?: string;
  successHeading?: string;
  successBody?: string;
  footerText?: string;
  consentText?: string;
  privacyLabel?: string;
  privacyHref?: string;
  namePlaceholder?: string;
  emailPlaceholder?: string;
  companyPlaceholder?: string;
  challengePlaceholder?: string;
};

function isDark(theme?: SectionTheme) {
  return theme === 'navy' || theme === 'charcoal' || theme === 'black';
}

function readTextValue(values: Record<string, string | boolean>, key: string): string {
  const value = values[key];
  return typeof value === 'string' ? value.trim() : '';
}

function resolveSubmitTarget(
  form: FormData,
  values: Record<string, string | boolean>,
  formId: string,
): {
  endpoint: string;
  payload: unknown;
} {
  if (form.templateKey === 'guide') {
    return {
      endpoint: '/api/guide',
      payload: {
        name: readTextValue(values, 'firstName') || readTextValue(values, 'name'),
        email: readTextValue(values, 'email'),
        templateId: formId,
      },
    };
  }

  if (form.templateKey === 'inquiry') {
    return {
      endpoint: '/api/inquiry',
      payload: {
        name: readTextValue(values, 'name'),
        email: readTextValue(values, 'email'),
        company: readTextValue(values, 'company'),
        challenge: readTextValue(values, 'challenge'),
      },
    };
  }

  const submissionData = Object.entries(values).map(([field, value]) => ({
    field,
    value: String(value),
  }));

  return {
    endpoint: '/api/form-submissions',
    payload: { form: formId, submissionData },
  };
}

function readSubmitErrorMessage(value: unknown): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const message = record.message;
  if (typeof message === 'string' && message.trim()) return message;
  const error = record.error;
  if (typeof error === 'string' && error.trim()) return error;
  return null;
}

function readLexicalText(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const record = node as Record<string, unknown>;
  if (typeof record.text === 'string') return record.text;
  if (!Array.isArray(record.children)) return '';
  return record.children.map(readLexicalText).join('');
}

function readConfirmationMessage(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';

  const root = (value as Record<string, unknown>).root;
  if (!root || typeof root !== 'object') return readLexicalText(value).trim();

  const children = Array.isArray((root as Record<string, unknown>).children)
    ? ((root as Record<string, unknown>).children as unknown[])
    : [];

  if (children.length === 0) return readLexicalText(value).trim();

  return children
    .map((child) => readLexicalText(child).trim())
    .filter(Boolean)
    .join('\n\n');
}

function resolveTemplateLabels(
  templateKey: FormData['templateKey'],
  guideFormLabels?: GuideFormLabels,
  inquiryFormLabels?: InquiryFormLabels,
): TemplateLabels | null {
  if (templateKey === 'guide' && guideFormLabels) {
    return { ...guideFormLabels };
  }

  if (templateKey === 'inquiry' && inquiryFormLabels) {
    return { ...inquiryFormLabels };
  }

  return null;
}

function resolveFieldPlaceholder(
  field: FormField,
  templateKey: FormData['templateKey'],
  labels: TemplateLabels | null,
): string | undefined {
  if (!labels) return undefined;

  const fieldName = field.name.trim().toLowerCase();

  if (templateKey === 'guide') {
    if (fieldName === 'firstname' || fieldName === 'name') {
      return labels.namePlaceholder;
    }
    if (fieldName === 'email') {
      return labels.emailPlaceholder;
    }
    return undefined;
  }

  if (templateKey === 'inquiry') {
    if (fieldName === 'name') return labels.namePlaceholder;
    if (fieldName === 'email') return labels.emailPlaceholder;
    if (fieldName === 'company') return labels.companyPlaceholder;
    if (fieldName === 'challenge') return labels.challengePlaceholder;
  }

  return undefined;
}

export default function FormRenderer({
  formId,
  successMessage,
  theme,
  guideFormLabels,
  inquiryFormLabels,
}: FormRendererProps) {
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const templateLabels = useMemo(
    () => resolveTemplateLabels(form?.templateKey, guideFormLabels, inquiryFormLabels),
    [form?.templateKey, guideFormLabels, inquiryFormLabels],
  );

  const dark = isDark(theme);
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.2)' : 'var(--ui-color-border)'}`,
    borderRadius: 'var(--ui-button-radius, 6px)',
    backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'var(--ui-color-surface)',
    color: dark ? 'var(--ui-color-dark-text)' : 'var(--ui-color-primary)',
    fontSize: '15px',
    fontFamily: 'var(--ui-font-body)',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block',
    fontWeight: 600,
    fontSize: '14px',
    marginBottom: '6px',
    color: dark ? 'var(--ui-color-dark-text)' : 'var(--ui-color-primary)',
  };

  useEffect(() => {
    if (!formId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/forms/${formId}?depth=1`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load form');
        return res.json();
      })
      .then((data: FormData) => {
        setForm(data);
        const defaults: Record<string, string | boolean> = {};
        (data.fields || []).forEach((field) => {
          if (field.fieldType === 'checkbox') {
            defaults[field.name] = false;
          } else {
            defaults[field.name] = field.defaultValue || '';
          }
        });
        setValues(defaults);
      })
      .catch(() => setError('Could not load form. Please try again later.'))
      .finally(() => setLoading(false));
  }, [formId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const target = resolveSubmitTarget(form, values, formId);
      const res = await fetch(target.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target.payload),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(readSubmitErrorMessage(body) || 'Submission failed');
      }

      if (
        body &&
        typeof body === 'object' &&
        !Array.isArray(body) &&
        (body as Record<string, unknown>).success === false
      ) {
        throw new Error(readSubmitErrorMessage(body) || 'Submission failed');
      }

      const redirectUrl =
        typeof form.redirect?.url === 'string' ? form.redirect.url.trim() : '';

      if (form.confirmationType === 'redirect' && redirectUrl) {
        window.location.assign(redirectUrl);
        return;
      }

      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <p
        style={{
          color: dark ? 'var(--ui-color-dark-text-muted)' : 'var(--ui-color-text-muted)',
          fontSize: '14px',
        }}
      >
        Loading form...
      </p>
    );
  }

  if (error) {
    return <p style={{ color: '#dc2626', fontSize: '14px' }}>{error}</p>;
  }

  if (!form) return null;

  if (submitted) {
    const successHeading = templateLabels?.successHeading?.trim() || '';
    const msg =
      successMessage?.trim() ||
      templateLabels?.successBody?.trim() ||
      readConfirmationMessage(form.confirmationMessage) ||
      'Thank you! Your submission has been received.';

    return (
      <div
        style={{
          padding: '32px',
          backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'var(--ui-color-section-alt)',
          borderRadius: 'var(--ui-button-radius, 6px)',
          textAlign: 'center',
        }}
      >
        {successHeading ? (
          <p
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: dark ? 'var(--ui-color-dark-text)' : 'var(--ui-color-primary)',
              margin: '0 0 8px',
            }}
          >
            {successHeading}
          </p>
        ) : null}
        <p
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: dark ? 'var(--ui-color-dark-text)' : 'var(--ui-color-primary)',
            margin: 0,
            whiteSpace: 'pre-line',
          }}
        >
          {msg}
        </p>
      </div>
    );
  }

  const submitLabel =
    templateLabels?.submitLabel?.trim() ||
    (typeof form.submitButtonLabel === 'string' ? form.submitButtonLabel.trim() : '') ||
    'Submit';
  const submittingLabel = templateLabels?.submittingLabel?.trim() || 'Submitting…';
  const legalText =
    templateLabels?.footerText?.trim() || templateLabels?.consentText?.trim() || '';
  const privacyLabel = templateLabels?.privacyLabel?.trim() || '';
  const privacyHref = templateLabels?.privacyHref?.trim() || '';
  const showPrivacyLink = privacyLabel.length > 0 && privacyHref.length > 0;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {form.fields
        .filter((field) => field.fieldType !== 'message')
        .map((field) => {
          const placeholder = resolveFieldPlaceholder(field, form.templateKey, templateLabels);

          return (
            <div key={field.id || field.name}>
              {field.fieldType === 'checkbox' ? (
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    name={field.name}
                    required={field.required}
                    checked={Boolean(values[field.name])}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.name]: e.target.checked }))
                    }
                    style={{ marginTop: '2px', flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontSize: '14px',
                      color: dark ? 'var(--ui-color-dark-text)' : 'var(--ui-color-primary)',
                    }}
                  >
                    {field.label}
                    {field.required ? (
                      <span aria-hidden="true" style={{ color: '#dc2626', marginLeft: '4px' }}>
                        *
                      </span>
                    ) : null}
                  </span>
                </label>
              ) : field.fieldType === 'select' ? (
                <>
                  <label htmlFor={`field-${field.name}`} style={labelStyle}>
                    {field.label}
                    {field.required ? (
                      <span aria-hidden="true" style={{ color: '#dc2626', marginLeft: '4px' }}>
                        *
                      </span>
                    ) : null}
                  </label>
                  <select
                    id={`field-${field.name}`}
                    name={field.name}
                    required={field.required}
                    value={String(values[field.name] || '')}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                    }
                    style={inputStyle}
                  >
                    <option value="">Select…</option>
                    {(field.options || []).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </>
              ) : field.fieldType === 'textarea' ? (
                <>
                  <label htmlFor={`field-${field.name}`} style={labelStyle}>
                    {field.label}
                    {field.required ? (
                      <span aria-hidden="true" style={{ color: '#dc2626', marginLeft: '4px' }}>
                        *
                      </span>
                    ) : null}
                  </label>
                  <textarea
                    id={`field-${field.name}`}
                    name={field.name}
                    required={field.required}
                    value={String(values[field.name] || '')}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                    }
                    rows={5}
                    placeholder={placeholder}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </>
              ) : (
                <>
                  <label htmlFor={`field-${field.name}`} style={labelStyle}>
                    {field.label}
                    {field.required ? (
                      <span aria-hidden="true" style={{ color: '#dc2626', marginLeft: '4px' }}>
                        *
                      </span>
                    ) : null}
                  </label>
                  <input
                    id={`field-${field.name}`}
                    type={
                      field.fieldType === 'email'
                        ? 'email'
                        : field.fieldType === 'number'
                          ? 'number'
                          : 'text'
                    }
                    name={field.name}
                    required={field.required}
                    value={String(values[field.name] || '')}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                    }
                    placeholder={placeholder}
                    style={inputStyle}
                  />
                </>
              )}
            </div>
          );
        })}

      {submitError ? (
        <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{submitError}</p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary"
        style={{ alignSelf: 'flex-start' }}
      >
        {submitting ? submittingLabel : submitLabel}
      </button>

      {legalText || showPrivacyLink ? (
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: dark ? 'var(--ui-color-dark-text-muted)' : 'var(--ui-color-text-muted)',
          }}
        >
          {legalText}
          {legalText && showPrivacyLink ? ' ' : ''}
          {showPrivacyLink ? (
            <a
              href={privacyHref}
              style={{ color: 'var(--ui-color-link)' }}
              target={privacyHref.startsWith('/') ? undefined : '_blank'}
              rel={privacyHref.startsWith('/') ? undefined : 'noopener noreferrer'}
            >
              {privacyLabel}
            </a>
          ) : null}
        </p>
      ) : null}
    </form>
  );
}
