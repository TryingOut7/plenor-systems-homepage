'use client';

import React from 'react';
import { getSectionSingularLabel } from '../../blocks/sectionUiMeta.ts';

type BlockLabelProps = {
  blockType?: string;
  rowLabel?: string;
  data?: Record<string, unknown>;
};

const corePresetKeys = new Set(['home', 'services', 'about', 'pricing', 'contact']);

function readDisplayLabel(blockType: string | undefined, rowLabel: string | undefined): string {
  const preferred = getSectionSingularLabel(blockType, '');
  if (preferred) return preferred;

  const trimmedRowLabel = typeof rowLabel === 'string' ? rowLabel.trim() : '';
  if (trimmedRowLabel && trimmedRowLabel.toLowerCase() !== 'section') return trimmedRowLabel;

  return 'Section';
}

const SectionBlockRowLabel: React.FC<BlockLabelProps> = ({ blockType, rowLabel, data }) => {
  const presetKey = typeof data?.presetKey === 'string' ? data.presetKey : 'custom';
  const isLockedLayout = corePresetKeys.has(presetKey);
  const displayLabel = readDisplayLabel(blockType, rowLabel);

  return (
    <span style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
      <span>{displayLabel}</span>
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
