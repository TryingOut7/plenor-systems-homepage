'use client';

import { useAuth } from '@payloadcms/ui';
import type { DefaultCellComponentProps } from 'payload';
import { useState } from 'react';
import {
  createDraftFromPlaygroundClient,
  type DraftSourceCollection,
  openDraftDocumentInAdmin,
} from './createPresetClient';
import { canRunCollectionAction } from './permissionUtils';

type UserRecord = {
  role?: unknown;
};

function readRowId(rowData: unknown): string {
  if (!rowData || typeof rowData !== 'object') return '';
  const id = (rowData as Record<string, unknown>).id;
  if (typeof id === 'string' || typeof id === 'number') return String(id);
  return '';
}

function readRowTitle(rowData: unknown): string {
  if (!rowData || typeof rowData !== 'object') return 'Untitled';
  const record = rowData as Record<string, unknown>;
  if (typeof record.title === 'string' && record.title.trim()) return record.title.trim();
  if (typeof record.name === 'string' && record.name.trim()) return record.name.trim();
  return 'Untitled';
}

function resolveSourceCollectionFromField(field: unknown): DraftSourceCollection | null {
  if (!field || typeof field !== 'object') return null;
  const custom = (field as Record<string, unknown>).custom;
  if (!custom || typeof custom !== 'object') return null;

  const sourceCollection = (custom as Record<string, unknown>).draftSourceCollection;
  if (sourceCollection === 'page-playgrounds' || sourceCollection === 'page-presets') {
    return sourceCollection;
  }

  return null;
}

const CreateDraftFromRowCell = ({ collectionSlug, field, rowData }: DefaultCellComponentProps) => {
  const { permissions, user } = useAuth<UserRecord>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sourceCollection: DraftSourceCollection | null = resolveSourceCollectionFromField(field) ??
    (collectionSlug === 'page-playgrounds' || collectionSlug === 'page-presets'
      ? collectionSlug
      : null);
  const sourceId = readRowId(rowData);
  const canCreate = canRunCollectionAction({
    collectionSlug: 'page-drafts',
    operation: 'create',
    permissions,
    user,
    allowedRoles: ['admin', 'editor', 'author'],
  });

  if (!canCreate || !sourceCollection || !sourceId) return null;

  return (
    <button
      type="button"
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (isSubmitting) return;

        try {
          setIsSubmitting(true);
          const draft = await createDraftFromPlaygroundClient({
            sourceCollection,
            sourceId,
            sourceTitle: readRowTitle(rowData),
          });
          openDraftDocumentInAdmin(draft.id);
        } catch (error) {
          if (error instanceof Error && error.message === 'Draft creation cancelled.') return;
          window.alert(error instanceof Error ? error.message : 'Failed to create draft.');
        } finally {
          setIsSubmitting(false);
        }
      }}
      disabled={isSubmitting}
      style={{
        border: '1px solid #CBD5E1',
        background: '#FFFFFF',
        color: '#0F172A',
        borderRadius: '6px',
        padding: '5px 8px',
        fontSize: '11px',
        fontWeight: 600,
        cursor: isSubmitting ? 'not-allowed' : 'pointer',
        opacity: isSubmitting ? 0.65 : 1,
      }}
    >
      {isSubmitting ? 'Creating…' : 'Create Draft'}
    </button>
  );
};

export default CreateDraftFromRowCell;
