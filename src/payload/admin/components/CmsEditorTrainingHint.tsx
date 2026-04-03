'use client';

import type { FieldLabelClientComponent } from 'payload';

const CmsEditorTrainingHint: FieldLabelClientComponent = () => {
  return (
    <details
      style={{
        marginBottom: '10px',
        border: '1px solid #E2E8F0',
        borderRadius: '6px',
        background: '#F8FAFC',
        padding: '8px 10px',
      }}
    >
      <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#0F172A' }}>
        Editor guidance
      </summary>
      <ul style={{ margin: '8px 0 0 18px', color: '#334155', fontSize: '12px', lineHeight: 1.5 }}>
        <li>Use existing preset section order and avoid replacing block types on core pages.</li>
        <li>Prefer updating copy and links before changing layout controls.</li>
        <li>Use reusable sections for repeatable content patterns across pages.</li>
      </ul>
    </details>
  );
};

export default CmsEditorTrainingHint;
