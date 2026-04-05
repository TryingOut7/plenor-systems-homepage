'use client';

import type { FieldLabelClientComponent } from 'payload';

const corePresetKeys = new Set(['home', 'services', 'about', 'pricing', 'contact']);

const CmsEditorTrainingHint: FieldLabelClientComponent = (props) => {
  const data = (props as { data?: Record<string, unknown> }).data;
  const presetKey = typeof data?.presetKey === 'string' ? data.presetKey : 'custom';
  const presetLocked = corePresetKeys.has(presetKey) || data?.sectionsLocked === true;

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
      {presetLocked ? (
        <div
          style={{
            margin: '8px 0 0',
            padding: '8px 10px',
            border: '1px solid #F59E0B55',
            borderRadius: '6px',
            background: '#FFFBEB',
            color: '#92400E',
            fontSize: '12px',
            lineHeight: 1.45,
          }}
        >
          This page uses a fixed preset layout. You can edit text and media inside sections, but section structure is locked and managed automatically.
        </div>
      ) : null}
      {presetLocked ? (
        <style>
          {`
            .blocks-field > .blocks-field__drawer-toggler {
              display: none !important;
            }

            .blocks-field__rows > .blocks-field__row > .collapsible > .collapsible__toggle-wrap .array-actions,
            .blocks-field__rows > .blocks-field__row > .collapsible > .collapsible__toggle-wrap .collapsible__drag {
              display: none !important;
            }
          `}
        </style>
      ) : null}
      <ul style={{ margin: '8px 0 0 18px', color: '#334155', fontSize: '12px', lineHeight: 1.5 }}>
        <li>Use existing preset section order and avoid replacing block types on core pages.</li>
        <li>Prefer updating copy and links before changing layout controls.</li>
        <li>Create forms in Forms first, then use Form Embed sections to place them on pages.</li>
        <li>Use reusable sections for repeatable content patterns across pages.</li>
      </ul>
    </details>
  );
};

export default CmsEditorTrainingHint;
