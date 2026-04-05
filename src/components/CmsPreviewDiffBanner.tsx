import React from 'react';

type PreviewDiffSummary = {
  status?: string;
  missingStructuralKeys?: unknown;
  unexpectedStructuralKeys?: unknown;
  blockTypeMismatches?: unknown;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function asMismatchArray(value: unknown): Array<{ structuralKey: string; expectedBlockType: string; actualBlockType: string }> {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const record = entry as Record<string, unknown>;
      return {
        structuralKey: typeof record.structuralKey === 'string' ? record.structuralKey : '',
        expectedBlockType:
          typeof record.expectedBlockType === 'string' ? record.expectedBlockType : '',
        actualBlockType: typeof record.actualBlockType === 'string' ? record.actualBlockType : '',
      };
    })
    .filter((entry): entry is { structuralKey: string; expectedBlockType: string; actualBlockType: string } =>
      !!entry && !!entry.structuralKey,
    );
}

export default function CmsPreviewDiffBanner({ summary }: { summary?: unknown }) {
  const data = summary && typeof summary === 'object' ? (summary as PreviewDiffSummary) : {};
  if (data.status !== 'drift_detected') return null;

  const missing = asStringArray(data.missingStructuralKeys);
  const unexpected = asStringArray(data.unexpectedStructuralKeys);
  const mismatches = asMismatchArray(data.blockTypeMismatches);

  return (
    <aside
      style={{
        margin: '0 auto',
        maxWidth: '1200px',
        border: '1px solid #F59E0B',
        background: '#FFFBEB',
        color: '#92400E',
        borderRadius: '8px',
        padding: '12px 14px',
      }}
      aria-live="polite"
    >
      <strong style={{ display: 'block', marginBottom: '4px' }}>
        Preview QA diff detected
      </strong>
      <p style={{ margin: 0, fontSize: '13px' }}>
        Template drift found for this preset page.
      </p>
      {missing.length > 0 ? (
        <p style={{ margin: '6px 0 0', fontSize: '12px' }}>
          Missing keys: {missing.join(', ')}
        </p>
      ) : null}
      {unexpected.length > 0 ? (
        <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
          Unexpected keys: {unexpected.join(', ')}
        </p>
      ) : null}
      {mismatches.length > 0 ? (
        <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
          Block mismatches: {mismatches.map((item) => `${item.structuralKey}(${item.expectedBlockType}→${item.actualBlockType})`).join(', ')}
        </p>
      ) : null}
    </aside>
  );
}
