import type {
  CollectionBeforeChangeHook,
  CollectionAfterChangeHook,
} from 'payload';
import type { WorkflowStatus } from '../fields/workflow.ts';

type UserRecord = Record<string, unknown>;

function getUserRole(req: { user?: unknown }): string | null {
  const user = req.user as UserRecord | undefined;
  return (user?.role as string) || null;
}

function readTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Allowed state transitions per role.
 * Each key is a "from" status mapping to which statuses each role may move to.
 */
const transitions: Record<WorkflowStatus, Partial<Record<string, WorkflowStatus[]>>> = {
  draft: {
    author: ['in_review'],
    editor: ['in_review', 'approved', 'published'],
    admin: ['in_review', 'approved', 'published'],
  },
  in_review: {
    author: ['draft'], // withdraw
    editor: ['approved', 'rejected', 'draft'],
    admin: ['approved', 'rejected', 'published', 'draft'],
  },
  approved: {
    author: [],
    editor: ['published', 'draft'],
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
}) => {
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
    throw new Error('Workflow: cannot change status without an authenticated user role.');
  }

  const allowed = transitions[oldStatus]?.[role] || [];
  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Workflow: ${role} cannot move from "${oldStatus}" to "${newStatus}".`,
    );
  }

  // Stamp review metadata when moving into review.
  if (newStatus === 'in_review') {
    const user = req.user as UserRecord | undefined;
    data.reviewedBy = user?.id || null;
    data.reviewedAt = new Date().toISOString();
  }

  // Stamp approval metadata.
  if (newStatus === 'approved' || newStatus === 'published') {
    const reviewSummary = readTrimmedString(data.reviewSummary);
    if (reviewSummary.length < 10) {
      throw new Error(
        'Workflow: reviewSummary must contain at least 10 characters before approval/publish.',
      );
    }

    if (data.reviewChecklistComplete !== true) {
      throw new Error(
        'Workflow: reviewChecklistComplete must be confirmed before approval/publish.',
      );
    }

    const user = req.user as UserRecord | undefined;
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
    const adminEmail = process.env.WORKFLOW_NOTIFY_EMAIL || process.env.RESEND_FROM_EMAIL;
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
