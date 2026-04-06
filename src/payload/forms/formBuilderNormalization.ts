import {
  formatSupportedFormTemplateKeys,
  parseFormTemplateKey,
} from '../../domain/forms/formTemplates.ts';

function buildLexicalParagraph(text: string): Record<string, unknown> {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: [
            {
              type: 'text',
              format: 0,
              style: '',
              mode: 'normal',
              detail: 0,
              text,
              version: 1,
            },
          ],
        },
      ],
    },
  };
}

function hasLexicalRoot(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const root = (value as Record<string, unknown>).root;
  return !!root && typeof root === 'object' && !Array.isArray(root);
}

export function normalizeFormBuilderData(args: {
  data: unknown;
  operation: string;
  originalDoc?: unknown;
}): unknown {
  if (!args.data || typeof args.data !== 'object' || Array.isArray(args.data)) {
    return args.data;
  }

  const formData = args.data as Record<string, unknown>;
  const originalData =
    args.originalDoc && typeof args.originalDoc === 'object' && !Array.isArray(args.originalDoc)
      ? (args.originalDoc as Record<string, unknown>)
      : null;

  const defaultConfirmationMessage = 'Thank you! Your submission has been received.';
  const rawConfirmationMessage = formData.confirmationMessage;
  if (typeof rawConfirmationMessage === 'string' && rawConfirmationMessage.trim()) {
    formData.confirmationMessage = buildLexicalParagraph(rawConfirmationMessage.trim());
  } else if (!hasLexicalRoot(rawConfirmationMessage)) {
    formData.confirmationMessage = buildLexicalParagraph(defaultConfirmationMessage);
  }

  if (typeof formData.submitButtonLabel !== 'string' || !formData.submitButtonLabel.trim()) {
    formData.submitButtonLabel = 'Submit';
  }

  if (formData.confirmationType !== 'message' && formData.confirmationType !== 'redirect') {
    formData.confirmationType = 'message';
  }

  const originalTemplateKey = parseFormTemplateKey(originalData?.templateKey);
  const hasTemplateKeyInput = Object.prototype.hasOwnProperty.call(
    formData,
    'templateKey',
  );
  const rawTemplateKey = hasTemplateKeyInput ? formData.templateKey : undefined;

  if (rawTemplateKey == null || rawTemplateKey === '') {
    if (args.operation === 'update' && originalTemplateKey) {
      formData.templateKey = originalTemplateKey;
    }
    return formData;
  }

  const parsedTemplateKey = parseFormTemplateKey(rawTemplateKey);
  if (!parsedTemplateKey) {
    throw new Error(
      `templateKey must be one of: ${formatSupportedFormTemplateKeys()}.`,
    );
  }

  if (
    args.operation === 'update' &&
    originalTemplateKey &&
    parsedTemplateKey !== originalTemplateKey
  ) {
    throw new Error('templateKey is immutable once set.');
  }

  formData.templateKey = parsedTemplateKey;
  return formData;
}
