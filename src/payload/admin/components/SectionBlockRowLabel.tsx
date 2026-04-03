'use client';

import React from 'react';

type BlockLabelProps = {
  rowLabel?: string;
  data?: Record<string, unknown>;
};

const corePresetKeys = new Set(['home', 'services', 'about', 'pricing', 'contact']);

const SectionBlockRowLabel: React.FC<BlockLabelProps> = ({ rowLabel, data }) => {
  const presetKey = typeof data?.presetKey === 'string' ? data.presetKey : 'custom';
  const isLockedLayout = corePresetKeys.has(presetKey);

  return (
    <span style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
      <span>{rowLabel || 'Section'}</span>
      {isLockedLayout ? (
        <span
          style={{
            fontSize: '11px',
            lineHeight: 1,
            padding: '3px 6px',
            borderRadius: '999px',
            border: '1px solid #F59E0B66',
            background: '#FFFBEB',
            color: '#92400E',
            fontWeight: 600,
          }}
        >
          Locked
        </span>
      ) : null}
    </span>
  );
};

export default SectionBlockRowLabel;
