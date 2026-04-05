import {
  ValidationError,
  type CollectionBeforeChangeHook,
  type CollectionAfterChangeHook,
} from 'payload';
import type { WorkflowStatus } from '../fields/workflow.ts';

type UserRecord = Record<string, unknown>;
type PayloadLogger = {
  warn?: (payload: unknown) => void;
};

function getUserRole(req: { user?: unknown }): string | null {
  const user = req.user as UserRecord | undefined;
  return (user?.role as string) || null;
}

function readTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function resolvePayloadLogger(req: unknown): PayloadLogger {
  const requestRecord = req && typeof req === 'object' ? (req as Record<string, unknown>) : {};
  const payloadRecord =
    requestRecord.payload && typeof requestRecord.payload === 'object'
      ? (requestRecord.payload as Record<string, unknown>)
      : {};
  const loggerRecord =
    payloadRecord.logger && typeof payloadRecord.logger === 'object'
      ? (payloadRecord.logger as PayloadLogger)
      : {};
  return loggerRecord;
}

function logWorkflowBlock(args: {
  req: unknown;
  code: string;
  role: string | null;
  oldStatus: string;
  newStatus: string;
  reason: string;
}): void {
  const { req, code, role, oldStatus, newStatus, reason } = args;
  const logger = resolvePayloadLogger(req);
  logger.warn?.({
    msg: 'Workflow transition blocked',
    code,
    role: role || 'unknown',
    oldStatus,
    newStatus,
    reason,
  });
}

function throwWorkflowValidationError(args: {
  req: unknown;
  collection?: string;
  errors: Array<{ path: string; message: string }>;
}): never {
  const reqRecord =
    args.req && typeof args.req === 'object'
      ? (args.req as Record<string, unknown>)
      : undefined;

  throw new ValidationError({
    ...(args.collection ? { collection: args.collection } : {}),
    errors: args.errors,
    ...(reqRecord ? { req: reqRecord } : {}),
  });
}

async function resolveWorkflowNotifyEmail(req: {
  payload?: {
    findGlobal?: (args: { slug: string; depth: number; overrideAccess: boolean }) => Promise<unknown>;
  };
}): Promise<string> {
  const findGlobal = req.payload?.findGlobal;
  try {
    const siteSettings = findGlobal
      ? await findGlobal({
      slug: 'site-settings',
      depth: 0,
      overrideAccess: true,
        })
      : null;
    const contentRouting = asObject((siteSettings as Record<string, unknown>)?.contentRouting);
    const fromSettings = readTrimmedString(contentRouting.workflowNotifyEmail);
    if (fromSettings) return fromSettings;
  } catch {
    // Ignore CMS read failures and fall back to environment-level defaults.
  }

  return (
    readTrimmedString(process.env.WORKFLOW_NOTIFY_EMAIL) ||
    readTrimmedString(process.env.RESEND_FROM_EMAIL)
  );
}

/**
 * Allowed state transitions per role.
 * Each key is a "from" status mapping to which statuses each role may move to.
 */
const transitions: Record<WorkflowStatus, Partial<Record<string, WorkflowStatus[]>>> = {
  draft: {
    author: ['in_review'],
    editor: ['in_review', 'approved'],
    admin: ['in_review', 'approved', 'published'],
  },
  in_review: {
    author: ['draft'], // withdraw
    editor: ['approved', 'rejected', 'draft'],
    admin: ['approved', 'rejected', 'published', 'draft'],
  },
  approved: {
    author: [],
    editor: ['draft'],
    admin: ['published', 'draft'],
  },
  rejected: {
    author: ['draft'],
    editor: ['draft', 'in_review'],
    admin: ['draft', 'in_review', 'approved', 'published'],
  },
  published: {
    author: [],
    editor: ['draft'],
    admin: ['draft', 'in_review'],
  },
};

/**
 * beforeChange hook: validates workflow transitions and stamps approval metadata.
 */
export const workflowBeforeChange: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
  operation,
  collection,
}) => {
  const collectionSlug =
    collection && typeof collection === 'object' && typeof collection.slug === 'string'
      ? collection.slug
      : undefined;
  const newStatus = data.workflowStatus as WorkflowStatus | undefined;
  if (!newStatus) return data;

  // On create, authors must start as draft; editors/admins may choose a status
  if (operation === 'create') {
    const role = getUserRole(req);
    if (role === 'author' && newStatus !== 'draft') {
      data.workflowStatus = 'draft';
    }
    return data;
  }

  const oldStatus = (originalDoc?.workflowStatus as WorkflowStatus) || 'draft';
  // Intentionally short-circuit when status is unchanged: metadata stamping and
  // transition validation only run on explicit status transitions.
  if (newStatus === oldStatus) return data;

  const role = getUserRole(req);
  if (!role) {
    logWorkflowBlock({
      req,
      code: 'WF_ROLE_REQUIRED',
      role,
      oldStatus,
      newStatus,
      reason: 'Authenticated workflow role is required.',
    });
    throwWorkflowValidationError({
      req,
      collection: collectionSlug,
      errors: [
        {
          path: 'workflowStatus',
          message:
            'Workflow [WF_ROLE_REQUIRED]: cannot change status without an authenticated user role.',
        },
      ],
    });
  }

  const allowed = transitions[oldStatus]?.[role] || [];
  if (!allowed.includes(newStatus)) {
    logWorkflowBlock({
      req,
      code: 'WF_TRANSITION_DENIED',
      role,
      oldStatus,
      newStatus,
      reason: `Role "${role}" cannot transition from "${oldStatus}" to "${newStatus}".`,
    });
    throwWorkflowValidationError({
      req,
      collection: collectionSlug,
      errors: [
        {
          path: 'workflowStatus',
          message: `Workflow [WF_TRANSITION_DENIED]: ${role} cannot move from "${oldStatus}" to "${newStatus}".`,
        },
      ],
    });
  }

  // Stamp approval metadata and review attribution when a reviewer approves/publishes.
  if (newStatus === 'approved' || newStatus === 'published') {
    const reviewSummary = readTrimmedString(data.reviewSummary);
    if (reviewSummary.length < 10) {
      logWorkflowBlock({
        req,
        code: 'WF_REVIEW_SUMMARY_REQUIRED',
        role,
        oldStatus,
        newStatus,
        reason: 'reviewSummary must contain at least 10 characters before approval/publish.',
      });
      throwWorkflowValidationError({
        req,
        collection: collectionSlug,
        errors: [
          {
            path: 'reviewSummary',
            message:
              'Workflow [WF_REVIEW_SUMMARY_REQUIRED]: reviewSummary must contain at least 10 characters before approval/publish.',
          },
        ],
      });
    }

    if (data.reviewChecklistComplete !== true) {
      logWorkflowBlock({
        req,
        code: 'WF_REVIEW_CHECKLIST_REQUIRED',
        role,
        oldStatus,
        newStatus,
        reason: 'reviewChecklistComplete must be confirmed before approval/publish.',
      });
      throwWorkflowValidationError({
        req,
        collection: collectionSlug,
        errors: [
          {
            path: 'reviewChecklistComplete',
            message:
              'Workflow [WF_REVIEW_CHECKLIST_REQUIRED]: reviewChecklistComplete must be confirmed before approval/publish.',
          },
        ],
      });
    }

    const user = req.user as UserRecord | undefined;
    data.reviewedBy = user?.id || null;
    data.reviewedAt = new Date().toISOString();
    data.approvedBy = user?.id || null;
    data.approvedAt = new Date().toISOString();
  }

  // Clear approval fields when moving back to draft or rejected
  if (newStatus === 'draft' || newStatus === 'rejected') {
    data.approvedBy = null;
    data.approvedAt = null;
    data.reviewedBy = null;
    data.reviewedAt = null;
    if (newStatus === 'draft') {
      data.reviewChecklistComplete = false;
    }
  }

  return data;
};

/**
 * afterChange hook: sends email notification when workflow status changes.
 * Requires RESEND_API_KEY to be set; silently skips otherwise.
 */
export const workflowAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  collection,
}) => {
  const newStatus = (doc as Record<string, unknown>).workflowStatus as string | undefined;
  const oldStatus = (previousDoc as Record<string, unknown> | undefined)?.workflowStatus as string | undefined;

  if (!newStatus || newStatus === oldStatus) return doc;

  // Only notify on meaningful transitions
  const notifyStatuses = ['in_review', 'approved', 'rejected', 'published'];
  if (!notifyStatuses.includes(newStatus)) return doc;

  const actor = req.user as UserRecord | undefined;
  const actorEmail = (actor?.email as string) || 'System';
  const docTitle = (doc as Record<string, unknown>).title ||
    (doc as Record<string, unknown>).name ||
    (doc as Record<string, unknown>).personName ||
    String((doc as Record<string, unknown>).id);

  const subject = `[Workflow] ${collection.slug}: "${docTitle}" → ${newStatus}`;
  const text = [
    `Document: ${docTitle}`,
    `Collection: ${collection.slug}`,
    `Status: ${oldStatus || 'new'} → ${newStatus}`,
    `Changed by: ${actorEmail}`,
    newStatus === 'rejected'
      ? `Reason: ${(doc as Record<string, unknown>).rejectionReason || '(none provided)'}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const adminEmail = await resolveWorkflowNotifyEmail(req);
    if (!adminEmail) return doc;

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@example.com';
    await req.payload.sendEmail({
      from: fromEmail,
      to: adminEmail,
      subject,
      text,
    });
  } catch (err) {
    req.payload.logger.error({
      err,
      msg: 'Workflow notification email failed',
      collection: collection.slug,
      documentId: String((doc as Record<string, unknown>).id),
      newStatus,
      oldStatus: oldStatus || 'new',
    });
  }

  return doc;
};
