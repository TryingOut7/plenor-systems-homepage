'use client';

import { useAuth } from '@payloadcms/ui';
import type { DefaultCellComponentProps } from 'payload';
import { useState } from 'react';
import {
  createPresetFromSourceClient,
  openPresetDocumentInAdmin,
  type SourceCollection,
} from './createPresetClient';
import { canRunCollectionAction } from './permissionUtils';

type UserRecord = {
  role?: unknown;
};

function resolveSupportedSourceCollection(slug: unknown): null | SourceCollection {
  if (slug === 'site-pages' || slug === 'page-drafts' || slug === 'page-playgrounds') {
    return slug;
  }
  return null;
}

function resolveSourceCollectionFromField(field: unknown): null | SourceCollection {
  if (!field || typeof field !== 'object') return null;
  const custom = (field as Record<string, unknown>).custom;
  if (!custom || typeof custom !== 'object') return null;
  const sourceCollection = (custom as Record<string, unknown>).presetSourceCollection;
  return resolveSupportedSourceCollection(sourceCollection);
}

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

const CreatePresetFromRowCell = ({ collectionSlug, field, rowData }: DefaultCellComponentProps) => {
  const { permissions, user } = useAuth<UserRecord>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sourceCollection = resolveSourceCollectionFromField(field) ?? resolveSupportedSourceCollection(collectionSlug);
  const sourceId = readRowId(rowData);
  const canCreatePreset = canRunCollectionAction({
    collectionSlug: 'page-presets',
    operation: 'create',
    permissions,
    user,
    allowedRoles: ['admin', 'editor'],
  });

  if (!canCreatePreset || !sourceCollection || !sourceId) return null;

  return (
    <button
      type="button"
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (isSubmitting) return;

        try {
          setIsSubmitting(true);
          const preset = await createPresetFromSourceClient({
            sourceCollection,
            sourceId,
            sourceTitle: readRowTitle(rowData),
            descriptionSeed:
              sourceCollection === 'page-drafts' &&
              rowData &&
              typeof rowData === 'object' &&
              typeof (rowData as Record<string, unknown>).editorNotes === 'string'
                ? String((rowData as Record<string, unknown>).editorNotes)
                : '',
          });
          openPresetDocumentInAdmin(preset.id);
        } catch (error) {
          if (error instanceof Error && error.message === 'Preset creation cancelled.') return;
          window.alert(error instanceof Error ? error.message : 'Failed to create preset.');
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
      {isSubmitting ? 'Creating…' : 'Create Preset'}
    </button>
  );
};

export default CreatePresetFromRowCell;
