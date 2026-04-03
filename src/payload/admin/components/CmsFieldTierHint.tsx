'use client';

import type { FieldLabelClientComponent } from 'payload';

type FieldRecord = {
  custom?: {
    cmsTier?: 'routine' | 'advanced' | 'system';
  };
};

const TierHint: FieldLabelClientComponent = ({ field }) => {
  const resolvedField = (field || {}) as FieldRecord;
  const tier = resolvedField.custom?.cmsTier;

  if (tier === 'routine' || !tier) return null;

  const tone = tier === 'advanced' ? '#1D4ED8' : '#991B1B';
  const title = tier === 'advanced' ? 'Advanced field' : 'System field';
  const body =
    tier === 'advanced'
      ? 'Visible in advanced lane. Changes here can affect layout and presentation quality.'
      : 'Restricted to admins/trusted editors. Changes can impact redirects, indexing, and runtime behavior.';

  return (
    <div
      style={{
        margin: '8px 0 10px',
        padding: '8px 10px',
        border: `1px solid ${tone}33`,
        background: `${tone}12`,
        borderRadius: '6px',
        fontSize: '12px',
      }}
      aria-live="polite"
    >
      <strong style={{ color: tone, display: 'block', marginBottom: '2px' }}>{title}</strong>
      <span style={{ color: '#334155' }}>{body}</span>
    </div>
  );
};

export default TierHint;
