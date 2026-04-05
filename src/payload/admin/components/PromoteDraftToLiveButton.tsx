'use client';

import { useAuth, useDocumentInfo } from '@payloadcms/ui';
import type { BeforeDocumentControlsClientProps } from 'payload';
import { useState } from 'react';
import { canRunCollectionAction } from './permissionUtils';

type UserRecord = {
  role?: unknown;
};

function resolveAdminBasePath(): string {
  const path = window.location.pathname;
  const markers = ['/collections/', '/globals/'];

  for (const marker of markers) {
    const markerIndex = path.indexOf(marker);
    if (markerIndex > 0) {
      return path.slice(0, markerIndex);
    }
  }

  return '/admin';
}

const PromoteDraftToLiveButton = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _props: BeforeDocumentControlsClientProps,
) => {
  const { permissions, user } = useAuth<UserRecord>();
  const { id, docConfig } = useDocumentInfo();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canPromote = canRunCollectionAction({
    collectionSlug: 'site-pages',
    operation: 'update',
    permissions,
    user,
    allowedRoles: ['admin', 'editor'],
  });

  if (!canPromote || docConfig?.slug !== 'page-drafts' || !id) return null;

  const handlePromote = async () => {
    const confirmed = window.confirm(
      'Promote this draft to a live page? If a page with the target slug already exists, its content will be updated.',
    );
    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `/api/pages/drafts/${encodeURIComponent(String(id))}/promote-to-live`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          credentials: 'same-origin',
        },
      );

      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = typeof json?.message === 'string' ? json.message : 'Failed to promote draft.';
        window.alert(message);
        return;
      }

      const livePage = json.livePage as Record<string, unknown> | undefined;
      const liveId = livePage?.id as string | number | undefined;

      if (liveId) {
        const basePath = resolveAdminBasePath();
        window.location.assign(
          `${basePath}/collections/site-pages/${encodeURIComponent(String(liveId))}`,
        );
      } else {
        window.alert('Draft promoted successfully.');
        window.location.reload();
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Failed to promote draft.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePromote}
      disabled={isSubmitting}
      style={{
        border: '1px solid #2563EB',
        background: '#2563EB',
        color: '#FFFFFF',
        borderRadius: '6px',
        padding: '7px 10px',
        fontSize: '12px',
        fontWeight: 600,
        cursor: isSubmitting ? 'not-allowed' : 'pointer',
        opacity: isSubmitting ? 0.65 : 1,
      }}
    >
      {isSubmitting ? 'Promoting…' : 'Promote to Live'}
    </button>
  );
};

export default PromoteDraftToLiveButton;
