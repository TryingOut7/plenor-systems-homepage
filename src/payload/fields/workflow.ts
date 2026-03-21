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
  label: 'Workflow',
  type: 'select',
  defaultValue: 'draft',
  options: [
    { label: 'Draft', value: 'draft' },
    { label: 'Submit for Review', value: 'in_review' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected — Needs Revision', value: 'rejected' },
    { label: 'Published', value: 'published' },
  ],
  admin: {
    position: 'sidebar',
    description:
      'Authors: set to "Submit for Review" when ready. Editors: approve or reject. Admins: publish.',
  },
};

export const workflowApprovalFields: Field[] = [
  {
    name: 'approvedBy',
    type: 'relationship',
    relationTo: 'users',
    admin: {
      position: 'sidebar',
      readOnly: true,
      condition: (data) => data?.workflowStatus === 'approved' || data?.workflowStatus === 'published',
    },
  },
  {
    name: 'approvedAt',
    type: 'date',
    admin: {
      position: 'sidebar',
      readOnly: true,
      condition: (data) => data?.workflowStatus === 'approved' || data?.workflowStatus === 'published',
    },
  },
  {
    name: 'rejectionReason',
    type: 'textarea',
    admin: {
      position: 'sidebar',
      condition: (data) => data?.workflowStatus === 'rejected',
      description: 'Reason for rejection (visible to the author).',
    },
  },
];
