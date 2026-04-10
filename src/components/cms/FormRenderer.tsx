'use client';

import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import type {
  GuideFormLabels,
  InquiryFormLabels,
} from '@/components/cms/sections/types';

type SectionTheme = 'navy' | 'charcoal' | 'black' | 'white' | 'light';

interface FormField {
  id: string;
  name: string;
  label: string;
  // Payload form builder returns blockType, not fieldType
  blockType: 'text' | 'textarea' | 'email' | 'number' | 'select' | 'checkbox' | 'message';
  fieldType?: 'text' | 'textarea' | 'email' | 'number' | 'select' | 'checkbox' | 'message';
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: string;
}

interface FormData {
  id: string;
  title: string;
  templateKey?: 'guide' | 'inquiry';
  emailTemplate?: { id: string | number } | string | number | null;
  fields: FormField[];
  submitButtonLabel?: string;
  confirmationType?: 'message' | 'redirect';
  confirmationMessage?: unknown;
  redirect?: { url?: string };
}

interface FormRendererProps {
  formId: string;
  resolveAlias?: 'guide' | 'inquiry';
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
    const resolvedTemplateId =
      form.emailTemplate && typeof form.emailTemplate === 'object'
        ? (form.emailTemplate as { id: string | number }).id
        : typeof form.emailTemplate === 'string' || typeof form.emailTemplate === 'number'
          ? form.emailTemplate
          : undefined;
    return {
      endpoint: '/api/guide',
      payload: {
        name: readTextValue(values, 'firstName') || readTextValue(values, 'name'),
        email: readTextValue(values, 'email'),
        ...(formId ? { formId } : {}),
        ...(resolvedTemplateId !== undefined ? { templateId: resolvedTemplateId } : {}),
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

const STATIC_FORM_FALLBACKS: Record<'guide' | 'inquiry', FormData> = {
  guide: {
    id: 'static-guide',
    title: 'Guide',
    templateKey: 'guide',
    fields: [
      { id: 'firstName', name: 'firstName', label: 'First Name', blockType: 'text', required: true },
      { id: 'email', name: 'email', label: 'Email Address', blockType: 'email', required: true },
    ],
    submitButtonLabel: 'Get My Free Guide',
    confirmationType: 'message',
    confirmationMessage: "Thanks! Your guide is on its way to your inbox.",
  },
  inquiry: {
    id: 'static-inquiry',
    title: 'Inquiry',
    templateKey: 'inquiry',
    fields: [
      { id: 'name', name: 'name', label: 'Full Name', blockType: 'text', required: true },
      { id: 'email', name: 'email', label: 'Email Address', blockType: 'email', required: true },
      { id: 'company', name: 'company', label: 'Company', blockType: 'text', required: false },
      { id: 'challenge', name: 'challenge', label: 'What challenge are you solving?', blockType: 'textarea', required: false },
    ],
    submitButtonLabel: 'Send Message',
    confirmationType: 'message',
    confirmationMessage: "Thanks for reaching out! We'll be in touch shortly.",
  },
};

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
  resolveAlias,
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
  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    '--cms-form-label-color': dark
      ? 'var(--ui-color-dark-text)'
      : 'var(--ui-color-primary)',
    '--cms-form-control-border': dark
      ? 'rgba(255,255,255,0.2)'
      : 'var(--ui-color-border)',
    '--cms-form-control-background': dark
      ? 'rgba(255,255,255,0.08)'
      : 'var(--ui-color-surface)',
    '--cms-form-control-text': dark
      ? 'var(--ui-color-dark-text)'
      : 'var(--ui-color-primary)',
    '--cms-form-control-placeholder': dark
      ? 'var(--ui-color-dark-text-muted)'
      : 'var(--ui-color-text-muted)',
    '--cms-form-helper-color': dark
      ? 'var(--ui-color-dark-text-muted)'
      : 'var(--ui-color-text-muted)',
    '--cms-form-focus-color': dark
      ? 'var(--ui-color-dark-text)'
      : 'var(--ui-color-focus)',
  } as CSSProperties;

  useEffect(() => {
    if (!formId && !resolveAlias) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    // For alias resolution, use the dedicated /api/form-ids endpoint (single raw pg
    // query with CDN caching) instead of Payload REST which runs countDistinct + find
    // and causes connection contention on Vercel Hobby's single PgBouncer slot.
    const fetchForm: Promise<FormData> = resolveAlias
      ? fetch('/api/form-ids')
          .then((res) => {
            if (!res.ok) throw new Error('Failed to load form IDs');
            return res.json() as Promise<{ guide: number | null; inquiry: number | null }>;
          })
          .then(({ guide, inquiry }) => {
            const resolvedId = resolveAlias === 'guide' ? guide : resolveAlias === 'inquiry' ? inquiry : null;
            if (!resolvedId) return STATIC_FORM_FALLBACKS[resolveAlias];
            return fetch(`/api/forms/${resolvedId}?depth=1`).then((res) => {
              if (!res.ok) return STATIC_FORM_FALLBACKS[resolveAlias];
              return res.json() as Promise<FormData>;
            });
          })
      : fetch(`/api/forms/${formId}?depth=1`).then((res) => {
          if (!res.ok) throw new Error('Failed to load form');
          return res.json() as Promise<FormData>;
        });

    fetchForm
      .then((data) => {
        setForm(data);
        const defaults: Record<string, string | boolean> = {};
        (data.fields || []).forEach((field) => {
          if ((field.blockType ?? field.fieldType) === 'checkbox') {
            defaults[field.name] = false;
          } else {
            defaults[field.name] = field.defaultValue || '';
          }
        });
        setValues(defaults);
      })
      .catch(() => setError('Could not load form. Please try again later.'))
      .finally(() => setLoading(false));
  }, [formId, resolveAlias]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const target = resolveSubmitTarget(form, values, form.id || formId);
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
    <form onSubmit={handleSubmit} style={formStyle}>
      {(form.fields || [])
        .filter((field) => (field.blockType ?? field.fieldType) !== 'message')
        .map((field) => {
          const placeholder = resolveFieldPlaceholder(field, form.templateKey, templateLabels);
          const ft = field.blockType ?? field.fieldType;

          return (
            <div key={field.id || field.name}>
              {ft === 'checkbox' ? (
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
              ) : ft === 'select' ? (
                <>
                  <label htmlFor={`field-${field.name}`} className="cms-form-label">
                    {field.label}
                    {field.required ? (
                      <span aria-hidden="true" style={{ color: '#dc2626', marginLeft: '4px' }}>
                        *
                      </span>
                    ) : null}
                  </label>
                  <select
                    className="form-input"
                    id={`field-${field.name}`}
                    name={field.name}
                    required={field.required}
                    value={String(values[field.name] || '')}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                    }
                  >
                    <option value="">Select…</option>
                    {(field.options || []).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </>
              ) : ft === 'textarea' ? (
                <>
                  <label htmlFor={`field-${field.name}`} className="cms-form-label">
                    {field.label}
                    {field.required ? (
                      <span aria-hidden="true" style={{ color: '#dc2626', marginLeft: '4px' }}>
                        *
                      </span>
                    ) : null}
                  </label>
                  <textarea
                    className="form-input"
                    id={`field-${field.name}`}
                    name={field.name}
                    required={field.required}
                    value={String(values[field.name] || '')}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                    }
                    rows={5}
                    placeholder={placeholder}
                    style={{ resize: 'vertical' }}
                  />
                </>
              ) : (
                <>
                  <label htmlFor={`field-${field.name}`} className="cms-form-label">
                    {field.label}
                    {field.required ? (
                      <span aria-hidden="true" style={{ color: '#dc2626', marginLeft: '4px' }}>
                        *
                      </span>
                    ) : null}
                  </label>
                  <input
                    className="form-input"
                    id={`field-${field.name}`}
                    type={
                      ft === 'email'
                        ? 'email'
                        : ft === 'number'
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
