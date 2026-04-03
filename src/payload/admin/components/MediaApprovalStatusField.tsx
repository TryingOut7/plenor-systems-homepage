'use client';

import { FieldLabel, useField } from '@payloadcms/ui';
import type { SelectFieldClientComponent } from 'payload';

type MediaApprovalStatus = 'approved' | 'pending' | 'restricted';

const STATUS_META: Record<MediaApprovalStatus, { bg: string; border: string; text: string; label: string }> = {
  pending: {
    bg: '#FFFBEB',
    border: '#FDE68A',
    text: '#92400E',
    label: 'Pending Review',
  },
  approved: {
    bg: '#ECFDF5',
    border: '#86EFAC',
    text: '#166534',
    label: 'Approved',
  },
  restricted: {
    bg: '#FEF2F2',
    border: '#FCA5A5',
    text: '#991B1B',
    label: 'Restricted',
  },
};

const MediaApprovalStatusField: SelectFieldClientComponent = (props) => {
  const { value } = useField<string>({ path: props.path });

  const status: MediaApprovalStatus =
    value === 'approved' || value === 'restricted' ? value : 'pending';
  const meta = STATUS_META[status];

  return (
    <div style={{ marginBottom: 'var(--spacing-field, 1rem)' }}>
      <FieldLabel label={props?.field?.label || 'Approval Status'} path={props.path} />
      <div
        style={{
          marginTop: '6px',
          display: 'inline-flex',
          alignItems: 'center',
          borderRadius: '999px',
          border: `1px solid ${meta.border}`,
          background: meta.bg,
          color: meta.text,
          fontSize: '12px',
          fontWeight: 600,
          lineHeight: 1,
          padding: '7px 10px',
        }}
      >
        {meta.label}
      </div>
      <div style={{ marginTop: '6px', color: '#475569', fontSize: '12px', lineHeight: 1.45 }}>
        Controlled by media governance checks and reviewer actions.
      </div>
    </div>
  );
};

export default MediaApprovalStatusField;
