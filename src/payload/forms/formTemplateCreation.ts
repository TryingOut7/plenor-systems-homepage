import type { Payload, RequiredDataFromCollectionSlug, TypedUser } from 'payload';
import { resolveFormTemplate, type FormTemplateKey } from './formTemplates';

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

function readTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function createOrGetFormTemplate(args: {
  payload: Payload;
  templateKey: FormTemplateKey;
  user: TypedUser;
}): Promise<{ created: boolean; id: number | string; title: string }> {
  const template = resolveFormTemplate(args.templateKey);
  if (!template) {
    throw new Error('Invalid form template key.');
  }

  const existingByKey = await args.payload.find({
    collection: 'forms',
    where: {
      templateKey: {
        equals: template.key,
      },
    },
    limit: 1,
    depth: 0,
    overrideAccess: false,
    user: args.user,
  });

  if (existingByKey.docs.length > 0) {
    const existingRecord = existingByKey.docs[0] as unknown as UnknownRecord;
    return {
      created: false,
      id: (existingRecord.id as number | string) ?? '',
      title: readTrimmedString(existingRecord.title) || template.title,
    };
  }

  const existing = await args.payload.find({
    collection: 'forms',
    where: {
      or: template.lookupTitles.map((title) => ({
        title: {
          equals: title,
        },
      })),
    },
    limit: 1,
    depth: 0,
    overrideAccess: false,
    user: args.user,
  });

  if (existing.docs.length > 0) {
    const existingRecord = existing.docs[0] as unknown as UnknownRecord;
    const existingId = (existingRecord.id as number | string) ?? '';
    const existingTemplateKey = readTrimmedString(existingRecord.templateKey);

    if (existingId && existingTemplateKey !== template.key) {
      await args.payload.update({
        collection: 'forms',
        id: existingId,
        depth: 0,
        overrideAccess: false,
        user: args.user,
        data: {
          templateKey: template.key,
        },
      });
    }

    return {
      created: false,
      id: existingId,
      title: readTrimmedString(existingRecord.title) || template.title,
    };
  }

  const created = await args.payload.create({
    collection: 'forms',
    depth: 0,
    overrideAccess: false,
    user: args.user,
    data: {
      title: template.title,
      templateKey: template.key,
      fields: cloneValue(template.fields),
      submitButtonLabel: template.submitButtonLabel,
      confirmationType: 'message',
      confirmationMessage: cloneValue(template.confirmationMessage),
    } as unknown as RequiredDataFromCollectionSlug<'forms'>,
  });

  const createdRecord = created as unknown as UnknownRecord;
  return {
    created: true,
    id: (createdRecord.id as number | string) ?? '',
    title: readTrimmedString(createdRecord.title) || template.title,
  };
}
