import { getPayload } from '@/payload/client';
import { FORM_TEMPLATES } from '@/payload/forms/formTemplates';

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
