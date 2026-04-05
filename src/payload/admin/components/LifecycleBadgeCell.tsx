'use client';

import type { DefaultCellComponentProps } from 'payload';

type BadgeMeta = {
  background: string;
  border: string;
  label: string;
  text: string;
};

const STATUS_META: Record<string, BadgeMeta> = {
  draft: {
    label: 'DRAFT',
    background: '#F8FAFC',
    border: '#CBD5E1',
    text: '#334155',
  },
  in_review: {
    label: 'IN REVIEW',
    background: '#EFF6FF',
    border: '#93C5FD',
    text: '#1D4ED8',
  },
  approved: {
    label: 'APPROVED',
    background: '#ECFEFF',
    border: '#67E8F9',
    text: '#0E7490',
  },
  rejected: {
    label: 'REJECTED',
    background: '#FEF2F2',
    border: '#FCA5A5',
    text: '#B91C1C',
  },
  published: {
    label: 'LIVE',
    background: '#ECFDF5',
    border: '#86EFAC',
    text: '#166534',
  },
  promoted: {
    label: 'PROMOTED',
    background: '#F0FDF4',
    border: '#86EFAC',
    text: '#166534',
  },
};

const LifecycleBadgeCell = ({ collectionSlug, rowData }: DefaultCellComponentProps) => {
  const workflowStatus =
    rowData && typeof rowData === 'object' && typeof rowData.workflowStatus === 'string'
      ? rowData.workflowStatus
      : '';

  const resolvedKey =
    workflowStatus === 'published' && collectionSlug === 'page-drafts'
      ? 'promoted'
      : workflowStatus;

  const meta = STATUS_META[resolvedKey];
  if (!meta) return null;

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
};

export default LifecycleBadgeCell;
