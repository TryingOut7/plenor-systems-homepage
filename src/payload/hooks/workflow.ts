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

async function resolveWorkflowNotifyEmail(req: unknown): Promise<string> {
  const reqRecord = req && typeof req === 'object' ? (req as Record<string, unknown>) : {};
  const payloadRecord = reqRecord.payload && typeof reqRecord.payload === 'object' ? (reqRecord.payload as Record<string, unknown>) : {};
  const findGlobal = typeof payloadRecord.findGlobal === 'function'
    ? payloadRecord.findGlobal as (args: { slug: string; depth: number; overrideAccess: boolean }) => Promise<unknown>
    : undefined;
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

  // Stamp submission attribution when an author submits for review.
  if (newStatus === 'in_review') {
    const user = req.user as unknown as UserRecord | undefined;
    data.submittedBy = user?.id || null;
    data.submittedAt = new Date().toISOString();
  }

  // Stamp approval attribution and run review-gate validation when approving or publishing.
  //
  // I-02 fix: approvedBy/approvedAt must NOT be overwritten when an admin publishes
  // a document that was already approved by an editor. The approver identity is set
  // once — at the approved transition — and preserved through publication.
  //
  // Stamping rules:
  //   approved → stamp always (editor/admin is the approver)
  //   published from non-approved (direct bypass) → stamp because no approval step ran
  //   published from approved → do NOT stamp; preserve the editor's approvedBy attribution
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

    // Stamp the approver only at the approval step itself, or on a direct-publish bypass.
    // When publishing from an already-approved state (approved → published) the editor's
    // approvedBy attribution is left intact; only a same-pass direct publish stamps here.
    const isDirectPublishBypass = newStatus === 'published' && oldStatus !== 'approved';
    if (newStatus === 'approved' || isDirectPublishBypass) {
      const user = req.user as unknown as UserRecord | undefined;
      data.approvedBy = user?.id || null;
      data.approvedAt = new Date().toISOString();
    }
  }

  // Require a rejection reason before allowing a rejected transition.
  if (newStatus === 'rejected') {
    const rejectionReason = readTrimmedString(data.rejectionReason);
    if (rejectionReason.length < 5) {
      logWorkflowBlock({
        req,
        code: 'WF_REJECTION_REASON_REQUIRED',
        role,
        oldStatus,
        newStatus,
        reason: 'rejectionReason must contain at least 5 characters before rejecting.',
      });
      throwWorkflowValidationError({
        req,
        collection: collectionSlug,
        errors: [
          {
            path: 'rejectionReason',
            message:
              'Workflow [WF_REJECTION_REASON_REQUIRED]: A rejection reason of at least 5 characters is required before rejecting.',
          },
        ],
      });
    }
  }

  // Clear approval fields when moving back to draft or rejected
  if (newStatus === 'draft' || newStatus === 'rejected') {
    data.approvedBy = null;
    data.approvedAt = null;
    if (newStatus === 'draft') {
      data.reviewChecklistComplete = false;
      data.submittedBy = null;
      data.submittedAt = null;
    }
  }

  return data;
};

/**
 * afterChange hook: sends email notification when workflow status changes.
 * Requires RESEND_API_KEY to be set; silently skips otherwise.
 *
 * I-04 / I-05 fix:
 *   The previous code used `isAuthorWithdrawal` based only on status values
 *   (in_review → draft), making it fire for editor-initiated returns as well.
 *   This caused the notification to be labelled "withdrawn from review" even
 *   when an editor moved content back to draft, which is semantically wrong and
 *   left the original author with no indication that an editor acted on their work.
 *
 *   Fixes:
 *   1. Determine the actor's role to distinguish author self-withdrawal from
 *      editor/admin-initiated return.
 *   2. Use role-appropriate notification labels.
 *   3. When an editor or admin returns content to draft, send a second notification
 *      directly to the original submitter (author) so they know their work was returned.
 *      The submitter's email is resolved from previousDoc.submittedBy (read before the
 *      hook clears it during the draft transition).
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

  // Classify in_review → draft transitions by who performed them.
  const isDraftReturn = newStatus === 'draft' && oldStatus === 'in_review';
  const actor = req.user as unknown as UserRecord | undefined;
  const actorRole = (actor as Record<string, unknown> | undefined)?.role as string | undefined;
  const isAuthorWithdrawal = isDraftReturn && actorRole === 'author';
  const isEditorReturn = isDraftReturn && !isAuthorWithdrawal; // editor or admin initiated

  // Skip transitions that have no notification value.
  const notifyStatuses = ['in_review', 'approved', 'rejected', 'published'];
  if (!notifyStatuses.includes(newStatus) && !isDraftReturn) return doc;

  const actorEmail = (actor?.email as string) || 'System';
  const docTitleRaw =
    (doc as Record<string, unknown>).title ||
    (doc as Record<string, unknown>).name ||
    (doc as Record<string, unknown>).personName ||
    String((doc as Record<string, unknown>).id);

  // L-02 Fix: Sanitize injected document title to prevent newline injection
  // or excessive length in email subjects.
  const docTitle = String(docTitleRaw)
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .slice(0, 150);

  // Build a role-accurate status label.
  let statusLabel: string;
  if (isAuthorWithdrawal) {
    statusLabel = 'withdrawn from review';
  } else if (isEditorReturn) {
    statusLabel = 'returned to draft';
  } else {
    statusLabel = newStatus;
  }

  const buildNotificationText = (extraLines: string[] = []): string =>
    [
      `Document: ${docTitle}`,
      `Collection: ${collection.slug}`,
      `Status: ${oldStatus || 'new'} → ${statusLabel}`,
      `Changed by: ${actorEmail}`,
      newStatus === 'rejected'
        ? `Reason: ${(doc as Record<string, unknown>).rejectionReason || '(none provided)'}`
        : '',
      ...extraLines,
    ]
      .filter(Boolean)
      .join('\n');

  const subject = `[Workflow] ${collection.slug}: "${docTitle}" → ${statusLabel}`;
  try {
    // Notify the admin workflow inbox on all meaningful transitions.
    const adminEmail = await resolveWorkflowNotifyEmail(req);
    if (adminEmail) {
      await req.payload.sendEmail({
        to: adminEmail,
        subject,
        text: buildNotificationText(),
      });
    }

    // I-04/I-05: When an editor or admin returns content to draft, the original
    // submitter (author) must also be notified so they are not left wondering what
    // happened to their submission. The submitter email is read from previousDoc
    // because the beforeChange hook clears submittedBy during draft transitions.
    if (isEditorReturn) {
      const submittedById = (previousDoc as Record<string, unknown> | undefined)?.submittedBy;
      if (submittedById) {
        try {
          const submitter = await req.payload.findByID({
            collection: 'users',
            id: typeof submittedById === 'object'
              ? String((submittedById as Record<string, unknown>).id ?? submittedById)
              : String(submittedById),
            depth: 0,
            overrideAccess: true,
          });
          const submitterEmail = (submitter as unknown as Record<string, unknown>)?.email as string | undefined;
            if (submitterEmail && submitterEmail !== adminEmail) {
              await req.payload.sendEmail({
                to: submitterEmail,
                subject: `[Workflow] Your submission "${docTitle}" has been returned to draft`,
                text: buildNotificationText([
                  '',
                  `Your submission has been returned to draft by ${actorEmail}.`,
                  'Please review any feedback and resubmit when ready.',
                ]),
              });
            }
        } catch (submitterErr) {
          // A failure to notify the submitter must never block the workflow.
          req.payload.logger.error({
            err: submitterErr,
            msg: 'Workflow submitter notification failed — admin was notified but author was not',
            collection: collection.slug,
            documentId: String((doc as Record<string, unknown>).id),
          });
        }
      }
    }
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
