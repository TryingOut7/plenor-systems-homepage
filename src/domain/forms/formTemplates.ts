export const FORM_TEMPLATE_KEYS = ['guide', 'inquiry', 'newsletter'] as const;

export type FormTemplateKey = (typeof FORM_TEMPLATE_KEYS)[number];

export function isFormTemplateKey(value: unknown): value is FormTemplateKey {
  return (
    value === 'guide' ||
    value === 'inquiry' ||
    value === 'newsletter'
  );
}

export function parseFormTemplateKey(value: unknown): FormTemplateKey | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return isFormTemplateKey(trimmed) ? trimmed : null;
}

export function formatSupportedFormTemplateKeys(): string {
  return FORM_TEMPLATE_KEYS.join(', ');
}
