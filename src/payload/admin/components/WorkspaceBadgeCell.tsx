'use client';

import type { DefaultCellComponentProps } from 'payload';

type WorkspaceMeta = {
  label: string;
  background: string;
  border: string;
  text: string;
};

const WORKSPACE_META: Record<string, WorkspaceMeta> = {
  'site-pages': {
    label: 'LIVE',
    background: '#ECFDF5',
    border: '#86EFAC',
    text: '#166534',
  },
  'page-drafts': {
    label: 'DRAFT',
    background: '#EFF6FF',
    border: '#93C5FD',
    text: '#1D4ED8',
  },
  'page-presets': {
    label: 'PRESET',
    background: '#FAF5FF',
    border: '#D8B4FE',
    text: '#6B21A8',
  },
  'page-playgrounds': {
    label: 'PLAYGROUND',
    background: '#FFF7ED',
    border: '#FDBA74',
    text: '#9A3412',
  },
};

const WorkspaceBadgeCell = ({ collectionSlug }: DefaultCellComponentProps) => {
  const meta = WORKSPACE_META[collectionSlug];
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

export default WorkspaceBadgeCell;
