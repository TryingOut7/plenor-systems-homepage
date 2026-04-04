'use client';

import { useAuth, useDocumentInfo } from '@payloadcms/ui';
import type { BeforeDocumentControlsClientProps } from 'payload';
import { useState } from 'react';
import {
  createDraftFromPlaygroundClient,
  openDraftDocumentInAdmin,
} from './createPresetClient';

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

const CreateDraftFromDocumentButton = (_props: BeforeDocumentControlsClientProps) => {
  const { user } = useAuth<UserRecord>();
  const { id, data, docConfig } = useDocumentInfo();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userRole = typeof user?.role === 'string' ? user.role : '';
  const canCreate = userRole === 'admin' || userRole === 'editor' || userRole === 'author';

  if (!canCreate || docConfig?.slug !== 'page-playgrounds' || !id) return null;

  const handleCreateDraft = async () => {
    try {
      setIsSubmitting(true);
      const draft = await createDraftFromPlaygroundClient({
        playgroundId: String(id),
        playgroundName: readTitle(data),
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
