'use client';

import { useAuth, useDocumentInfo } from '@payloadcms/ui';
import type { BeforeDocumentControlsClientProps } from 'payload';
import { useMemo, useState } from 'react';
import {
  createDraftFromPlaygroundClient,
  type DraftSourceCollection,
  openDraftDocumentInAdmin,
} from './createPresetClient';
import { canRunCollectionAction } from './permissionUtils';

type UserRecord = {
  role?: unknown;
};

function readTitle(data: unknown): string {
  if (!data || typeof data !== 'object') return 'Untitled';
  const record = data as Record<string, unknown>;
  if (typeof record.title === 'string' && record.title.trim()) return record.title.trim();
  if (typeof record.name === 'string' && record.name.trim()) return record.name.trim();
  return 'Untitled';
}

const CreateDraftFromDocumentButton = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _props: BeforeDocumentControlsClientProps,
) => {
  const { permissions, user } = useAuth<UserRecord>();
  const { id, data, docConfig } = useDocumentInfo();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sourceCollection = useMemo((): DraftSourceCollection | null => {
    if (docConfig?.slug === 'page-playgrounds') return 'page-playgrounds';
    if (docConfig?.slug === 'page-presets') return 'page-presets';
    return null;
  }, [docConfig?.slug]);

  const canCreate = canRunCollectionAction({
    collectionSlug: 'page-drafts',
    operation: 'create',
    permissions,
    user,
    allowedRoles: ['admin', 'editor', 'author'],
  });

  if (!canCreate || !sourceCollection || !id) return null;

  const handleCreateDraft = async () => {
    try {
      setIsSubmitting(true);
      const draft = await createDraftFromPlaygroundClient({
        sourceCollection,
        sourceId: String(id),
        sourceTitle: readTitle(data),
      });
      openDraftDocumentInAdmin(draft.id);
    } catch (error) {
      if (error instanceof Error && error.message === 'Draft creation cancelled.') return;
      window.alert(error instanceof Error ? error.message : 'Failed to create draft.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCreateDraft}
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
      {isSubmitting ? 'Creating Draft…' : 'Create Draft'}
    </button>
  );
};

export default CreateDraftFromDocumentButton;
