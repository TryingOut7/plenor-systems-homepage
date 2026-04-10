/**
 * Lazily resolves Payload form stub IDs for the guide and inquiry forms.
 *
 * The form-submissions collection (from the form builder plugin) requires a
 * relationship to a `forms` document. These stubs are minimal placeholder
 * form documents that exist purely to satisfy that relationship — they are
 * created on first use and the IDs are cached for the lifetime of the process.
 */
import { getPayload } from '@/payload/client';
import type { FormTemplateKey } from '@/domain/forms/formTemplates';
import type { RequiredDataFromCollectionSlug } from 'payload';
import {
  buildFormTemplateData,
  buildFormTemplateRepairData,
} from '@/payload/forms/formTemplateData';

let guideFormId: number | null = null;
let inquiryFormId: number | null = null;

async function getOrCreateStub(
  title: string,
  templateKey: FormTemplateKey,
): Promise<number> {
  const payload = await getPayload();
  const existing = await payload.find({
    collection: 'forms',
    where: {
      or: [
        { templateKey: { equals: templateKey } },
        { title: { equals: title } },
      ],
    },
    limit: 1,
    sort: 'id',
    overrideAccess: true,
  });
  if (existing.docs[0]) {
    const doc = existing.docs[0] as unknown as Record<string, unknown> & {
      id?: number | string;
    };
    const repairData = buildFormTemplateRepairData({ existing: doc, templateKey });
    if (doc.id && repairData) {
      await payload.update({
        collection: 'forms',
        id: doc.id,
        overrideAccess: true,
        depth: 0,
        data: repairData,
      });
    }
    if (doc.id != null) {
      return Number(doc.id);
    }
  }
  const created = await payload.create({
    collection: 'forms',
    data: buildFormTemplateData(templateKey, {
      title,
    }) as RequiredDataFromCollectionSlug<'forms'>,
    overrideAccess: true,
  });
  return Number(created.id);
}

export async function getGuideFormId(): Promise<number> {
  if (!guideFormId) guideFormId = await getOrCreateStub('Guide Download', 'guide');
  return guideFormId;
}

export async function getInquiryFormId(): Promise<number> {
  if (!inquiryFormId) inquiryFormId = await getOrCreateStub('Inquiry', 'inquiry');
  return inquiryFormId;
}
