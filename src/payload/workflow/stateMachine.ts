export const workflowStatuses = [
  'draft',
  'in_review',
  'approved',
  'rejected',
  'published',
] as const;

export type WorkflowStatus = (typeof workflowStatuses)[number];

export const workflowRoles = ['author', 'editor', 'admin'] as const;
export type WorkflowRole = (typeof workflowRoles)[number];

const WORKFLOW_STATUS_SET = new Set<string>(workflowStatuses);
const WORKFLOW_ROLE_SET = new Set<string>(workflowRoles);

/**
 * Allowed state transitions per role.
 * Each key is a "from" status mapping to which statuses each role may move to.
 */
export const workflowTransitions: Record<WorkflowStatus, Partial<Record<WorkflowRole, WorkflowStatus[]>>> = {
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

function dedupeStatuses(statuses: WorkflowStatus[]): WorkflowStatus[] {
  return [...new Set(statuses)];
}

export function resolveWorkflowRole(value: unknown): WorkflowRole | null {
  if (typeof value !== 'string') return null;
  return WORKFLOW_ROLE_SET.has(value) ? (value as WorkflowRole) : null;
}

export function normalizeWorkflowStatus(
  value: unknown,
  fallback: WorkflowStatus = 'draft',
): WorkflowStatus {
  if (typeof value !== 'string') return fallback;
  return WORKFLOW_STATUS_SET.has(value) ? (value as WorkflowStatus) : fallback;
}

export function getAllowedWorkflowTransitions(args: {
  fromStatus: WorkflowStatus;
  role: WorkflowRole;
  allowEditorPublish?: boolean;
}): WorkflowStatus[] {
  const { fromStatus, role, allowEditorPublish = false } = args;
  const base = workflowTransitions[fromStatus]?.[role] || [];

  if (role !== 'editor' || !allowEditorPublish) return base;

  const adminTransitions = workflowTransitions[fromStatus]?.admin || [];
  if (!adminTransitions.includes('published')) return base;

  return dedupeStatuses([...base, 'published']);
}

/**
 * Returns statuses the user can meaningfully choose in the current document context:
 * always include the current status, then add allowed transitions from that state.
 */
export function getAllowedWorkflowStatusesForDocument(args: {
  currentStatus: WorkflowStatus;
  role: WorkflowRole;
  allowEditorPublish?: boolean;
}): WorkflowStatus[] {
  const { currentStatus, role, allowEditorPublish = false } = args;
  const allowed = getAllowedWorkflowTransitions({
    fromStatus: currentStatus,
    role,
    allowEditorPublish,
  });
  return [currentStatus, ...allowed.filter((status) => status !== currentStatus)];
}
