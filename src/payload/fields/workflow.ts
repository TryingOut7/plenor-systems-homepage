import type { Field } from 'payload';
import {
  getAllowedWorkflowStatusesForDocument,
  normalizeWorkflowStatus,
  resolveWorkflowRole,
  workflowStatuses,
  type WorkflowStatus,
} from '../workflow/stateMachine.ts';

/**
 * Workflow status values for content that needs editorial approval.
 *
 * State machine:
 *   draft → in_review → approved → published
 *                ↓           ↓
 *             rejected     (back to draft)
 *
 * - Authors can move: draft → in_review
 * - Editors/admins can move: in_review → approved | rejected
 * - Default policy: only admins can move approved → published
 * - Org-site policy: editors/admins can publish
 * - rejected → draft (author revises and resubmits)
 */
export { workflowStatuses, type WorkflowStatus };

type OptionLike = string | { label: string; value: string };
type WorkflowStatusFieldPolicy = {
  allowEditorPublish?: boolean;
  description?: string;
};

function toOptionValue(option: OptionLike): string {
  return typeof option === 'string' ? option : option.value;
}

function filterWorkflowStatusOptions(args: {
  data: Record<string, unknown> | undefined;
  options: OptionLike[];
  req: { user?: unknown } | undefined;
  siblingData: Record<string, unknown> | undefined;
  allowEditorPublish?: boolean;
}): OptionLike[] {
  const dataRecord = args.data && typeof args.data === 'object' ? args.data : {};
  const siblingRecord =
    args.siblingData && typeof args.siblingData === 'object' ? args.siblingData : {};
  const reqRecord = args.req && typeof args.req === 'object' ? args.req : {};
  const roleCandidate =
    reqRecord.user && typeof reqRecord.user === 'object'
      ? (reqRecord.user as Record<string, unknown>).role
      : undefined;
  const role = resolveWorkflowRole(roleCandidate);
  if (!role) return args.options;

  const rawStatus = siblingRecord.workflowStatus ?? dataRecord.workflowStatus;
  const currentStatus = normalizeWorkflowStatus(rawStatus, 'draft');
  const allowedStatuses = new Set<WorkflowStatus>(
    getAllowedWorkflowStatusesForDocument({
      role,
      currentStatus,
      allowEditorPublish: args.allowEditorPublish === true,
    }),
  );

  return args.options.filter((option) =>
    workflowStatuses.includes(toOptionValue(option) as WorkflowStatus) &&
    allowedStatuses.has(toOptionValue(option) as WorkflowStatus),
  );
}

function buildWorkflowStatusField(policy: WorkflowStatusFieldPolicy = {}): Field {
  const allowEditorPublish = policy.allowEditorPublish === true;

  return {
    name: 'workflowStatus',
    label: 'Content Status',
    type: 'select',
    defaultValue: 'draft',
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Awaiting Review', value: 'in_review' },
      { label: 'Approved', value: 'approved' },
      { label: 'Changes Requested', value: 'rejected' },
      { label: 'Live', value: 'published' },
      { label: 'Archived', value: 'archived' },
    ],
    filterOptions: ({ data, options, req, siblingData }) =>
      filterWorkflowStatusOptions({
        data,
        options: options as OptionLike[],
        req,
        siblingData,
        allowEditorPublish,
      }),
    admin: {
      position: 'sidebar',
      description:
        policy.description ||
        'Authors: move to "Awaiting Review" when ready. Editors: approve/request changes. Admins: set to live.',
      components: {
        beforeInput: ['@/payload/admin/components/WorkflowStatusBanner'],
      },
    },
  };
}

export const workflowStatusField: Field = buildWorkflowStatusField();
export const orgWorkflowStatusField: Field = buildWorkflowStatusField({
  allowEditorPublish: true,
  description:
    'Authors: move to "Awaiting Review" when ready. Editors: approve/request changes and set live. Admins can also set live.',
});

/**
 * Workflow status field for page drafts.
 * Identical state machine but the 'published' option is relabeled to
 * "Completed (Promoted)" so it is clear the draft itself is never live —
 * only the promoted site-page is.
 */
export const pageDraftWorkflowStatusField: Field = {
  name: 'workflowStatus',
  label: 'Editorial Status',
  type: 'select',
  defaultValue: 'draft',
  options: [
    { label: 'Draft', value: 'draft' },
    { label: 'Awaiting Review', value: 'in_review' },
    { label: 'Approved', value: 'approved' },
    { label: 'Changes Requested', value: 'rejected' },
    { label: 'Completed (Promoted)', value: 'published' },
  ],
  filterOptions: ({ data, options, req, siblingData }) =>
    filterWorkflowStatusOptions({
      data,
      options: options as OptionLike[],
      req,
      siblingData,
      allowEditorPublish: false,
    }),
  admin: {
    position: 'sidebar',
    description:
      'Authors: submit to "Awaiting Review" when ready. Editors: approve or request changes. Administrators: Use the "Promote to Live" button to publish. Lifecycle status changes to "Completed" automatically after promotion.',
    components: {
      beforeInput: ['@/payload/admin/components/WorkflowStatusBanner'],
    },
  },
};

export const workflowApprovalFields: Field[] = [
  {
    name: 'submittedBy',
    type: 'relationship',
    relationTo: 'users',
    access: {
      update: () => false,
    },
    admin: {
      position: 'sidebar',
      readOnly: true,
      condition: (data) =>
        data?.workflowStatus === 'in_review' ||
        data?.workflowStatus === 'approved' ||
        data?.workflowStatus === 'published' ||
        data?.workflowStatus === 'rejected',
    },
  },
  {
    name: 'submittedAt',
    type: 'date',
    access: {
      update: () => false,
    },
    admin: {
      position: 'sidebar',
      readOnly: true,
      condition: (data) =>
        data?.workflowStatus === 'in_review' ||
        data?.workflowStatus === 'approved' ||
        data?.workflowStatus === 'published' ||
        data?.workflowStatus === 'rejected',
    },
  },
  {
    name: 'reviewChecklistComplete',
    type: 'checkbox',
    defaultValue: false,
    access: {
      update: ({ req }) => {
        const role = (req.user as unknown as Record<string, unknown> | undefined)?.role as string | undefined;
        return role === 'admin' || role === 'editor';
      },
    },
    admin: {
      position: 'sidebar',
      condition: (data) =>
        data?.workflowStatus === 'in_review' ||
        data?.workflowStatus === 'approved' ||
        data?.workflowStatus === 'published',
      description: 'Editors/admins only: confirm the review checklist is complete before approving.',
    },
  },
  {
    name: 'reviewSummary',
    type: 'textarea',
    admin: {
      position: 'sidebar',
      condition: (data) =>
        data?.workflowStatus === 'in_review' ||
        data?.workflowStatus === 'approved' ||
        data?.workflowStatus === 'published',
      description: 'Reviewer notes summarizing quality checks and decision rationale.',
    },
  },
  {
    name: 'approvedBy',
    type: 'relationship',
    relationTo: 'users',
    access: {
      update: () => false,
    },
    admin: {
      position: 'sidebar',
      readOnly: true,
      condition: (data) => data?.workflowStatus === 'approved' || data?.workflowStatus === 'published',
    },
  },
  {
    name: 'approvedAt',
    type: 'date',
    access: {
      update: () => false,
    },
    admin: {
      position: 'sidebar',
      readOnly: true,
      condition: (data) => data?.workflowStatus === 'approved' || data?.workflowStatus === 'published',
    },
  },
  {
    name: 'rejectionReason',
    type: 'textarea',
    access: {
      update: ({ req }) => {
        const role = (req.user as unknown as Record<string, unknown> | undefined)?.role as string | undefined;
        return role === 'admin' || role === 'editor';
      },
    },
    admin: {
      position: 'sidebar',
      condition: (data) => data?.workflowStatus === 'rejected',
      description: 'Reason for rejection (visible to the author).',
    },
  },
];
