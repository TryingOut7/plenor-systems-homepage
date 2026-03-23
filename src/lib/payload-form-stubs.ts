/**
 * Lazily resolves Payload form stub IDs for the guide and inquiry forms.
 *
 * The form-submissions collection (from the form builder plugin) requires a
 * relationship to a `forms` document. These stubs are minimal placeholder
 * form documents that exist purely to satisfy that relationship — they are
 * created on first use and the IDs are cached for the lifetime of the process.
 */
import { getPayload } from '@/payload/client';

let guideFormId: number | string | null = null;
let inquiryFormId: number | string | null = null;

async function getOrCreateStub(title: string): Promise<number | string> {
  const payload = await getPayload();
  const existing = await payload.find({
    collection: 'forms',
    where: { title: { equals: title } },
    limit: 1,
    overrideAccess: true,
  });
  if (existing.docs[0]) return existing.docs[0].id;
  const created = await payload.create({
    collection: 'forms',
    data: { title, fields: [] },
    overrideAccess: true,
  });
  return created.id;
}

export async function getGuideFormId(): Promise<number | string> {
  if (!guideFormId) guideFormId = await getOrCreateStub('Guide Download');
  return guideFormId;
}

export async function getInquiryFormId(): Promise<number | string> {
  if (!inquiryFormId) inquiryFormId = await getOrCreateStub('Inquiry');
  return inquiryFormId;
}
