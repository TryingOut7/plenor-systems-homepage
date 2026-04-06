import type { Field } from 'payload';

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
 * - Only admins can move: approved → published
 * - rejected → draft (author revises and resubmits)
 */
export const workflowStatuses = [
  'draft',
  'in_review',
  'approved',
  'rejected',
  'published',
] as const;

export type WorkflowStatus = (typeof workflowStatuses)[number];

export const workflowStatusField: Field = {
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
  ],
  admin: {
    position: 'sidebar',
    description:
      'Authors: move to "Awaiting Review" when ready. Editors: approve/request changes. Admins: set to live.',
    components: {
      beforeInput: ['@/payload/admin/components/WorkflowStatusBanner'],
    },
  },
};

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
        const role = (req.user as Record<string, unknown> | undefined)?.role as string | undefined;
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
        const role = (req.user as Record<string, unknown> | undefined)?.role as string | undefined;
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
