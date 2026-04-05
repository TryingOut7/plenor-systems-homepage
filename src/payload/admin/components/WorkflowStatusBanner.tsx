'use client';

import { useAuth, useField } from '@payloadcms/ui';
import type { FieldLabelClientComponent } from 'payload';
import { useCallback, useState } from 'react';

type StatusTone = {
  title: string;
  body: string;
  border: string;
  background: string;
  text: string;
};

const STATUS_TONES: Record<string, StatusTone> = {
  draft: {
    title: 'This is a draft',
    body: 'Only CMS users can see these changes until the page is moved to live.',
    border: '#94A3B8',
    background: '#F8FAFC',
    text: '#334155',
  },
  in_review: {
    title: 'Waiting for editor review',
    body: 'Editors/admins can now approve or request changes.',
    border: '#2563EB',
    background: '#EFF6FF',
    text: '#1E40AF',
  },
  approved: {
    title: 'Approved and ready to go live',
    body: 'An admin can now publish this item.',
    border: '#0F766E',
    background: '#ECFDF5',
    text: '#065F46',
  },
  rejected: {
    title: 'Changes requested',
    body: 'Please review feedback, update content, and resubmit for review.',
    border: '#B91C1C',
    background: '#FEF2F2',
    text: '#991B1B',
  },
  published: {
    title: 'This item is live',
    body: 'Public visitors can see this content.',
    border: '#15803D',
    background: '#F0FDF4',
    text: '#166534',
  },
};

const WorkflowStatusBanner: FieldLabelClientComponent = (props) => {
  const data = (props as { data?: Record<string, unknown> }).data || {};
  const { user } = useAuth();
  const { formProcessing, setValue, value } = useField<string>({ path: 'workflowStatus' });
  const [queuedForReview, setQueuedForReview] = useState(false);

  const status = typeof value === 'string'
    ? value
    : (typeof data.workflowStatus === 'string' ? data.workflowStatus : 'draft');
  const rejectionReason =
    status === 'rejected' && typeof data.rejectionReason === 'string'
      ? data.rejectionReason.trim()
      : '';
  const role = typeof user === 'object' && user && 'role' in user
    ? String((user as Record<string, unknown>).role || '')
    : '';
  const canSubmitForReview = role === 'author' && status === 'draft';

  const tone = STATUS_TONES[status] || STATUS_TONES.draft;

  const handleSubmitForReview = useCallback(() => {
    const shouldSubmit = window.confirm(
      'Send this draft to editors for review now? You can still make changes later if needed.',
    );

    if (!shouldSubmit) return;

    setValue('in_review');
    setQueuedForReview(true);
  }, [setValue]);

  return (
    <div
      style={{
        margin: '8px 0 10px',
        padding: '10px 12px',
        border: `1px solid ${tone.border}55`,
        borderRadius: '8px',
        background: tone.background,
      }}
      aria-live="polite"
    >
      <strong style={{ display: 'block', color: tone.text, marginBottom: '4px' }}>{tone.title}</strong>
      <span style={{ color: tone.text, fontSize: '12px', lineHeight: 1.5 }}>{tone.body}</span>
      {canSubmitForReview ? (
        <div style={{ marginTop: '8px' }}>
          <button
            type="button"
            disabled={formProcessing}
            onClick={handleSubmitForReview}
            style={{
              border: '1px solid #2563EB',
              background: '#2563EB',
              color: '#FFFFFF',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: formProcessing ? 'not-allowed' : 'pointer',
              opacity: formProcessing ? 0.6 : 1,
            }}
          >
            Submit for review
          </button>
          <div style={{ marginTop: '5px', color: '#1E40AF', fontSize: '12px', lineHeight: 1.4 }}>
            Save your changes after clicking this button to send the item for review.
          </div>
        </div>
      ) : null}
      {queuedForReview && status === 'in_review' ? (
        <div style={{ marginTop: '8px', color: '#1E40AF', fontSize: '12px', lineHeight: 1.45 }}>
          Review request queued. Save to finalize submission.
        </div>
      ) : null}
      {rejectionReason ? (
        <div
          style={{
            marginTop: '8px',
            padding: '8px 10px',
            borderRadius: '6px',
            background: '#FFFFFF',
            border: '1px solid #FCA5A5',
            color: '#7F1D1D',
            fontSize: '12px',
            lineHeight: 1.5,
          }}
        >
          <strong style={{ display: 'block', marginBottom: '2px' }}>Editor feedback</strong>
          {rejectionReason}
        </div>
      ) : null}
    </div>
  );
};

export default WorkflowStatusBanner;
