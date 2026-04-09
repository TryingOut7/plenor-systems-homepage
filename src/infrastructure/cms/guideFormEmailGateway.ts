import { parseFormTemplateKey } from '@/domain/forms/formTemplates';
import { getGuideFormId } from '@/lib/payload-form-stubs';
import { getPayload } from '@/payload/client';

type FormRecord = Record<string, unknown>;

function shouldSkipPayload(): boolean {
  return process.env.CMS_SKIP_PAYLOAD === 'true';
}

function normalizeId(value: unknown): string | number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }
  return undefined;
}

function relationId(value: unknown): string | number | undefined {
  const direct = normalizeId(value);
  if (direct !== undefined) return direct;

  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  return normalizeId((value as FormRecord).id);
}

function hasCustomEmails(value: unknown): boolean {
  if (!Array.isArray(value)) return false;

  return value.some((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false;
    const record = entry as FormRecord;
    const emailTo = typeof record.emailTo === 'string' ? record.emailTo.trim() : '';
    const subject = typeof record.subject === 'string' ? record.subject.trim() : '';
    return emailTo.length > 0 || subject.length > 0 || !!record.message;
  });
}

async function findGuideFormById(id: string | number): Promise<FormRecord | null> {
  if (shouldSkipPayload()) return null;

  const payload = await getPayload();
  try {
    const doc = (await payload.findByID({
      collection: 'forms',
      id,
      depth: 0,
      overrideAccess: true,
    })) as unknown as FormRecord | null;

    if (!doc) return null;
    if (parseFormTemplateKey(doc.templateKey) !== 'guide') return null;
    return doc;
  } catch {
    return null;
  }
}

export async function resolveGuideFormForEmail(
  requestedFormId?: string | number,
): Promise<FormRecord | null> {
  if (shouldSkipPayload()) return null;

  const requested = normalizeId(requestedFormId);
  if (requested !== undefined) {
    const requestedDoc = await findGuideFormById(requested);
    if (requestedDoc) return requestedDoc;
  }

  const fallbackId = await getGuideFormId();
  return findGuideFormById(fallbackId);
}

export async function getGuideFormEmailConfig(
  requestedFormId?: string | number,
): Promise<{
  formId?: string | number;
  hasCustomEmails: boolean;
  templateId?: string | number;
}> {
  const formDoc = await resolveGuideFormForEmail(requestedFormId);
  if (!formDoc) return { hasCustomEmails: false };

  return {
    formId: normalizeId(formDoc.id),
    hasCustomEmails: hasCustomEmails(formDoc.emails),
    templateId: relationId(formDoc.emailTemplate),
  };
}
