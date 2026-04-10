'use client';

import { useAuth } from '@payloadcms/ui';
import type { BeforeListClientProps } from 'payload';
import { useState } from 'react';
import { canRunCollectionAction } from './permissionUtils';

type UserRecord = {
  role?: unknown;
};

type TemplateOption = {
  key: 'guide' | 'inquiry';
  label: string;
};

const TEMPLATE_OPTIONS: TemplateOption[] = [
  { key: 'guide', label: 'Guide Template' },
  { key: 'inquiry', label: 'Inquiry Template' },
];

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

function openFormDocumentInAdmin(formId: number | string): void {
  const basePath = resolveAdminBasePath();
  window.location.assign(
    `${basePath}/collections/forms/${encodeURIComponent(String(formId))}`,
  );
}

const CreateFormTemplateActions = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _props: BeforeListClientProps,
) => {
  const { permissions, user } = useAuth<UserRecord>();
  const [submittingKey, setSubmittingKey] = useState<null | 'guide' | 'inquiry'>(null);

  const canCreate = canRunCollectionAction({
    collectionSlug: 'forms',
    operation: 'create',
    permissions,
    user,
    allowedRoles: ['admin', 'editor', 'author'],
  });

  if (!canCreate) return null;

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: '12px',
      }}
    >
      <span
        style={{
          fontSize: '12px',
          color: '#475569',
          fontWeight: 600,
          marginRight: '4px',
        }}
      >
        Quick Templates:
      </span>
      {TEMPLATE_OPTIONS.map((template) => {
        const isSubmitting = submittingKey === template.key;
        return (
          <button
            key={template.key}
            type="button"
            onClick={async () => {
              if (submittingKey) return;

              try {
                setSubmittingKey(template.key);
                const response = await fetch('/api/forms/templates/create', {
                  method: 'POST',
                  headers: {
                    'content-type': 'application/json',
                  },
                  credentials: 'same-origin',
                  body: JSON.stringify({ templateKey: template.key }),
                });

                const json = await response.json().catch(() => ({}));
                if (!response.ok) {
                  const message = typeof json?.message === 'string'
                    ? json.message
                    : 'Failed to create form template.';
                  throw new Error(message);
                }

                const form = json?.form;
                const formId = form?.id;
                if (typeof formId !== 'string' && typeof formId !== 'number') {
                  throw new Error('Form template API response is missing form id.');
                }

                openFormDocumentInAdmin(formId);
              } catch (error) {
                window.alert(error instanceof Error ? error.message : 'Failed to create form template.');
              } finally {
                setSubmittingKey(null);
              }
            }}
            disabled={Boolean(submittingKey)}
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
            {isSubmitting ? 'Creating…' : template.label}
          </button>
        );
      })}
    </div>
  );
};

export default CreateFormTemplateActions;
