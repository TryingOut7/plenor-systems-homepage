import type { RequiredDataFromCollectionSlug } from 'payload';
import { getPayload } from '@/payload/client';
import { FORM_TEMPLATES } from '@/payload/forms/formTemplates';
import {
  buildFormTemplateData,
  buildFormTemplateRepairData,
} from '@/payload/forms/formTemplateData';

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
      sort: 'id',
      depth: 0,
      overrideAccess: true,
    });

    if (found.docs.length > 0) {
      const existingDoc = found.docs[0] as unknown as Record<string, unknown> & {
        id?: string | number;
      };
      const repairData = buildFormTemplateRepairData({
        existing: existingDoc,
        templateKey: template.key,
      });
      if (existingDoc.id && repairData) {
        await payload.update({
          collection: 'forms',
          id: existingDoc.id,
          overrideAccess: true,
          depth: 0,
          data: repairData,
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
      data: buildFormTemplateData(template.key) as RequiredDataFromCollectionSlug<'forms'>,
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
