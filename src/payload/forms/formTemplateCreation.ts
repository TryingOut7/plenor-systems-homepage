import type { Payload, RequiredDataFromCollectionSlug, TypedUser } from 'payload';
import { resolveFormTemplate, type FormTemplateKey } from './formTemplates';
import {
  buildFormTemplateData,
  buildFormTemplateRepairData,
} from './formTemplateData';

type UnknownRecord = Record<string, unknown>;

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
    sort: 'id',
    depth: 0,
    overrideAccess: false,
    user: args.user,
  });

  if (existingByKey.docs.length > 0) {
    const existingRecord = existingByKey.docs[0] as unknown as UnknownRecord;
    const existingId = (existingRecord.id as number | string) ?? '';
    const repairData = buildFormTemplateRepairData({
      existing: existingRecord,
      templateKey: template.key,
    });
    if (existingId && repairData) {
      await args.payload.update({
        collection: 'forms',
        id: existingId,
        depth: 0,
        overrideAccess: false,
        user: args.user,
        data: repairData,
      });
    }
    return {
      created: false,
      id: existingId,
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
    sort: 'id',
    depth: 0,
    overrideAccess: false,
    user: args.user,
  });

  if (existing.docs.length > 0) {
    const existingRecord = existing.docs[0] as unknown as UnknownRecord;
    const existingId = (existingRecord.id as number | string) ?? '';
    const repairData = buildFormTemplateRepairData({
      existing: existingRecord,
      templateKey: template.key,
    });

    if (existingId && repairData) {
      await args.payload.update({
        collection: 'forms',
        id: existingId,
        depth: 0,
        overrideAccess: false,
        user: args.user,
        data: repairData,
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
    data: buildFormTemplateData(template.key) as RequiredDataFromCollectionSlug<'forms'>,
  });

  const createdRecord = created as unknown as UnknownRecord;
  return {
    created: true,
    id: (createdRecord.id as number | string) ?? '',
    title: readTrimmedString(createdRecord.title) || template.title,
  };
}
