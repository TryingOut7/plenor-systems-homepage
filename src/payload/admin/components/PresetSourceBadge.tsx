'use client';

import { useDocumentInfo } from '@payloadcms/ui';
import type { DefaultCellComponentProps, UIFieldClientComponent } from 'payload';

type SourceMeta = {
  background: string;
  border: string;
  label: string;
  text: string;
};

const SOURCE_META: Record<string, SourceMeta> = {
  manual: {
    label: 'MANUAL',
    background: '#F8FAFC',
    border: '#CBD5E1',
    text: '#334155',
  },
  'from-live': {
    label: 'FROM LIVE',
    background: '#ECFDF5',
    border: '#86EFAC',
    text: '#166534',
  },
  'from-draft': {
    label: 'FROM DRAFT',
    background: '#EFF6FF',
    border: '#93C5FD',
    text: '#1D4ED8',
  },
};

function resolveSourceType(value: unknown): string {
  return typeof value === 'string' ? value : 'manual';
}

function renderBadge(sourceType: string) {
  const meta = SOURCE_META[sourceType] || SOURCE_META.manual;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '999px',
        border: `1px solid ${meta.border}`,
        background: meta.background,
        color: meta.text,
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.03em',
        lineHeight: 1,
        padding: '4px 8px',
        textTransform: 'uppercase',
      }}
    >
      {meta.label}
    </span>
  );
}

export const PresetSourceBadgeCell = ({ rowData }: DefaultCellComponentProps) => {
  const sourceType =
    rowData && typeof rowData === 'object'
      ? resolveSourceType((rowData as Record<string, unknown>).sourceType)
      : 'manual';
  return renderBadge(sourceType);
};

const PresetSourceBadgeField: UIFieldClientComponent = () => {
  const { data } = useDocumentInfo();
  const sourceType = resolveSourceType(
    data && typeof data === 'object' ? (data as Record<string, unknown>).sourceType : undefined,
  );

  return (
    <div style={{ marginBottom: 'var(--spacing-field, 1rem)' }}>
      <div style={{ marginBottom: '6px', color: '#334155', fontSize: '12px', fontWeight: 600 }}>
        Source Provenance
      </div>
      {renderBadge(sourceType)}
    </div>
  );
};

export default PresetSourceBadgeField;
