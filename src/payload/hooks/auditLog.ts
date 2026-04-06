import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload';
import { AUDIT_ACTIONS } from '../constants/auditActions.ts';
import { listSystemFieldPathsForCollection } from '../systemFieldInventory.ts';
import {
  invalidateCmsCollectionCaches,
  invalidateCmsGlobalCaches,
} from '../cms/cache.ts';
import {
  revalidateCollectionContent,
  revalidateGlobalContent,
} from './revalidateCmsContent.ts';

type AuditRiskTier = 'routine' | 'system';
type UserRecord = Record<string, unknown>;

function getDocTitle(doc: Record<string, unknown>): string {
  return (
    (doc.title as string) ||
    (doc.name as string) ||
    (doc.personName as string) ||
    (doc.fromPath as string) ||
    (doc.slug as string) ||
    String(doc.id || 'unknown')
  );
}

function extractIpAddress(req: { headers?: unknown; ip?: unknown }): string | undefined {
  const headers = req.headers;
  if (headers && typeof headers === 'object') {
    const forwarded =
      (headers as Record<string, unknown>)['x-forwarded-for'] ||
      (headers as Record<string, unknown>)['X-Forwarded-For'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
      const first = forwarded.split(',')[0]?.trim();
      if (first) return first;
    }
  }

  return typeof req.ip === 'string' && req.ip.trim() ? req.ip.trim() : undefined;
}

function getPathValue(input: unknown, path: string): unknown {
  if (!input || typeof input !== 'object') return undefined;
  return path.split('.').reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[key];
  }, input);
}

function areValuesEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (!a || !b) return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

function shortHash(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).slice(0, 8);
}

function normalizeUrlSummary(raw: string): string {
  const value = raw.trim();
  if (!value) return '(empty)';
  if (value.startsWith('/')) return value.replace(/\/{2,}/g, '/');

  try {
    const parsed = new URL(value);
    const path = (parsed.pathname || '/').replace(/\/{2,}/g, '/');
    const query = parsed.search || '';
    return `${parsed.origin}${path}${query}`;
  } catch {
    return value;
  }
}

function summarizeExternalAssetUrl(raw: string): string {
  try {
    const parsed = new URL(raw.trim());
    return `${parsed.host}${parsed.pathname || '/'}`;
  } catch {
    return normalizeUrlSummary(raw);
  }
}

function summarizeScriptSources(value: string): string {
  const hosts = new Set<string>();
  const matches = value.matchAll(/<script\b[^>]*\bsrc\s*=\s*(['"])(.*?)\1/gi);
  for (const match of matches) {
    const src = match[2]?.trim();
    if (!src) continue;
    try {
      const parsed = new URL(src);
      hosts.add(parsed.host.toLowerCase());
    } catch {
      if (src.startsWith('/')) hosts.add('self');
    }
  }
  const sorted = [...hosts].sort();
  return `scripts=${sorted.length}${sorted.length > 0 ? ` hosts=${sorted.join(',')}` : ''}`;
}

function summarizeValue(fieldPath: string, value: unknown): string {
  if (value === undefined || value === null) return '(empty)';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '(empty)';

    if (fieldPath.toLowerCase().includes('customheadscripts')) {
      return summarizeScriptSources(trimmed);
    }

    if (/(token|secret|api.?key|password)/i.test(fieldPath)) {
      return `[REDACTED hash=${shortHash(trimmed)} len=${trimmed.length}]`;
    }

    if (
      /(url|href|path|canonical)/i.test(fieldPath) ||
      fieldPath.endsWith('fromPath') ||
      fieldPath.endsWith('toPath')
    ) {
      const normalized = normalizeUrlSummary(trimmed);
      if (
        /fonturl|scripturl|styleurl|stylesheet|externalstyle|externalscript|headingFontUrl|bodyFontUrl/i
          .test(fieldPath)
      ) {
        return summarizeExternalAssetUrl(normalized);
      }
      return normalized;
    }

    if (trimmed.length > 160) {
      return `${trimmed.slice(0, 160)}… [hash=${shortHash(trimmed)} len=${trimmed.length}]`;
    }
    return trimmed;
  }

  try {
    const encoded = JSON.stringify(value);
    if (!encoded) return '(empty)';
    if (encoded.length > 160) {
      return `json:${encoded.slice(0, 160)}… [hash=${shortHash(encoded)} len=${encoded.length}]`;
    }
    return `json:${encoded}`;
  } catch {
    return '[unserializable]';
  }
}

function summarizeTransition(oldSummary: string, newSummary: string): string {
  return `${oldSummary} -> ${newSummary}`;
}

function isSystemRiskCollection(collectionSlug: string): boolean {
  return collectionSlug === 'redirect-rules';
}

function buildAuditEntryData(args: {
  action: string;
  collection: string;
  documentId: string;
  documentTitle: string;
  userRecord: UserRecord;
  fieldPath: string;
  oldValueSummary: string;
  newValueSummary: string;
  riskTier: AuditRiskTier;
  ipAddress?: string;
}): Record<string, unknown> {
  const { action, collection, documentId, documentTitle, userRecord, fieldPath, oldValueSummary, newValueSummary, riskTier, ipAddress } = args;
  return {
    action,
    collection,
    documentId,
    documentTitle,
    user:
      typeof userRecord.id === 'string' || typeof userRecord.id === 'number'
        ? userRecord.id
        : undefined,
    ipAddress,
    fieldPath,
    oldValueSummary,
    newValueSummary,
    riskTier,
    summary: `${userRecord.email || 'Unknown'} changed ${collection}.${fieldPath}: ${summarizeTransition(oldValueSummary, newValueSummary)}`,
  };
}

export const auditLogInternals = {
  summarizeValue,
  summarizeTransition,
};

/**
 * Fires an async alert for system-tier (high-risk) audit events.
 * Writes a structured error log (captured by Vercel log drains + Sentry)
 * and optionally POSTs to OUTBOUND_WEBHOOK_URL when configured.
 */
function alertHighRiskAuditEvent(args: {
  action: string;
  collection: string;
  documentId: string;
  documentTitle: string;
  fieldPath: string;
  userEmail: string;
  summary: string;
}): void {
  // Structured log — visible in Vercel logs and Sentry as an error-level event.
  console.error('[AUDIT:SYSTEM_RISK]', JSON.stringify({
    action: args.action,
    collection: args.collection,
    documentId: args.documentId,
    documentTitle: args.documentTitle,
    fieldPath: args.fieldPath,
    user: args.userEmail,
    summary: args.summary,
    timestamp: new Date().toISOString(),
  }));

  // Outbound webhook (fire-and-forget, best-effort).
  const webhookUrl = process.env.OUTBOUND_WEBHOOK_URL;
  const webhookSecret = process.env.OUTBOUND_WEBHOOK_SECRET;
  if (!webhookUrl) return;

  const payload = JSON.stringify({
    event: 'cms.audit.system_risk',
    ...args,
    timestamp: new Date().toISOString(),
  });

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (webhookSecret) {
    headers['x-webhook-secret'] = webhookSecret;
  }

  fetch(webhookUrl, { method: 'POST', headers, body: payload }).catch(() => {
    // Best-effort — never throw from an audit hook.
  });
}

export const auditAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
  collection,
  context,
}) => {
  if (collection.slug === 'audit-logs') return doc;
  invalidateCmsCollectionCaches({
    collectionSlug: collection.slug,
    doc,
    previousDoc,
  });
  await revalidateCollectionContent(
    collection.slug as Parameters<typeof revalidateCollectionContent>[0],
    doc as Record<string, unknown>,
    previousDoc as Record<string, unknown> | undefined,
  );
  if (!req.user) return doc;

  // Skip autosave to avoid flooding audit logs
  if (context?.autosave) return doc;

  const userRecord = req.user as UserRecord;
  const ipAddress = extractIpAddress(req);
  const title = getDocTitle(doc as Record<string, unknown>);
  const action = operation === 'create' ? AUDIT_ACTIONS.CREATE : AUDIT_ACTIONS.UPDATE;
  const collectionRiskTier: AuditRiskTier = isSystemRiskCollection(collection.slug)
    ? 'system'
    : 'routine';

  try {
    await req.payload.create({
      collection: 'audit-logs',
      overrideAccess: true,
      data: buildAuditEntryData({
        action,
        collection: collection.slug,
        documentId: String(doc.id),
        documentTitle: title,
        userRecord,
        fieldPath: '*',
        oldValueSummary: operation === 'create' ? '(new document)' : '(document updated)',
        newValueSummary: operation === 'create' ? '(created)' : '(updated)',
        riskTier: collectionRiskTier,
        ipAddress,
      }),
    });

    const systemPaths = listSystemFieldPathsForCollection(collection.slug);
    if (systemPaths.length > 0) {
      const currentDoc = doc as Record<string, unknown>;
      const previous = previousDoc && typeof previousDoc === 'object'
        ? (previousDoc as Record<string, unknown>)
        : {};

      for (const path of systemPaths) {
        const oldValue = getPathValue(previous, path);
        const newValue = getPathValue(currentDoc, path);
        if (areValuesEqual(oldValue, newValue)) continue;

        const oldSummary = summarizeValue(path, oldValue);
        const newSummary = summarizeValue(path, newValue);
        const entrySummary = `${userRecord.email || 'Unknown'} changed ${collection.slug}.${path}: ${summarizeTransition(oldSummary, newSummary)}`;
        await req.payload.create({
          collection: 'audit-logs',
          overrideAccess: true,
          data: buildAuditEntryData({
            action,
            collection: collection.slug,
            documentId: String(doc.id),
            documentTitle: title,
            userRecord,
            fieldPath: path,
            oldValueSummary: oldSummary,
            newValueSummary: newSummary,
            riskTier: 'system',
            ipAddress,
          }),
        });
        alertHighRiskAuditEvent({
          action,
          collection: collection.slug,
          documentId: String(doc.id),
          documentTitle: title,
          fieldPath: path,
          userEmail: String(userRecord.email || 'Unknown'),
          summary: entrySummary,
        });
      }
    }
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
  invalidateCmsCollectionCaches({
    collectionSlug: collection.slug,
    doc,
  });
  await revalidateCollectionContent(
    collection.slug as Parameters<typeof revalidateCollectionContent>[0],
    {},
    doc as Record<string, unknown>,
  );
  if (!req.user) return doc;

  const userRecord = req.user as UserRecord;
  const ipAddress = extractIpAddress(req);
  const title = getDocTitle(doc as Record<string, unknown>);
  const riskTier: AuditRiskTier = isSystemRiskCollection(collection.slug)
    ? 'system'
    : 'routine';

  try {
    await req.payload.create({
      collection: 'audit-logs',
      overrideAccess: true,
      data: buildAuditEntryData({
        action: AUDIT_ACTIONS.DELETE,
        collection: collection.slug,
        documentId: String(doc.id),
        documentTitle: title,
        userRecord,
        fieldPath: '*',
        oldValueSummary: '(existing document)',
        newValueSummary: '(deleted)',
        riskTier,
        ipAddress,
      }),
    });
  } catch (err) {
    req.payload.logger.error({ err, msg: 'Failed to write audit log' });
  }

  return doc;
};

export const auditGlobalAfterChange: GlobalAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  context,
  global,
}) => {
  invalidateCmsGlobalCaches(global.slug);
  if (!context?.autosave) {
    await revalidateGlobalContent();
  }
  if (!req.user) return doc;
  if (context?.autosave) return doc;

  const userRecord = req.user as UserRecord;
  const ipAddress = extractIpAddress(req);
  const title = global.slug;
  const action = AUDIT_ACTIONS.UPDATE;
  const globalRiskTier: AuditRiskTier = isSystemRiskCollection(global.slug)
    ? 'system'
    : 'routine';

  try {
    await req.payload.create({
      collection: 'audit-logs',
      overrideAccess: true,
      data: buildAuditEntryData({
        action,
        collection: global.slug,
        documentId: global.slug,
        documentTitle: title,
        userRecord,
        fieldPath: '*',
        oldValueSummary: '(global updated)',
        newValueSummary: '(updated)',
        riskTier: globalRiskTier,
        ipAddress,
      }),
    });

    const systemPaths = listSystemFieldPathsForCollection(global.slug);
    if (systemPaths.length > 0) {
      const currentDoc = doc as Record<string, unknown>;
      const previous = previousDoc && typeof previousDoc === 'object'
        ? (previousDoc as Record<string, unknown>)
        : {};

      for (const path of systemPaths) {
        const oldValue = getPathValue(previous, path);
        const newValue = getPathValue(currentDoc, path);
        if (areValuesEqual(oldValue, newValue)) continue;

        const oldSummary = summarizeValue(path, oldValue);
        const newSummary = summarizeValue(path, newValue);
        const globalEntrySummary = `${userRecord.email || 'Unknown'} changed ${global.slug}.${path}: ${summarizeTransition(oldSummary, newSummary)}`;
        await req.payload.create({
          collection: 'audit-logs',
          overrideAccess: true,
          data: buildAuditEntryData({
            action,
            collection: global.slug,
            documentId: global.slug,
            documentTitle: title,
            userRecord,
            fieldPath: path,
            oldValueSummary: oldSummary,
            newValueSummary: newSummary,
            riskTier: 'system',
            ipAddress,
          }),
        });
        alertHighRiskAuditEvent({
          action,
          collection: global.slug,
          documentId: global.slug,
          documentTitle: title,
          fieldPath: path,
          userEmail: String(userRecord.email || 'Unknown'),
          summary: globalEntrySummary,
        });
      }
    }
  } catch (err) {
    req.payload.logger.error({ err, msg: 'Failed to write global audit log' });
  }

  return doc;
};
