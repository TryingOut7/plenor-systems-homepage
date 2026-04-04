'use client';

import { useAuth, useDocumentInfo } from '@payloadcms/ui';
import type { BeforeDocumentControlsClientProps } from 'payload';
import { useMemo, useState } from 'react';
import {
  createPresetFromSourceClient,
  openPresetDocumentInAdmin,
  type SourceCollection,
} from './createPresetClient';

type UserRecord = {
  role?: unknown;
};

function resolveSupportedSourceCollection(slug: unknown): null | SourceCollection {
  if (slug === 'site-pages' || slug === 'page-drafts' || slug === 'page-playgrounds') {
    return slug;
  }
  return null;
}

function readTitle(data: unknown): string {
  if (!data || typeof data !== 'object') return 'Untitled';
  const record = data as Record<string, unknown>;
  if (typeof record.title === 'string' && record.title.trim()) return record.title.trim();
  if (typeof record.name === 'string' && record.name.trim()) return record.name.trim();
  return 'Untitled';
}

const CreatePresetFromDocumentButton = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _props: BeforeDocumentControlsClientProps,
) => {
  const { user } = useAuth<UserRecord>();
  const { id, data, docConfig } = useDocumentInfo();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sourceCollection = useMemo(
    () => resolveSupportedSourceCollection(docConfig?.slug),
    [docConfig?.slug],
  );

  const userRole = typeof user?.role === 'string' ? user.role : '';
  const canCreatePreset = userRole === 'admin' || userRole === 'editor';

  if (!canCreatePreset || !sourceCollection || !id) return null;

  const handleCreatePreset = async () => {
    try {
      setIsSubmitting(true);
      const preset = await createPresetFromSourceClient({
        sourceCollection,
        sourceId: String(id),
        sourceTitle: readTitle(data),
        descriptionSeed:
          sourceCollection === 'page-drafts' &&
          data &&
          typeof data === 'object' &&
          typeof (data as Record<string, unknown>).editorNotes === 'string'
            ? String((data as Record<string, unknown>).editorNotes)
            : '',
      });
      openPresetDocumentInAdmin(preset.id);
    } catch (error) {
      if (error instanceof Error && error.message === 'Preset creation cancelled.') return;
      window.alert(error instanceof Error ? error.message : 'Failed to create preset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCreatePreset}
      disabled={isSubmitting}
      style={{
        border: '1px solid #CBD5E1',
        background: '#FFFFFF',
        color: '#0F172A',
        borderRadius: '6px',
        padding: '7px 10px',
        fontSize: '12px',
        fontWeight: 600,
        cursor: isSubmitting ? 'not-allowed' : 'pointer',
        opacity: isSubmitting ? 0.65 : 1,
      }}
    >
      {isSubmitting ? 'Creating Preset…' : 'Create Preset'}
    </button>
  );
};

export default CreatePresetFromDocumentButton;
