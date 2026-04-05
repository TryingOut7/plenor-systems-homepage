'use client';

import type { FieldLabelClientComponent } from 'payload';

type DiffSummary = {
  missingStructuralKeys?: unknown;
  unexpectedStructuralKeys?: unknown;
  blockTypeMismatches?: unknown;
};

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean);
}

function countArray(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

const SitePageQualityChecklistHint: FieldLabelClientComponent = (props) => {
  const data = (props as { data?: Record<string, unknown> }).data || {};
  const qualityLevel =
    typeof data.publishQualityLevel === 'string' ? data.publishQualityLevel : 'excellent';
  const qualityScore =
    typeof data.publishQualityScore === 'number' ? data.publishQualityScore : null;
  const diff = (data.previewDiffSummary || {}) as DiffSummary;

  const missing = asStringList(diff.missingStructuralKeys);
  const unexpected = asStringList(diff.unexpectedStructuralKeys);
  const mismatches = countArray(diff.blockTypeMismatches);

  const hasIssues = missing.length > 0 || unexpected.length > 0 || mismatches > 0;

  const tone =
    qualityLevel === 'blocked'
      ? { border: '#DC2626', background: '#FEF2F2', text: '#991B1B' }
      : qualityLevel === 'needs_attention'
        ? { border: '#D97706', background: '#FFFBEB', text: '#92400E' }
        : { border: '#16A34A', background: '#F0FDF4', text: '#166534' };

  const headline =
    qualityLevel === 'blocked'
      ? 'A few things need attention before this page can go live.'
      : qualityLevel === 'needs_attention'
        ? 'Quality checks found a few improvements worth fixing before publish.'
        : 'Quality checks look good.';

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
      <strong style={{ display: 'block', color: tone.text, marginBottom: '4px' }}>{headline}</strong>
      <span style={{ color: tone.text, fontSize: '12px', lineHeight: 1.5 }}>
        Score: {qualityScore ?? 'N/A'} · Status: {String(qualityLevel).replace(/_/g, ' ')}
      </span>
      {hasIssues ? (
        <ul style={{ margin: '8px 0 0 18px', color: tone.text, fontSize: '12px', lineHeight: 1.45 }}>
          {missing.map((key) => (
            <li key={`missing-${key}`}>Missing required section: {key}</li>
          ))}
          {unexpected.map((key) => (
            <li key={`unexpected-${key}`}>Unexpected section key: {key}</li>
          ))}
          {mismatches > 0 ? <li>Section type mismatch count: {mismatches}</li> : null}
        </ul>
      ) : null}
    </div>
  );
};

export default SitePageQualityChecklistHint;
