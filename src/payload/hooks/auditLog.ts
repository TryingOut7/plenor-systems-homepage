import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload';
import { AUDIT_ACTIONS } from '../constants/auditActions.ts';

function getDocTitle(doc: Record<string, unknown>): string {
  return (
    (doc.title as string) ||
    (doc.personName as string) ||
    (doc.name as string) ||
    (doc.fromPath as string) ||
    (doc.slug as string) ||
    String(doc.id || 'unknown')
  );
}

export const auditAfterChange: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  collection,
  context,
}) => {
  if (collection.slug === 'audit-logs') return doc;
  if (!req.user) return doc;

  // Skip autosave to avoid flooding audit logs
  if (context?.autosave) return doc;

  const userRecord = req.user as Record<string, unknown>;
  const title = getDocTitle(doc as Record<string, unknown>);
  const action = operation === 'create' ? AUDIT_ACTIONS.CREATE : AUDIT_ACTIONS.UPDATE;
  const summary = `${userRecord.email || 'Unknown'} ${action}d ${collection.slug}: ${title}`;

  try {
    await req.payload.create({
      collection: 'audit-logs',
      overrideAccess: true,
      data: {
        action,
        collection: collection.slug,
        documentId: String(doc.id),
        documentTitle: title,
        user: typeof userRecord.id === 'string' || typeof userRecord.id === 'number' ? userRecord.id : undefined,
        userEmail: (userRecord.email as string) || undefined,
        summary,
      },
    });
  } catch (err) {
    req.payload.logger.error({ err, msg: 'Failed to write audit log' });
  }

  return doc;
};

export const auditAfterDelete: CollectionAfterDeleteHook = async ({
  doc,
  req,
  collection,
}) => {
  if (collection.slug === 'audit-logs') return doc;
  if (!req.user) return doc;

  const userRecord = req.user as Record<string, unknown>;
  const title = getDocTitle(doc as Record<string, unknown>);
  const summary = `${userRecord.email || 'Unknown'} deleted ${collection.slug}: ${title}`;

  try {
    await req.payload.create({
      collection: 'audit-logs',
      overrideAccess: true,
      data: {
        action: AUDIT_ACTIONS.DELETE,
        collection: collection.slug,
        documentId: String(doc.id),
        documentTitle: title,
        user: typeof userRecord.id === 'string' || typeof userRecord.id === 'number' ? userRecord.id : undefined,
        userEmail: (userRecord.email as string) || undefined,
        summary,
      },
    });
  } catch (err) {
    req.payload.logger.error({ err, msg: 'Failed to write audit log' });
  }

  return doc;
};
