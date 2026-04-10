import type { FormTemplateKey } from '../../domain/forms/formTemplates';
import { resolveFormTemplate } from './formTemplates';

type UnknownRecord = Record<string, unknown>;

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValue(entry)) as T;
  }

  if (value && typeof value === 'object') {
    const cloned: UnknownRecord = {};
    for (const [key, nestedValue] of Object.entries(value as UnknownRecord)) {
      cloned[key] = cloneValue(nestedValue);
    }
    return cloned as T;
  }

  return value;
}

function hasLexicalRoot(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const root = (value as UnknownRecord).root;
  return !!root && typeof root === 'object' && !Array.isArray(root);
}

function hasUsableFields(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

function readTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function buildFormTemplateData(
  templateKey: FormTemplateKey,
  overrides: UnknownRecord = {},
): UnknownRecord {
  const template = resolveFormTemplate(templateKey);
  if (!template) {
    throw new Error('Invalid form template key.');
  }

  return {
    title: template.title,
    templateKey: template.key,
    fields: cloneValue(template.fields),
    submitButtonLabel: template.submitButtonLabel,
    confirmationType: 'message',
    confirmationMessage: cloneValue(template.confirmationMessage),
    ...overrides,
  };
}

export function buildFormTemplateRepairData(args: {
  existing: unknown;
  templateKey: FormTemplateKey;
}): UnknownRecord | null {
  const template = resolveFormTemplate(args.templateKey);
  if (!template) return null;

  const existing =
    args.existing && typeof args.existing === 'object' && !Array.isArray(args.existing)
      ? (args.existing as UnknownRecord)
      : {};

  const patch: UnknownRecord = {};
  const hasFields = hasUsableFields(existing.fields);

  if (readTrimmedString(existing.templateKey) !== template.key) {
    patch.templateKey = template.key;
  }

  if (!hasFields) {
    patch.fields = cloneValue(template.fields);
    patch.submitButtonLabel = template.submitButtonLabel;
    patch.confirmationType = 'message';
    patch.confirmationMessage = cloneValue(template.confirmationMessage);
  } else {
    if (!readTrimmedString(existing.submitButtonLabel)) {
      patch.submitButtonLabel = template.submitButtonLabel;
    }

    if (existing.confirmationType !== 'message' && existing.confirmationType !== 'redirect') {
      patch.confirmationType = 'message';
    }

    if (!hasLexicalRoot(existing.confirmationMessage)) {
      patch.confirmationMessage = cloneValue(template.confirmationMessage);
    }
  }

  return Object.keys(patch).length > 0 ? patch : null;
}
