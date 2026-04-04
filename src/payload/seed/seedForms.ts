import { getPayload } from '@/payload/client';

type SeedFormItem = {
  title: string;
  action: 'created' | 'exists';
  id: string;
};

export type SeedFormsResult = {
  created: number;
  existing: number;
  items: SeedFormItem[];
};

function lexicalParagraph(text: string): object {
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

type FormTemplate = {
  title: string;
  fields: object[];
  submitButtonLabel: string;
  confirmationMessage: object;
};

const FORM_TEMPLATES: FormTemplate[] = [
  {
    title: 'guide',
    fields: [
      { blockType: 'text', name: 'firstName', label: 'First Name', required: true },
      { blockType: 'email', name: 'email', label: 'Email Address', required: true },
    ],
    submitButtonLabel: 'Get My Free Guide',
    confirmationMessage: lexicalParagraph(
      "Thanks! Your guide is on its way to your inbox.",
    ),
  },
  {
    title: 'inquiry',
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
  },
];

export async function seedForms(): Promise<SeedFormsResult> {
  const payload = await getPayload();

  const items: SeedFormItem[] = [];
  let created = 0;
  let existing = 0;

  for (const template of FORM_TEMPLATES) {
    const found = await payload.find({
      collection: 'forms',
      where: { title: { equals: template.title } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });

    if (found.docs.length > 0) {
      existing += 1;
      items.push({
        title: template.title,
        action: 'exists',
        id: String((found.docs[0] as { id?: string | number }).id ?? ''),
      });
      continue;
    }

    const createdDoc = await payload.create({
      collection: 'forms',
      data: {
        title: template.title,
        fields: template.fields,
        submitButtonLabel: template.submitButtonLabel,
        confirmationType: 'message',
        confirmationMessage: template.confirmationMessage,
      },
      overrideAccess: true,
    });

    created += 1;
    items.push({
      title: template.title,
      action: 'created',
      id: String((createdDoc as { id?: string | number }).id ?? ''),
    });
  }

  return { created, existing, items };
}
