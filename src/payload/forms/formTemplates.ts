import { isFormTemplateKey, type FormTemplateKey } from '@/domain/forms/formTemplates';

type FormTemplate = {
  confirmationMessage: Record<string, unknown>;
  fields: Array<Record<string, unknown>>;
  key: FormTemplateKey;
  label: string;
  lookupTitles: string[];
  submitButtonLabel: string;
  title: string;
};

function lexicalParagraph(text: string): Record<string, unknown> {
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

const GUIDE_FORM_TEMPLATE: FormTemplate = {
  key: 'guide',
  label: 'Guide',
  title: 'guide',
  lookupTitles: ['guide', 'Guide Download'],
  fields: [
    { blockType: 'text', name: 'firstName', label: 'First Name', required: true },
    { blockType: 'email', name: 'email', label: 'Email Address', required: true },
  ],
  submitButtonLabel: 'Get My Free Guide',
  confirmationMessage: lexicalParagraph(
    "Thanks! Your guide is on its way to your inbox.",
  ),
};

const INQUIRY_FORM_TEMPLATE: FormTemplate = {
  key: 'inquiry',
  label: 'Inquiry',
  title: 'inquiry',
  lookupTitles: ['inquiry', 'Inquiry'],
  fields: [
    { blockType: 'text', name: 'name', label: 'Full Name', required: true },
    { blockType: 'email', name: 'email', label: 'Email Address', required: true },
    { blockType: 'text', name: 'company', label: 'Company', required: false },
    {
      blockType: 'textarea',
      name: 'challenge',
      label: 'What challenge are you solving?',
      required: false,
    },
  ],
  submitButtonLabel: 'Send Message',
  confirmationMessage: lexicalParagraph(
    "Thanks for reaching out! We'll be in touch shortly.",
  ),
};

const NEWSLETTER_FORM_TEMPLATE: FormTemplate = {
  key: 'newsletter',
  label: 'Newsletter',
  title: 'newsletter',
  lookupTitles: ['newsletter', 'Newsletter'],
  fields: [
    { blockType: 'email', name: 'email', label: 'Email Address', required: true },
  ],
  submitButtonLabel: 'Subscribe',
  confirmationMessage: lexicalParagraph(
    "Thanks for subscribing! You're on the list.",
  ),
};

export const FORM_TEMPLATES: FormTemplate[] = [
  GUIDE_FORM_TEMPLATE,
  INQUIRY_FORM_TEMPLATE,
  NEWSLETTER_FORM_TEMPLATE,
];

const FORM_TEMPLATE_BY_KEY: Record<FormTemplateKey, FormTemplate> = {
  guide: GUIDE_FORM_TEMPLATE,
  inquiry: INQUIRY_FORM_TEMPLATE,
  newsletter: NEWSLETTER_FORM_TEMPLATE,
};

export function resolveFormTemplate(key: unknown): FormTemplate | null {
  if (!isFormTemplateKey(key)) return null;
  return FORM_TEMPLATE_BY_KEY[key];
}

export type { FormTemplate, FormTemplateKey };
