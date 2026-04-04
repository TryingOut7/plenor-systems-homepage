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
      where: {
        or: [
          { templateKey: { equals: template.key } },
          { title: { equals: template.title } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });

    if (found.docs.length > 0) {
      const existingDoc = found.docs[0] as { id?: string | number; templateKey?: unknown };
      if (existingDoc.id && existingDoc.templateKey !== template.key) {
        await payload.update({
          collection: 'forms',
          id: existingDoc.id,
          overrideAccess: true,
          depth: 0,
          data: {
            templateKey: template.key,
          },
        });
      }

      existing += 1;
      items.push({
        title: template.title,
        action: 'exists',
        id: String(existingDoc.id ?? ''),
      });
      continue;
    }

    const createdDoc = await payload.create({
      collection: 'forms',
      data: {
        title: template.title,
        templateKey: template.key,
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
